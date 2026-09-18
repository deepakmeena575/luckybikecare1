import { ServiceRecord, ServiceReminderItem, ReminderCategory, VehicleQuickSearchResult, VehicleQuickSummaryData } from './types';
import { 
  addMonths, 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  startOfDay, 
  endOfDay, 
  addDays, 
  differenceInDays 
} from 'date-fns';
import { supabase } from './lib/supabaseClient';
import { 
  parseIsoDateOnly, 
  isRecordDeleted, 
  getRecordDeletedAt, 
  calculateTrashRetention,
  getVehicleRegistrationVariants 
} from './utils';
import { computeBusinessAnalytics, BusinessAnalyticsData } from './businessAnalytics';

export class DB {
  static async getRecords(includeDeleted: boolean = false): Promise<ServiceRecord[]> {
    try {
      let qBuilder = supabase
        .from('service_records')
        .select('*')
        .order('timestamp', { ascending: false });

      if (!includeDeleted) {
        qBuilder = qBuilder.or('reminderStatus.is.null,reminderStatus.not.ilike.DELETED%');
      }
        
      const { data, error } = await qBuilder;
      if (error) throw error;

      const records = (data || []) as ServiceRecord[];
      if (!includeDeleted) {
        return records.filter(r => !isRecordDeleted(r));
      }
      return records;
    } catch (error: any) {
      console.error('Database getRecords error:', error);
      throw new Error(error.message || 'Error fetching records');
    }
  }

  /**
   * Fetches all service records currently in Recently Deleted / Trash.
   */
  static async getDeletedRecords(): Promise<ServiceRecord[]> {
    try {
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .ilike('reminderStatus', 'DELETED%')
        .order('timestamp', { ascending: false });

      if (error) throw error;
      
      const records = ((data || []) as ServiceRecord[]).map(r => {
        const delAt = getRecordDeletedAt(r);
        return {
          ...r,
          deletedAt: delAt || r.timestamp
        };
      });

      // Sort by deleted timestamp descending (newest deletions first)
      records.sort((a, b) => {
        const timeA = new Date(a.deletedAt || a.timestamp).getTime();
        const timeB = new Date(b.deletedAt || b.timestamp).getTime();
        return timeB - timeA;
      });

      return records;
    } catch (error: any) {
      console.error('Database getDeletedRecords error:', error);
      throw new Error(error.message || 'Error fetching deleted records');
    }
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
    let maxIdNum = 0;
    records.forEach(r => {
      const parts = r.id.split('-');
      if (parts.length === 3 && parts[0] === 'LBC') {
        const num = parseInt(parts[1], 10);
        if (!isNaN(num) && num > maxIdNum) {
          maxIdNum = num;
        }
      }
    });
    const id = `LBC-${String(maxIdNum + 1).padStart(4, '0')}-${year}`;

    const timestamp = new Date().toISOString();
    // Use calendar month addition (+3 months) with midday parsing to avoid timezone date shifts
    const nextServiceDate = format(addMonths(parseIsoDateOnly(record.dateOfService), 3), 'yyyy-MM-dd');

    const newRecord: ServiceRecord = {
      ...record,
      id,
      serviceCounter,
      timestamp,
      nextServiceDate,
      reminderStatus: 'Not Sent',
      lastReminderSentDate: null,
    };

    try {
      const { error } = await supabase
        .from('service_records')
        .insert([newRecord]);
        
      if (error) throw error;
      return newRecord;
    } catch (error: any) {
      console.error('Database addRecord error:', error);
      throw new Error(error.message || 'Error adding record to database');
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
      console.error('Database updateRecord error', error);
      throw new Error(error.message || 'Record not found or update failed');
    }
  }

