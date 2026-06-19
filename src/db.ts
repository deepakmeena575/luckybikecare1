import { ServiceRecord } from './types';
import { addMonths, format, startOfMonth } from 'date-fns';
import { supabase } from './lib/supabaseClient';

const STORAGE_KEY = 'lucky_bike_care_db';

export class DB {
  static async getRecords(): Promise<ServiceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .order('timestamp', { ascending: false });
        
      if (error) throw error;
      return (data || []) as ServiceRecord[];
    } catch (error: any) {
      console.error('Supabase getRecords error:', error);
      throw new Error(error.message || 'Error fetching records');
    }
  }

  static async saveRecords(records: ServiceRecord[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }

  static async addRecord(record: Omit<ServiceRecord, 'id' | 'timestamp' | 'nextServiceDate' | 'serviceCounter'>): Promise<ServiceRecord> {
    const records = await this.getRecords();
    
    // Auto-calculate service counter for this vehicle
    const vehicleRecords = records.filter(r => 
      r.vehicleNumber.toLowerCase() === record.vehicleNumber.toLowerCase()
    );
    const serviceCounter = vehicleRecords.length + 1;

    // Generate Invoice Number format: LBC-XXXX-YYYY
    const year = new Date().getFullYear();
    const id = `LBC-${String(records.length + 1).padStart(4, '0')}-${year}`;

    const timestamp = new Date().toISOString();
    const nextServiceDate = format(addMonths(new Date(record.dateOfService), 3), 'yyyy-MM-dd');

    const newRecord: ServiceRecord = {
      ...record,
      id,
      serviceCounter,
      timestamp,
      nextServiceDate,
    };

    try {
      const { error } = await supabase
        .from('service_records')
        .insert([newRecord]);
        
      if (error) throw error;
      return newRecord;
    } catch (error: any) {
      console.error('Supabase addRecord error:', error);
      throw new Error(error.message || 'Error adding record to Supabase');
    }
  }

  static async updateRecord(id: string, updates: Partial<ServiceRecord>): Promise<ServiceRecord> {
    try {
      const { data, error } = await supabase
        .from('service_records')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data as ServiceRecord;
    } catch (error: any) {
      console.error('Supabase updateRecord error', error);
      throw new Error(error.message || 'Record not found or update failed');
    }
  }

  static async deleteRecord(id: string) {
    try {
      const { error } = await supabase
        .from('service_records')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch(error: any) {
       console.error('Supabase delete error:', error);
       throw new Error(error.message || 'Delete failed');
    }
  }

  static async searchRecords(query: string): Promise<ServiceRecord[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    
    try {
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .or(`vehicleNumber.ilike.%${q}%,customerName.ilike.%${q}%,mobileNumber.ilike.%${q}%`)
        .order('dateOfService', { ascending: false });

      if (error) throw error;
      return (data || []) as ServiceRecord[];
    } catch(error: any) {
      console.error('Supabase search error:', error);
      throw new Error(error.message || 'Search failed');
    }
  }

  static async getHistoryByVehicle(vehicleNumber: string): Promise<ServiceRecord[]> {
    const q = vehicleNumber.toLowerCase().trim();
    try {
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .ilike('vehicleNumber', `%${q}%`)
        .order('dateOfService', { ascending: false });
        
      if (error) throw error;
      return (data || []) as ServiceRecord[];
    } catch (error: any) {
      console.error('Supabase getHistory error:', error);
      throw new Error(error.message || 'Error fetching history');
    }
  }

  static async getDashboardStats() {
    const records = await this.getRecords();
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    
    // Total Customers
    const uniqueCustomers = new Set(records.map(r => r.mobileNumber)).size;
    
    // Monthly Revenue
    const monthlyRevenue = records
      .filter(r => new Date(r.dateOfService) >= currentMonthStart)
      .reduce((sum, r) => sum + r.totalCost, 0);

    const pendingDues = records
      .filter(r => r.dueAmount > 0)
      .reduce((sum, r) => sum + r.dueAmount, 0);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const upcomingReminders = records.filter(r => {
      const nextDate = new Date(r.nextServiceDate);
      return nextDate >= now && nextDate <= thirtyDaysFromNow;
    });

    const recentRecords = records.slice(0, 5);

    return {
      totalCustomers: uniqueCustomers,
      totalServices: records.length,
      monthlyRevenue,
      pendingDuesTotal: pendingDues,
      upcomingRemindersCount: upcomingReminders.length,
      pendingDueRecords: records.filter(r => r.dueAmount > 0),
      upcomingReminderRecords: upcomingReminders,
      recentRecords
    };
  }
}
