export interface ServiceItem {
  id: string;
  partName: string;
  partCost: number;
  labourCost: number;
  exchangeValue: number;
}

export interface ServiceRecord {
  id: string;
  vehicleNumber: string;
  serviceCounter: number;
  customerName: string;
  mobileNumber: string;
  vehicleModel: string;
  dateOfService: string; // ISO date string
  kilometerReading: number;
  serviceDescription: ServiceItem[];
  labourCost: number; // General Labour
  totalCost: number; // Final Service Bill
  cashPaid: number;
  onlinePaid: number;
  dueAmount: number;
  timestamp: string; // ISO datetime
  nextServiceDate: string; // ISO date string
  reminderStatus?: 'Not Sent' | 'Sent' | string;
  lastReminderSentDate?: string | null;
  deletedAt?: string | null;
}

export interface TrashRetentionInfo {
  deletedAt: string;
  daysSinceDeleted: number;
  daysRemaining: number;
  isExpired: boolean;
  deletedRelativeText: string;
  retentionRemainingText: string;
}

export type ReminderCategory = 'this_month' | 'this_week' | 'next_7_days' | 'overdue';

export interface ServiceReminderItem {
  record: ServiceRecord;
  customerName: string;
  vehicleNumber: string;
  mobileNumber: string;
  vehicleModel: string;
  lastServiceDate: string;
  nextServiceDueDate: string;
  reminderStatus: 'Not Sent' | 'Sent';
  lastReminderSentDate: string | null;
  daysDiff: number;
  categories: ReminderCategory[];
}

export type Screen = 'dashboard' | 'new-service' | 'reminders' | 'search' | 'history' | 'reports' | 'qr-setup' | 'trash';

export interface VehicleQuickSearchResult {
  vehicleNumber: string;
  vehicleModel: string;
  customerName: string;
  mobileNumber: string;
  lastServiceDate: string;
  nextServiceDate: string;
  lastInvoiceNumber: string;
  latestRecord: ServiceRecord;
}

export interface VehicleQuickSummaryData {
  customerName: string;
  mobileNumber: string;
  vehicleNumber: string;
  vehicleModel: string;
  lastServiceDate: string;
  nextServiceDate: string;
  totalServices: number;
  totalAmountSpent: number;
  lastInvoiceNumber: string;
  latestRecord: ServiceRecord;
}