  /**
   * Soft deletes a record by moving it to Recently Deleted.
   * Preserves original record ID, vehicle number, amounts, and reminder status.
   */
  static async softDeleteRecord(id: string): Promise<ServiceRecord> {
    try {
      const nowIso = new Date().toISOString();
      const { data: existing, error: fetchErr } = await supabase
        .from('service_records')
        .select('reminderStatus')
        .eq('id', id)
        .single();
        
      if (fetchErr) throw fetchErr;

      const origStatus = existing?.reminderStatus && !existing.reminderStatus.startsWith('DELETED:')
        ? existing.reminderStatus
        : 'Not Sent';

      const newStatus = `DELETED:${nowIso}|${origStatus}`;

      const { data, error } = await supabase
        .from('service_records')
        .update({ reminderStatus: newStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ServiceRecord;
    } catch (error: any) {
      console.error('Database softDeleteRecord error:', error);
      throw new Error(error.message || 'Failed to move record to Recently Deleted');
    }
  }

  /**
   * Default delete handler: Moves the record to Recently Deleted (soft delete)
   * in adherence with the 90-day restore policy.
   */
  static async deleteRecord(id: string) {
    return this.softDeleteRecord(id);
  }

  /**
   * Restores a soft-deleted record back to active state.
   * Restores original record status and relationships without creating duplicates.
   */
  static async restoreRecord(id: string): Promise<ServiceRecord> {
    try {
      const { data: existing, error: fetchErr } = await supabase
        .from('service_records')
        .select('reminderStatus')
        .eq('id', id)
        .single();

      if (fetchErr) throw fetchErr;

      let origStatus: 'Not Sent' | 'Sent' = 'Not Sent';
      if (existing?.reminderStatus && existing.reminderStatus.startsWith('DELETED:')) {
        const parts = existing.reminderStatus.slice(8).split('|');
        if (parts.length > 1 && parts[1]?.toLowerCase() === 'sent') {
          origStatus = 'Sent';
        }
      }

      const { data, error } = await supabase
        .from('service_records')
        .update({ reminderStatus: origStatus })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as ServiceRecord;
    } catch (error: any) {
      console.error('Database restoreRecord error:', error);
      throw new Error(error.message || 'Failed to restore record');
    }
  }

  /**
   * Permanently deletes a service record from Supabase.
   * This action is irreversible.
   */
  static async permanentlyDeleteRecord(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('service_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error: any) {
      console.error('Database permanentlyDeleteRecord error:', error);
      throw new Error(error.message || 'Permanent deletion failed');
    }
  }

  /**
   * Cleans up expired deleted records older than 90 days.
   * Triggered only upon owner confirmation.
   */
  static async cleanupExpiredDeletedRecords(maxDays: number = 90): Promise<{ deletedCount: number }> {
    try {
      const deletedRecords = await this.getDeletedRecords();
      const expiredIds: string[] = [];

      for (const rec of deletedRecords) {
        const delAt = getRecordDeletedAt(rec);
        const { isExpired } = calculateTrashRetention(delAt, maxDays);
        if (isExpired) {
          expiredIds.push(rec.id);
        }
      }

      if (expiredIds.length === 0) {
        return { deletedCount: 0 };
      }

      const { error } = await supabase
        .from('service_records')
        .delete()
        .in('id', expiredIds);

      if (error) throw error;
      return { deletedCount: expiredIds.length };
    } catch (error: any) {
      console.error('Database cleanupExpiredDeletedRecords error:', error);
      throw new Error(error.message || 'Expired records cleanup failed');
    }
  }

  static async getPaginatedRecords(
    query: string = '',
    filter: 'all' | 'today' | 'last7' | 'last30' | 'thisMonth' = 'all',
    page: number = 1,
    limit: number = 20
  ): Promise<{ data: ServiceRecord[], count: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    try {
      let qBuilder = supabase
        .from('service_records')
        .select('*', { count: 'exact' })
        .or('reminderStatus.is.null,reminderStatus.not.ilike.DELETED%');

      if (query.trim()) {
        const q = query.toLowerCase().trim();
        qBuilder = qBuilder.or(`vehicleNumber.ilike.%${q}%,customerName.ilike.%${q}%,mobileNumber.ilike.%${q}%,id.ilike.%${q}%`);
      }

      if (filter !== 'all') {
        const now = new Date();
        let startDate = new Date();
        if (filter === 'today') {
           startDate = new Date(now.setHours(0,0,0,0));
        } else if (filter === 'last7') {
           startDate.setDate(startDate.getDate() - 7);
        } else if (filter === 'last30') {
           startDate.setDate(startDate.getDate() - 30);
        } else if (filter === 'thisMonth') {
           startDate = startOfMonth(new Date());
        }
        
        qBuilder = qBuilder.gte('dateOfService', startDate.toISOString());
      }

      const { data, count, error } = await qBuilder
        .order('dateOfService', { ascending: false })
        .order('timestamp', { ascending: false })
        .range(from, to);

      if (error) throw error;
      
      return {
        data: (data || []) as ServiceRecord[],
        count: count || 0
      };
    } catch(err: any) {
      console.error('Database fetch error:', err);
      throw new Error(err.message || 'Fetch failed');
    }
  }

  static async getPublicInvoiceById(id: string): Promise<ServiceRecord | null> {
    try {
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .eq('id', id)
        .single();
      if (error || !data || isRecordDeleted(data as ServiceRecord)) return null;
      return data as ServiceRecord;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async getInvoiceByIdAndMobile(id: string, mobileNumber: string): Promise<ServiceRecord | null> {
    try {
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .eq('id', id)
        .eq('mobileNumber', mobileNumber)
        .single();
      if (error || !data || isRecordDeleted(data as ServiceRecord)) return null;
      return data as ServiceRecord;
    } catch (e) {
      console.error(e);
      return null;
    }
  }

  static async searchRecords(query: string): Promise<ServiceRecord[]> {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    
    try {
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .or('reminderStatus.is.null,reminderStatus.not.ilike.DELETED%')
        .or(`vehicleNumber.ilike.%${q}%,customerName.ilike.%${q}%,mobileNumber.ilike.%${q}%`)
        .order('dateOfService', { ascending: false });

      if (error) throw error;
      const records = (data || []) as ServiceRecord[];
      return records.filter(r => !isRecordDeleted(r));
    } catch(error: any) {
      console.error('Database search error:', error);
      throw new Error(error.message || 'Search failed');
    }
  }

  /**
   * Optimized Global Vehicle Quick Search:
   * Fast, debounced search across vehicle number, customer name, and mobile number.
   * Handles spaces, partial matches, case-insensitivity, and Indian registration numbers.
   * Returns top 10 distinct vehicles with latest service & next service dates.
   */
  static async globalVehicleQuickSearch(rawQuery: string): Promise<VehicleQuickSearchResult[]> {
    const q = rawQuery.trim();
    if (!q || q.length < 2) return [];

    const alphaNum = q.replace(/[^a-zA-Z0-9]/g, '');
    const conditions: string[] = [
      `vehicleNumber.ilike.%${q}%`,
      `customerName.ilike.%${q}%`,
      `mobileNumber.ilike.%${q}%`
    ];

    if (alphaNum && alphaNum !== q) {
      conditions.push(`vehicleNumber.ilike.%${alphaNum}%`);
      conditions.push(`mobileNumber.ilike.%${alphaNum}%`);
    }

    const variants = getVehicleRegistrationVariants(q);
    variants.forEach(v => {
      if (v && v !== q && v !== alphaNum) {
        conditions.push(`vehicleNumber.ilike.%${v}%`);
      }
    });

    const last4 = alphaNum.match(/\d{3,4}$/)?.[0];
    if (last4 && last4 !== q && last4 !== alphaNum) {
      conditions.push(`vehicleNumber.ilike.%${last4}%`);
    }

    const orClause = conditions.join(',');

    try {
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .or('reminderStatus.is.null,reminderStatus.not.ilike.DELETED%')
        .or(orClause)
        .order('dateOfService', { ascending: false })
        .order('timestamp', { ascending: false })
        .limit(30);

      if (error) throw error;
      const records = (data || []) as ServiceRecord[];
      const activeRecords = records.filter(r => !isRecordDeleted(r));

      // Group by normalized vehicle number
      const vehicleMap = new Map<string, VehicleQuickSearchResult>();

      for (const record of activeRecords) {
        if (!record.vehicleNumber) continue;
        const normalizedKey = record.vehicleNumber.toLowerCase().replace(/[^a-zA-Z0-9]/g, '').trim();
        if (!normalizedKey) continue;

        if (!vehicleMap.has(normalizedKey)) {
          const nextDate = record.nextServiceDate 
            ? record.nextServiceDate 
            : format(addMonths(parseIsoDateOnly(record.dateOfService), 3), 'yyyy-MM-dd');

          vehicleMap.set(normalizedKey, {
            vehicleNumber: record.vehicleNumber,
            vehicleModel: record.vehicleModel || 'Vehicle',
            customerName: record.customerName || 'Customer',
            mobileNumber: record.mobileNumber || '',
            lastServiceDate: record.dateOfService,
            nextServiceDate: nextDate,
            lastInvoiceNumber: record.id,
            latestRecord: record,
          });
        }
      }

      return Array.from(vehicleMap.values()).slice(0, 10);
    } catch (err: any) {
      console.error('Database globalVehicleQuickSearch error:', err);
      throw new Error(err.message || 'Quick search failed');
    }
  }

  /**
   * Fetches full vehicle summary including all historical services and total spend.
   */
  static async getVehicleQuickSummary(vehicleNumber: string): Promise<VehicleQuickSummaryData | null> {
    try {
      const records = await this.getHistoryByVehicle(vehicleNumber);
      if (!records || records.length === 0) return null;

      const latestRecord = records[0];
      const totalServices = records.length;
      const totalAmountSpent = records.reduce((sum, r) => sum + (r.totalCost || 0), 0);
      const nextDate = latestRecord.nextServiceDate
        ? latestRecord.nextServiceDate
        : format(addMonths(parseIsoDateOnly(latestRecord.dateOfService), 3), 'yyyy-MM-dd');

      return {
        vehicleNumber: latestRecord.vehicleNumber,
        vehicleModel: latestRecord.vehicleModel || 'Vehicle',
        customerName: latestRecord.customerName || 'Customer',
        mobileNumber: latestRecord.mobileNumber || '',
        lastServiceDate: latestRecord.dateOfService,
        nextServiceDate: nextDate,
        totalServices,
        totalAmountSpent,
        lastInvoiceNumber: latestRecord.id,
        latestRecord,
      };
    } catch (err: any) {
      console.error('Database getVehicleQuickSummary error:', err);
      throw new Error(err.message || 'Failed to get vehicle summary');
    }
  }

  static async getHistoryByVehicle(vehicleNumber: string): Promise<ServiceRecord[]> {
    const raw = (vehicleNumber || '').trim();
    if (!raw) return [];
    const cleanKey = raw.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const variants = getVehicleRegistrationVariants(raw);

    try {
      const orClauses = variants.map(v => `vehicleNumber.ilike.%${v}%`).join(',');
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .or('reminderStatus.is.null,reminderStatus.not.ilike.DELETED%')
        .or(orClauses)
        .order('dateOfService', { ascending: false });
        
      if (error) throw error;
      const records = (data || []) as ServiceRecord[];
      return records.filter(r => {
        if (isRecordDeleted(r)) return false;
        const rNorm = (r.vehicleNumber || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        return rNorm === cleanKey || (r.vehicleNumber || '').toLowerCase().includes(raw.toLowerCase());
      });
    } catch (error: any) {
      console.error('Database getHistory error:', error);
      throw new Error(error.message || 'Error fetching history');
    }
  }

  static async getCustomerPortalData(vehicleNumber: string, mobileNumber: string): Promise<ServiceRecord[]> {
    const rawVeh = (vehicleNumber || '').trim();
    const rawMob = (mobileNumber || '').trim();
    if (!rawVeh || !rawMob) return [];

    const cleanVeh = rawVeh.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const cleanMob = rawMob.replace(/\D/g, '').slice(-10);
    if (!cleanVeh || cleanMob.length < 10) return [];

    const variants = getVehicleRegistrationVariants(rawVeh);

    try {
      const vehConditions = variants.map(v => `vehicleNumber.ilike.%${v}%`).join(',');
      const { data, error } = await supabase
        .from('service_records')
        .select('*')
        .or('reminderStatus.is.null,reminderStatus.not.ilike.DELETED%')
        .or(vehConditions)
        .order('dateOfService', { ascending: false });
        
      if (error) throw error;
      const records = (data || []) as ServiceRecord[];
      
      // Strict security: matching exact normalized vehicle registration AND matching 10-digit mobile
      const validRecords = records.filter(r => {
        if (isRecordDeleted(r)) return false;
        const rVeh = (r.vehicleNumber || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const rMob = (r.mobileNumber || '').replace(/\D/g, '').slice(-10);
        return rVeh === cleanVeh && rMob === cleanMob;
      });

      // Customer Portal strictly limits display to the latest 2 completed service records
      return validRecords.slice(0, 2);
    } catch (error: any) {
      console.error('Database customer portal error:', error);
      throw new Error(error.message || 'Error fetching data');
    }
  }

  static async updateReminderStatus(
    recordId: string, 
    status: 'sent' | 'not_sent' | 'Sent' | 'Not Sent', 
    sentDate: string | null
  ): Promise<void> {
    const normalizedStatus: 'Sent' | 'Not Sent' = status.toLowerCase() === 'sent' ? 'Sent' : 'Not Sent';
    const { error } = await supabase
      .from('service_records')
      .update({
        reminderStatus: normalizedStatus,
        lastReminderSentDate: sentDate,
      })
      .eq('id', recordId);

    if (error) {
      console.error('Database updateReminderStatus error:', error);
      throw error;
    }
  }

  static async getServiceReminders(providedRecords?: ServiceRecord[]): Promise<{
    reminders: ServiceReminderItem[];
    counts: Record<ReminderCategory, number>;
  }> {
    const records = providedRecords || await this.getRecords();
    const now = new Date();

    const startOfToday = startOfDay(now);
    const curMonthStart = startOfMonth(now);
    const curMonthEnd = endOfMonth(now);
    const curWeekStart = startOfWeek(now, { weekStartsOn: 1 });
    const curWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
    const next7DaysEnd = endOfDay(addDays(now, 7));

    // Group by vehicle to only consider the latest completed service record per vehicle
    const latestRecordsByVehicle = new Map<string, ServiceRecord>();
    records.forEach(r => {
      if (!r.vehicleNumber || !r.vehicleNumber.trim() || !r.dateOfService) return;
      const key = r.vehicleNumber.toLowerCase().replace(/\s+/g, '').trim();
      const existing = latestRecordsByVehicle.get(key);
      const rDate = parseIsoDateOnly(r.dateOfService).getTime();
      const rTimestamp = new Date(r.timestamp || r.dateOfService).getTime();

      if (!existing) {
        latestRecordsByVehicle.set(key, r);
      } else {
        const existDate = parseIsoDateOnly(existing.dateOfService).getTime();
        const existTimestamp = new Date(existing.timestamp || existing.dateOfService).getTime();
        if (rDate > existDate || (rDate === existDate && rTimestamp > existTimestamp)) {
          latestRecordsByVehicle.set(key, r);
        }
      }
    });

    const counts: Record<ReminderCategory, number> = {
      this_month: 0,
      this_week: 0,
      next_7_days: 0,
      overdue: 0,
    };

    const reminders: ServiceReminderItem[] = [];

    Array.from(latestRecordsByVehicle.values()).forEach(record => {
      // Next Service Date = Latest Completed Service Date + 3 Months (Calendar month calculation)
      const nextServiceDueDate = format(addMonths(parseIsoDateOnly(record.dateOfService), 3), 'yyyy-MM-dd');
      const dueDate = startOfDay(parseIsoDateOnly(nextServiceDueDate));

      // Database is the single source of truth for reminderStatus and lastReminderSentDate
      // The reminder status belongs strictly to this CURRENT service cycle (latest completed service record).
      const isSent = (record.reminderStatus || '').toLowerCase() === 'sent';
      const reminderStatus: 'Not Sent' | 'Sent' = isSent ? 'Sent' : 'Not Sent';
      const lastReminderSentDate = record.lastReminderSentDate || null;

      const isOverdue = dueDate < startOfToday;
      const isThisMonth = dueDate >= curMonthStart && dueDate <= curMonthEnd;
      const isThisWeek = dueDate >= curWeekStart && dueDate <= curWeekEnd;
      const isNext7Days = dueDate >= startOfToday && dueDate <= next7DaysEnd;

      const categories: ReminderCategory[] = [];
      if (isThisMonth) {
        categories.push('this_month');
        counts.this_month++;
      }
      if (isThisWeek) {
        categories.push('this_week');
        counts.this_week++;
      }
      if (isNext7Days) {
        categories.push('next_7_days');
        counts.next_7_days++;
      }
      if (isOverdue) {
        categories.push('overdue');
        counts.overdue++;
      }

      // Difference in days from today: negative if overdue, 0 if due today, positive if upcoming
      const daysDiff = differenceInDays(dueDate, startOfToday);

      reminders.push({
        record,
        customerName: record.customerName || 'Customer',
        vehicleNumber: record.vehicleNumber,
        mobileNumber: record.mobileNumber,
        vehicleModel: record.vehicleModel || 'Vehicle',
        lastServiceDate: record.dateOfService,
        nextServiceDueDate,
        reminderStatus,
        lastReminderSentDate,
        daysDiff,
        categories,
      });
    });

    // Sort by urgency: earliest due date first
    reminders.sort((a, b) => parseIsoDateOnly(a.nextServiceDueDate).getTime() - parseIsoDateOnly(b.nextServiceDueDate).getTime());

    return {
      reminders,
      counts,
    };
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

    // Get smart service reminders reusing the already fetched records
    const { reminders, counts } = await this.getServiceReminders(records);

    // Compute all 10 business analytics metrics + monthly graph
    const businessAnalytics = computeBusinessAnalytics(records);

    const recentRecords = records.slice(0, 5);

    return {
      totalCustomers: uniqueCustomers,
      totalServices: records.length,
      monthlyRevenue,
      pendingDuesTotal: pendingDues,
      upcomingRemindersCount: counts.this_month,
      pendingDueRecords: records.filter(r => r.dueAmount > 0),
      serviceReminders: reminders,
      reminderCounts: counts,
      recentRecords,
      businessAnalytics,
    };
  }
}
