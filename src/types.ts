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
}

export type Screen = 'dashboard' | 'new-service' | 'search' | 'history' | 'reports' | 'qr-setup';
