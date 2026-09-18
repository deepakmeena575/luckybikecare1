import { ServiceRecord } from './types';
import { parseIsoDateOnly, parseServiceDescription } from './utils';
import { 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  subDays, 
  subMonths, 
  addMonths,
  startOfYear, 
  endOfYear, 
  format, 
  isWithinInterval,
  differenceInDays,
  parseISO
} from 'date-fns';

export type DateFilterPreset = 
  | 'all'
  | 'today'
  | 'this_week'
  | 'this_month'
  | 'prev_month'
  | 'last_3m'
  | 'last_6m'
  | 'this_year'
  | 'custom';

export interface DateFilterConfig {
  preset: DateFilterPreset;
  customStartDate?: string; // YYYY-MM-DD
  customEndDate?: string;   // YYYY-MM-DD
}

export interface MonthlyDataPoint {
  monthKey: string;
  month: string;
  revenue: number;
  services: number;
}

export interface DailyDataPoint {
  dateKey: string;
  label: string;
  revenue: number;
  services: number;
}

export interface CustomerAnalyticsItem {
  customerName: string;
  mobileNumber: string;
  totalVisits: number;
  totalSpent: number;
  lastServiceDate: string;
  vehicleCount: number;
  vehicles: string[];
}

export interface VehicleAnalyticsItem {
  vehicleNumber: string;
  vehicleModel: string;
  customerName: string;
  mobileNumber: string;
  totalVisits: number;
  totalSpent: number;
  lastServiceDate: string;
  nextServiceDueDate: string;
  isOverdue: boolean;
}

export interface PartUsageItem {
  partName: string;
  quantityUsed: number;
  totalValue: number;
  servicesCount: number;
}

export interface MonthlyPerformanceRow {
  monthKey: string;
  monthName: string;
  shortMonth: string;
  revenue: number;
  services: number;
  customers: number;
  avgInvoice: number;
  paidAmount: number;
  pendingAmount: number;
}

export interface TopHighlights {
  mostServicedVehicle: {
    vehicleNumber: string;
    vehicleModel: string;
    servicesCount: number;
    totalSpent: number;
  } | null;
  mostValuableCustomer: {
    customerName: string;
    mobileNumber: string;
    totalSpent: number;
    visitsCount: number;
  } | null;
  mostUsedPart: {
    partName: string;
    usageCount: number;
    totalCost: number;
  } | null;
  mostCommonService: {
    name: string;
    count: number;
  } | null;
  highestInvoice: {
    id: string;
    customerName: string;
    vehicleNumber: string;
    amount: number;
    date: string;
  } | null;
  bestRevenueMonth: {
    monthName: string;
    revenue: number;
    servicesCount: number;
  } | null;
}

export interface FullBusinessAnalytics {
  // 12 Top KPI Cards
  kpis: {
    todaysRevenue: number;
    todaysPaid: number;
    todaysServicesCount: number;
    thisMonthRevenue: number;
    thisMonthPaid: number;
    thisMonthServicesCount: number;
    thisMonthLabel: string;
    previousMonthRevenue: number;
    previousMonthPaid: number;
    previousMonthServicesCount: number;
    previousMonthLabel: string;
    monthOverMonthGrowth: number | null; // %
    totalRevenue: number; // For active filter period
    lifetimeRevenue: number;
    totalServices: number; // For active filter period
    lifetimeServices: number;
    completedServices: number;
    completionRate: number; // %
    pendingServices: number;
    pendingPayments: number;
    avgInvoiceValue: number;
    totalCustomers: number;
    totalVehicles: number;
    repeatCustomers: number;
    repeatCustomerRate: number; // %
  };

  // Top Performing Highlights
  topHighlights: TopHighlights;

  // Revenue Analytics
  revenue: {
    dailyRevenueToday: number;
    dailyRevenueAverage: number;
    weeklyRevenue: number;
    monthlyRevenue: number;
    previousMonthRevenue: number;
    monthOverMonthGrowth: number | null;
    totalLifetimeRevenue: number;
    periodRevenue: number;
    chart7D: DailyDataPoint[];
    chart30D: DailyDataPoint[];
    chart6M: MonthlyDataPoint[];
    chart12M: MonthlyDataPoint[];
  };

  // Service Analytics
  services: {
    totalServices: number;
    completedServices: number;
    pendingServices: number;
    cancelledServices: number;
    avgServicesPerMonth: number;
    mostServicedVehicleName: string;
    mostCommonServiceName: string;
    servicesThisMonth: number;
    servicesPreviousMonth: number;
    chart7D: DailyDataPoint[];
    chart30D: DailyDataPoint[];
    chart6M: MonthlyDataPoint[];
    chart12M: MonthlyDataPoint[];
  };

  // Customer Analytics
  customers: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    repeatCustomerRate: number;
    avgRevenuePerCustomer: number;
    topCustomersList: CustomerAnalyticsItem[];
  };

  // Vehicle Analytics
  vehicles: {
    totalVehicles: number;
    mostServicedVehiclesCount: number;
    vehiclesServicedThisMonth: number;
    vehiclesDueForService: number;
    recentlyServicedVehiclesList: VehicleAnalyticsItem[];
  };

  // Payment & Billing
  paymentBilling: {
    totalBilledAmount: number;
    totalPaidAmount: number;
    cashPaidTotal: number;
    onlinePaidTotal: number;
    totalPendingAmount: number;
    paidInvoicesCount: number;
    pendingInvoicesCount: number;
    partiallyPaidCount: number;
    avgInvoiceValue: number;
    highestInvoiceValue: number;
    paidPercentage: number;
    partiallyPaidPercentage: number;
    pendingPercentage: number;
  };

  // Parts / Inventory Analytics
  parts: {
    totalPartsUsed: number;
    totalPartsValue: number;
    topPartsList: PartUsageItem[];
  };

  // Service Reminder Analytics (Strictly Service Reminders)
  serviceReminders: {
    dueThisMonth: number;
    dueThisWeek: number;
    overdue: number;
    upcoming: number;
    remindersSent: number;
    remindersPending: number;
  };

  // Monthly Business Performance
  monthlyPerformance: {
    data6M: MonthlyPerformanceRow[];
    data12M: MonthlyPerformanceRow[];
  };
}

/**
 * Filter records based on DateFilterConfig
 */
export function filterRecordsByDate(records: ServiceRecord[], config: DateFilterConfig): {
  filteredRecords: ServiceRecord[];
  filterLabel: string;
} {
  const now = new Date();

  if (config.preset === 'all') {
    return { filteredRecords: records, filterLabel: 'All Time Records' };
  }

  let start: Date;
  let end: Date = endOfDay(now);
  let label = '';

  switch (config.preset) {
    case 'today':
      start = startOfDay(now);
      end = endOfDay(now);
      label = `Today (${format(now, 'dd MMM yyyy')})`;
      break;
    case 'this_week':
      start = startOfWeek(now, { weekStartsOn: 1 });
      end = endOfWeek(now, { weekStartsOn: 1 });
      label = `This Week (${format(start, 'dd MMM')} - ${format(end, 'dd MMM yyyy')})`;
      break;
    case 'this_month':
      start = startOfMonth(now);
      end = endOfMonth(now);
      label = `This Month (${format(now, 'MMMM yyyy')})`;
      break;
    case 'prev_month': {
      const prev = subMonths(now, 1);
      start = startOfMonth(prev);
      end = endOfMonth(prev);
      label = `Previous Month (${format(prev, 'MMMM yyyy')})`;
      break;
    }
    case 'last_3m':
      start = startOfDay(subMonths(now, 3));
      label = `Last 3 Months (${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')})`;
      break;
    case 'last_6m':
      start = startOfDay(subMonths(now, 6));
      label = `Last 6 Months (${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')})`;
      break;
    case 'this_year':
      start = startOfYear(now);
      end = endOfYear(now);
      label = `This Year (${format(now, 'yyyy')})`;
      break;
    case 'custom':
      if (config.customStartDate && config.customEndDate) {
        start = startOfDay(parseISO(config.customStartDate));
        end = endOfDay(parseISO(config.customEndDate));
        label = `Custom (${format(start, 'dd MMM yyyy')} - ${format(end, 'dd MMM yyyy')})`;
      } else {
        return { filteredRecords: records, filterLabel: 'All Time' };
      }
      break;
    default:
      return { filteredRecords: records, filterLabel: 'All Time' };
  }

  const filtered = records.filter(r => {
    if (!r.dateOfService) return false;
    const d = parseIsoDateOnly(r.dateOfService);
    return isWithinInterval(d, { start, end });
  });

  return { filteredRecords: filtered, filterLabel: label };
}

/**
 * Main calculation engine for Business Analytics
 */
export function computeFullBusinessAnalytics(
  allRecords: ServiceRecord[],
  filterConfig: DateFilterConfig = { preset: 'all' }
): FullBusinessAnalytics {
  const now = new Date();
  const todayStr = format(now, 'yyyy-MM-dd');

  const { filteredRecords } = filterRecordsByDate(allRecords, filterConfig);

  // 1. All-time customer visit tracking (for accurate repeat customer and new customer calculation)
  const customerFirstVisitMap = new Map<string, Date>();
  const customerAllVisitsMap = new Map<string, {
    name: string;
    mobile: string;
    totalSpent: number;
    visits: number;
    lastServiceDate: string;
    vehicles: Set<string>;
  }>();

  for (const r of allRecords) {
    const mobile = (r.mobileNumber || '').trim();
    const name = (r.customerName || '').trim();
    const key = mobile || name.toLowerCase();
    if (!key) continue;

    const serviceDate = parseIsoDateOnly(r.dateOfService);
    const existingFirst = customerFirstVisitMap.get(key);
    if (!existingFirst || serviceDate < existingFirst) {
      customerFirstVisitMap.set(key, serviceDate);
    }

    const existing = customerAllVisitsMap.get(key);
    if (!existing) {
      customerAllVisitsMap.set(key, {
        name: name || 'Valued Customer',
        mobile: mobile,
        totalSpent: r.totalCost || 0,
        visits: 1,
        lastServiceDate: r.dateOfService || '',
        vehicles: new Set([r.vehicleNumber].filter(Boolean))
      });
    } else {
      existing.totalSpent += (r.totalCost || 0);
      existing.visits += 1;
      if (name && existing.name === 'Valued Customer') existing.name = name;
      if (r.vehicleNumber) existing.vehicles.add(r.vehicleNumber);
      if (r.dateOfService && (!existing.lastServiceDate || r.dateOfService > existing.lastServiceDate)) {
        existing.lastServiceDate = r.dateOfService;
      }
    }
  }

  // Lifetime metrics
  const lifetimeRevenue = allRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const lifetimeServices = allRecords.length;

  // Filtered period metrics
  const periodRevenue = filteredRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const periodServices = filteredRecords.length;
  const periodAvgInvoice = periodServices > 0 ? periodRevenue / periodServices : 0;

  // Today's metrics (always relative to today's date)
  const todayRecords = allRecords.filter(r => r.dateOfService && r.dateOfService.startsWith(todayStr));
  const todaysRevenue = todayRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const todaysPaid = todayRecords.reduce((sum, r) => sum + ((r.cashPaid || 0) + (r.onlinePaid || 0)), 0);
  const todaysServicesCount = todayRecords.length;

  // This Month's metrics
  const curMonthStart = startOfMonth(now);
  const curMonthEnd = endOfMonth(now);
  const thisMonthRecords = allRecords.filter(r => {
    if (!r.dateOfService) return false;
    const d = parseIsoDateOnly(r.dateOfService);
    return isWithinInterval(d, { start: curMonthStart, end: curMonthEnd });
  });
  const thisMonthRevenue = thisMonthRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const thisMonthPaid = thisMonthRecords.reduce((sum, r) => sum + ((r.cashPaid || 0) + (r.onlinePaid || 0)), 0);
  const thisMonthServicesCount = thisMonthRecords.length;
  const thisMonthLabel = format(curMonthStart, 'MMMM yyyy');

  // Previous Month's metrics
  const prevMonth = subMonths(now, 1);
  const prevMonthStart = startOfMonth(prevMonth);
  const prevMonthEnd = endOfMonth(prevMonth);
  const prevMonthRecords = allRecords.filter(r => {
    if (!r.dateOfService) return false;
    const d = parseIsoDateOnly(r.dateOfService);
    return isWithinInterval(d, { start: prevMonthStart, end: prevMonthEnd });
  });
  const previousMonthRevenue = prevMonthRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const previousMonthPaid = prevMonthRecords.reduce((sum, r) => sum + ((r.cashPaid || 0) + (r.onlinePaid || 0)), 0);
  const previousMonthServicesCount = prevMonthRecords.length;
  const previousMonthLabel = format(prevMonthStart, 'MMMM yyyy');

  const monthOverMonthGrowth = previousMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100)
    : null;

  // Completed vs Pending in active dataset
  const activeRecords = filteredRecords;
  const completedServices = activeRecords.filter(r => (r.dueAmount || 0) <= 0).length;
  const pendingServices = activeRecords.filter(r => (r.dueAmount || 0) > 0).length;
  const completionRate = activeRecords.length > 0 
    ? Math.round((completedServices / activeRecords.length) * 100)
    : 100;

  const pendingPayments = activeRecords.reduce((sum, r) => sum + (r.dueAmount || 0), 0);

  // Distinct customers & vehicles in active dataset
  const activeCustomerKeys = new Set<string>();
  const activeVehiclesMap = new Map<string, VehicleAnalyticsItem>();

  for (const r of activeRecords) {
    const mobile = (r.mobileNumber || '').trim();
    const name = (r.customerName || '').trim();
    const custKey = mobile || name.toLowerCase();
    if (custKey) activeCustomerKeys.add(custKey);

    const vNum = (r.vehicleNumber || '').toUpperCase().replace(/\s+/g, ' ').trim();
    if (vNum) {
      const existingV = activeVehiclesMap.get(vNum);
      const isDue = r.nextServiceDate ? parseIsoDateOnly(r.nextServiceDate) < now : false;
      if (!existingV) {
        activeVehiclesMap.set(vNum, {
          vehicleNumber: vNum,
          vehicleModel: r.vehicleModel || 'Motorcycle',
          customerName: r.customerName || '',
          mobileNumber: r.mobileNumber || '',
          totalVisits: 1,
          totalSpent: r.totalCost || 0,
          lastServiceDate: r.dateOfService || '',
          nextServiceDueDate: r.nextServiceDate || '',
          isOverdue: isDue
        });
      } else {
        existingV.totalVisits += 1;
        existingV.totalSpent += (r.totalCost || 0);
        if (r.dateOfService && r.dateOfService > existingV.lastServiceDate) {
          existingV.lastServiceDate = r.dateOfService;
          existingV.nextServiceDueDate = r.nextServiceDate || existingV.nextServiceDueDate;
          existingV.isOverdue = isDue;
          if (r.customerName) existingV.customerName = r.customerName;
          if (r.mobileNumber) existingV.mobileNumber = r.mobileNumber;
        }
      }
    }
  }

  const totalCustomers = activeCustomerKeys.size;
  const totalVehicles = activeVehiclesMap.size;

  // Repeat customers (customers in active set who have >= 2 lifetime visits)
  let repeatCustomersCount = 0;
  let newCustomersCount = 0;
  let returningCustomersCount = 0;

  for (const key of activeCustomerKeys) {
    const cust = customerAllVisitsMap.get(key);
    if (cust && cust.visits >= 2) {
      repeatCustomersCount += 1;
      returningCustomersCount += 1;
    } else {
      newCustomersCount += 1;
    }
  }

  const repeatCustomerRate = totalCustomers > 0 
    ? Math.round((repeatCustomersCount / totalCustomers) * 100)
    : 0;

  // Top Customers List (Sorted by Total Spent descending)
  const topCustomersList: CustomerAnalyticsItem[] = [];
  for (const key of activeCustomerKeys) {
    const cust = customerAllVisitsMap.get(key);
    if (cust) {
      topCustomersList.push({
        customerName: cust.name,
        mobileNumber: cust.mobile,
        totalVisits: cust.visits,
        totalSpent: cust.totalSpent,
        lastServiceDate: cust.lastServiceDate,
        vehicleCount: cust.vehicles.size,
        vehicles: Array.from(cust.vehicles)
      });
    }
  }
  topCustomersList.sort((a, b) => b.totalSpent - a.totalSpent);

  // Top Vehicles List (Sorted by Total Visits descending)
  const recentlyServicedVehiclesList = Array.from(activeVehiclesMap.values());
  recentlyServicedVehiclesList.sort((a, b) => {
    if (b.totalVisits !== a.totalVisits) return b.totalVisits - a.totalVisits;
    return b.totalSpent - a.totalSpent;
  });

  // Parts / Inventory Analytics (Parsed from serviceDescription)
  const partsMap = new Map<string, { count: number; totalValue: number; servicesCount: number; displayName: string }>();
  for (const r of activeRecords) {
    const items = parseServiceDescription(r.serviceDescription);
    const seenPartsInService = new Set<string>();

    for (const item of items) {
      const rawName = (item.partName || '').trim();
      if (!rawName) continue;
      const key = rawName.toUpperCase().replace(/\s+/g, ' ');

      const existing = partsMap.get(key);
      const isNewInThisService = !seenPartsInService.has(key);
      seenPartsInService.add(key);

      if (!existing) {
        partsMap.set(key, {
          count: 1,
          totalValue: item.partCost || 0,
          servicesCount: 1,
          displayName: rawName
        });
      } else {
        existing.count += 1;
        existing.totalValue += (item.partCost || 0);
        if (isNewInThisService) {
          existing.servicesCount += 1;
        }
      }
    }
  }

  const topPartsList: PartUsageItem[] = Array.from(partsMap.entries()).map(([, val]) => ({
    partName: val.displayName.toUpperCase(),
    quantityUsed: val.count,
    totalValue: val.totalValue,
    servicesCount: val.servicesCount
  }));
  topPartsList.sort((a, b) => b.quantityUsed - a.quantityUsed);

  const totalPartsUsed = topPartsList.reduce((sum, p) => sum + p.quantityUsed, 0);
  const totalPartsValue = topPartsList.reduce((sum, p) => sum + p.totalValue, 0);

  // Top Highlights
  const mostServicedVehicleObj = recentlyServicedVehiclesList.length > 0 ? {
    vehicleNumber: recentlyServicedVehiclesList[0].vehicleNumber,
    vehicleModel: recentlyServicedVehiclesList[0].vehicleModel,
    servicesCount: recentlyServicedVehiclesList[0].totalVisits,
    totalSpent: recentlyServicedVehiclesList[0].totalSpent
  } : null;

  const mostValuableCustomerObj = topCustomersList.length > 0 ? {
    customerName: topCustomersList[0].customerName,
    mobileNumber: topCustomersList[0].mobileNumber,
    totalSpent: topCustomersList[0].totalSpent,
    visitsCount: topCustomersList[0].totalVisits
  } : null;

  const mostUsedPartObj = topPartsList.length > 0 ? {
    partName: topPartsList[0].partName,
    usageCount: topPartsList[0].quantityUsed,
    totalCost: topPartsList[0].totalValue
  } : null;

  // Most Common Service / Job
  const mostCommonServiceObj = topPartsList.length > 0 ? {
    name: topPartsList[0].partName,
    count: topPartsList[0].quantityUsed
  } : { name: 'General Routine Service', count: activeRecords.length };

  // Highest Single Invoice
  let highestInvoiceObj: TopHighlights['highestInvoice'] = null;
  let maxInvoiceAmount = 0;
  for (const r of activeRecords) {
    if ((r.totalCost || 0) > maxInvoiceAmount) {
      maxInvoiceAmount = r.totalCost || 0;
      highestInvoiceObj = {
        id: r.id,
        customerName: r.customerName || 'Customer',
        vehicleNumber: r.vehicleNumber || 'Vehicle',
        amount: r.totalCost || 0,
        date: r.dateOfService || ''
      };
    }
  }

  // Payment & Billing Report
  const totalBilledAmount = activeRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
  const cashPaidTotal = activeRecords.reduce((sum, r) => sum + (r.cashPaid || 0), 0);
  const onlinePaidTotal = activeRecords.reduce((sum, r) => sum + (r.onlinePaid || 0), 0);
  const totalPaidAmount = cashPaidTotal + onlinePaidTotal;
  const totalPendingAmount = activeRecords.reduce((sum, r) => sum + (r.dueAmount || 0), 0);

  const paidInvoicesCount = activeRecords.filter(r => (r.dueAmount || 0) <= 0).length;
  const pendingInvoicesCount = activeRecords.filter(r => (r.dueAmount || 0) > 0 && (r.cashPaid || 0) === 0 && (r.onlinePaid || 0) === 0).length;
  const partiallyPaidCount = activeRecords.filter(r => (r.dueAmount || 0) > 0 && ((r.cashPaid || 0) > 0 || (r.onlinePaid || 0) > 0)).length;

  const totalInvCount = activeRecords.length;
  const paidPercentage = totalInvCount > 0 ? Math.round((paidInvoicesCount / totalInvCount) * 100) : 0;
  const partiallyPaidPercentage = totalInvCount > 0 ? Math.round((partiallyPaidCount / totalInvCount) * 100) : 0;
  const pendingPercentage = totalInvCount > 0 ? Math.round((pendingInvoicesCount / totalInvCount) * 100) : 0;

  // Chart Generation: 7 Days, 30 Days, 6 Months, 12 Months
  const chart7D: DailyDataPoint[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = subDays(now, i);
    const key = format(d, 'yyyy-MM-dd');
    const dayRecords = allRecords.filter(r => r.dateOfService && r.dateOfService.startsWith(key));
    chart7D.push({
      dateKey: key,
      label: format(d, 'dd MMM'),
      revenue: dayRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0),
      services: dayRecords.length
    });
  }

  const chart30D: DailyDataPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = subDays(now, i);
    const key = format(d, 'yyyy-MM-dd');
    const dayRecords = allRecords.filter(r => r.dateOfService && r.dateOfService.startsWith(key));
    chart30D.push({
      dateKey: key,
      label: i % 4 === 0 ? format(d, 'dd MMM') : '',
      revenue: dayRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0),
      services: dayRecords.length
    });
  }

  const generateMonthlyPerformanceRows = (numMonths: number): MonthlyPerformanceRow[] => {
    const rows: MonthlyPerformanceRow[] = [];
    for (let i = numMonths - 1; i >= 0; i--) {
      const targetMonth = subMonths(now, i);
      const mStart = startOfMonth(targetMonth);
      const mEnd = endOfMonth(targetMonth);
      const mRecords = allRecords.filter(r => {
        if (!r.dateOfService) return false;
        const d = parseIsoDateOnly(r.dateOfService);
        return isWithinInterval(d, { start: mStart, end: mEnd });
      });

      const mRevenue = mRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);
      const mPaid = mRecords.reduce((sum, r) => sum + ((r.cashPaid || 0) + (r.onlinePaid || 0)), 0);
      const mPending = mRecords.reduce((sum, r) => sum + (r.dueAmount || 0), 0);
      const mServices = mRecords.length;
      const mCustomers = new Set(mRecords.map(r => (r.mobileNumber || r.customerName || '').trim()).filter(Boolean)).size;

      rows.push({
        monthKey: format(mStart, 'yyyy-MM'),
        monthName: format(mStart, 'MMMM yyyy'),
        shortMonth: format(mStart, 'MMM yy'),
        revenue: mRevenue,
        services: mServices,
        customers: mCustomers,
        avgInvoice: mServices > 0 ? Math.round(mRevenue / mServices) : 0,
        paidAmount: mPaid,
        pendingAmount: mPending
      });
    }
    return rows;
  };

  const monthlyRows6M = generateMonthlyPerformanceRows(6);
  const monthlyRows12M = generateMonthlyPerformanceRows(12);

  const chart6M: MonthlyDataPoint[] = monthlyRows6M.map(r => ({
    monthKey: r.monthKey,
    month: r.shortMonth,
    revenue: r.revenue,
    services: r.services
  }));

  const chart12M: MonthlyDataPoint[] = monthlyRows12M.map(r => ({
    monthKey: r.monthKey,
    month: r.shortMonth,
    revenue: r.revenue,
    services: r.services
  }));

  // Best Revenue Month across last 12 months
  let bestMonthObj: TopHighlights['bestRevenueMonth'] = null;
  let maxMonthRev = 0;
  for (const m of monthlyRows12M) {
    if (m.revenue > maxMonthRev) {
      maxMonthRev = m.revenue;
      bestMonthObj = {
        monthName: m.monthName,
        revenue: m.revenue,
        servicesCount: m.services
      };
    }
  }

  // Weekly revenue (current week)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const weekRecords = allRecords.filter(r => {
    if (!r.dateOfService) return false;
    const d = parseIsoDateOnly(r.dateOfService);
    return isWithinInterval(d, { start: weekStart, end: weekEnd });
  });
  const weeklyRevenue = weekRecords.reduce((sum, r) => sum + (r.totalCost || 0), 0);

  // Service Reminders Analytics (Strictly Service Reminders for active vehicle service cycles)
  let dueThisMonth = 0;
  let dueThisWeek = 0;
  let overdue = 0;
  let upcoming = 0;
  let remindersSent = 0;
  let remindersPending = 0;

  const startOfToday = startOfDay(now);
  const curWeekStart = startOfWeek(now, { weekStartsOn: 1 });
  const curWeekEnd = endOfWeek(now, { weekStartsOn: 1 });

  // Group by vehicle to only evaluate the current active service reminder cycle
  const latestReminderRecordsByVehicle = new Map<string, ServiceRecord>();
  allRecords.forEach(r => {
    if (!r.vehicleNumber || !r.vehicleNumber.trim() || !r.dateOfService) return;
    const key = r.vehicleNumber.toLowerCase().replace(/\s+/g, '').trim();
    const existing = latestReminderRecordsByVehicle.get(key);
    const rDate = parseIsoDateOnly(r.dateOfService).getTime();
    const rTimestamp = new Date(r.timestamp || r.dateOfService).getTime();

    if (!existing) {
      latestReminderRecordsByVehicle.set(key, r);
    } else {
      const existDate = parseIsoDateOnly(existing.dateOfService).getTime();
      const existTimestamp = new Date(existing.timestamp || existing.dateOfService).getTime();
      if (rDate > existDate || (rDate === existDate && rTimestamp > existTimestamp)) {
        latestReminderRecordsByVehicle.set(key, r);
      }
    }
  });

  Array.from(latestReminderRecordsByVehicle.values()).forEach(record => {
    const nextServiceDueDate = record.nextServiceDate 
      ? record.nextServiceDate 
      : format(addMonths(parseIsoDateOnly(record.dateOfService), 3), 'yyyy-MM-dd');
    const dueDate = startOfDay(parseIsoDateOnly(nextServiceDueDate));

    const isSent = (record.reminderStatus || '').toLowerCase() === 'sent';
    if (isSent) {
      remindersSent += 1;
    } else {
      remindersPending += 1;
    }

    if (dueDate < startOfToday) {
      overdue += 1;
    } else {
      upcoming += 1;
    }

    if (dueDate >= curWeekStart && dueDate <= curWeekEnd) {
      dueThisWeek += 1;
    }
    if (dueDate >= curMonthStart && dueDate <= curMonthEnd) {
      dueThisMonth += 1;
    }
  });

  // Average services per month
  const nonZeroMonths = monthlyRows12M.filter(m => m.services > 0);
  const avgServicesPerMonth = nonZeroMonths.length > 0 
    ? Math.round(nonZeroMonths.reduce((sum, m) => sum + m.services, 0) / nonZeroMonths.length)
    : Math.round(lifetimeServices / 12);

  return {
    kpis: {
      todaysRevenue,
      todaysPaid,
      todaysServicesCount,
      thisMonthRevenue,
      thisMonthPaid,
      thisMonthServicesCount,
      thisMonthLabel,
      previousMonthRevenue,
      previousMonthPaid,
      previousMonthServicesCount,
      previousMonthLabel,
      monthOverMonthGrowth,
      totalRevenue: periodRevenue,
      lifetimeRevenue,
      totalServices: periodServices,
      lifetimeServices,
      completedServices,
      completionRate,
      pendingServices,
      pendingPayments,
      avgInvoiceValue: periodAvgInvoice,
      totalCustomers,
      totalVehicles,
      repeatCustomers: repeatCustomersCount,
      repeatCustomerRate
    },
    topHighlights: {
      mostServicedVehicle: mostServicedVehicleObj,
      mostValuableCustomer: mostValuableCustomerObj,
      mostUsedPart: mostUsedPartObj,
      mostCommonService: mostCommonServiceObj,
      highestInvoice: highestInvoiceObj,
      bestRevenueMonth: bestMonthObj
    },
    revenue: {
      dailyRevenueToday: todaysRevenue,
      dailyRevenueAverage: periodServices > 0 ? Math.round(periodRevenue / 30) : 0,
      weeklyRevenue,
      monthlyRevenue: thisMonthRevenue,
      previousMonthRevenue,
      monthOverMonthGrowth,
      totalLifetimeRevenue: lifetimeRevenue,
      periodRevenue,
      chart7D,
      chart30D,
      chart6M,
      chart12M
    },
    services: {
      totalServices: periodServices,
      completedServices,
      pendingServices,
      cancelledServices: 0,
      avgServicesPerMonth,
      mostServicedVehicleName: mostServicedVehicleObj ? mostServicedVehicleObj.vehicleNumber : 'None',
      mostCommonServiceName: mostCommonServiceObj ? mostCommonServiceObj.name : 'Routine Service',
      servicesThisMonth: thisMonthServicesCount,
      servicesPreviousMonth: previousMonthServicesCount,
      chart7D,
      chart30D,
      chart6M,
      chart12M
    },
    customers: {
      totalCustomers,
      newCustomers: newCustomersCount,
      returningCustomers: returningCustomersCount,
      repeatCustomerRate,
      avgRevenuePerCustomer: totalCustomers > 0 ? Math.round(periodRevenue / totalCustomers) : 0,
      topCustomersList
    },
    vehicles: {
      totalVehicles,
      mostServicedVehiclesCount: mostServicedVehicleObj?.servicesCount || 0,
      vehiclesServicedThisMonth: thisMonthRecords.length,
      vehiclesDueForService: dueThisMonth + overdue,
      recentlyServicedVehiclesList
    },
    paymentBilling: {
      totalBilledAmount,
      totalPaidAmount,
      cashPaidTotal,
      onlinePaidTotal,
      totalPendingAmount,
      paidInvoicesCount,
      pendingInvoicesCount,
      partiallyPaidCount,
      avgInvoiceValue: periodAvgInvoice,
      highestInvoiceValue: maxInvoiceAmount,
      paidPercentage,
      partiallyPaidPercentage,
      pendingPercentage
    },
    parts: {
      totalPartsUsed,
      totalPartsValue,
      topPartsList
    },
    serviceReminders: {
      dueThisMonth,
      dueThisWeek,
      overdue,
      upcoming,
      remindersSent,
      remindersPending
    },
    monthlyPerformance: {
      data6M: monthlyRows6M,
      data12M: monthlyRows12M
    }
  };
}

/**
 * Backward compatibility helper for existing Dashboard widget
 */
export function computeBusinessAnalytics(records: ServiceRecord[]) {
  const full = computeFullBusinessAnalytics(records, { preset: 'all' });
  return {
    todaysRevenue: full.kpis.todaysRevenue,
    todaysPaid: full.kpis.todaysPaid,
    todaysServicesCount: full.kpis.todaysServicesCount,
    thisMonthRevenue: full.kpis.thisMonthRevenue,
    thisMonthPaid: full.kpis.thisMonthPaid,
    thisMonthServicesCount: full.kpis.thisMonthServicesCount,
    thisMonthLabel: full.kpis.thisMonthLabel,
    previousMonthRevenue: full.kpis.previousMonthRevenue,
    previousMonthPaid: full.kpis.previousMonthPaid,
    previousMonthServicesCount: full.kpis.previousMonthServicesCount,
    previousMonthLabel: full.kpis.previousMonthLabel,
    monthOverMonthGrowth: full.kpis.monthOverMonthGrowth,
    totalServices: full.kpis.lifetimeServices,
    completedServices: full.kpis.completedServices,
    completionRate: full.kpis.completionRate,
    pendingPaymentsTotal: full.kpis.pendingPayments,
    pendingInvoicesCount: full.paymentBilling.pendingInvoicesCount + full.paymentBilling.partiallyPaidCount,
    avgInvoiceValue: full.kpis.avgInvoiceValue,
    totalLifetimeRevenue: full.kpis.lifetimeRevenue,
    mostServicedVehicle: full.topHighlights.mostServicedVehicle,
    mostValuableCustomer: full.topHighlights.mostValuableCustomer,
    mostUsedPart: full.topHighlights.mostUsedPart,
    monthlyData6M: full.revenue.chart6M,
    monthlyData12M: full.revenue.chart12M
  };
}

export type BusinessAnalyticsData = ReturnType<typeof computeBusinessAnalytics>;

/**
 * Generate CSV Report string for export
 */
export function generateAnalyticsCsv(data: FullBusinessAnalytics, filterLabel: string): string {
  const lines: string[] = [];

  lines.push(`LUCKY BIKE CARE - WORKSHOP BUSINESS REPORT`);
  lines.push(`Generated: ${format(new Date(), 'dd MMMM yyyy HH:mm')}`);
  lines.push(`Filter Period: ${filterLabel}`);
  lines.push(``);

  lines.push(`1. EXECUTIVE SUMMARY & KEY PERFORMANCE INDICATORS`);
  lines.push(`Metric,Value`);
  lines.push(`Today's Revenue,₹${data.kpis.todaysRevenue.toFixed(2)}`);
  lines.push(`This Month's Revenue,₹${data.kpis.thisMonthRevenue.toFixed(2)}`);
  lines.push(`Previous Month's Revenue,₹${data.kpis.previousMonthRevenue.toFixed(2)}`);
  lines.push(`Period Revenue,₹${data.kpis.totalRevenue.toFixed(2)}`);
  lines.push(`Total Lifetime Revenue,₹${data.kpis.lifetimeRevenue.toFixed(2)}`);
  lines.push(`Total Services (Period),${data.kpis.totalServices}`);
  lines.push(`Completed Services,${data.kpis.completedServices}`);
  lines.push(`Pending Dues Count,${data.kpis.pendingServices}`);
  lines.push(`Pending Payments Total,₹${data.kpis.pendingPayments.toFixed(2)}`);
  lines.push(`Average Invoice Value,₹${data.kpis.avgInvoiceValue.toFixed(2)}`);
  lines.push(`Total Customers,${data.kpis.totalCustomers}`);
  lines.push(`Total Vehicles,${data.kpis.totalVehicles}`);
  lines.push(`Repeat Customers,${data.kpis.repeatCustomers} (${data.kpis.repeatCustomerRate}%)`);
  lines.push(``);

  lines.push(`2. MONTHLY BUSINESS PERFORMANCE`);
  lines.push(`Month,Revenue (INR),Services,Customers,Average Ticket,Paid Amount,Pending Amount`);
  for (const m of data.monthlyPerformance.data12M) {
    lines.push(`"${m.monthName}",${m.revenue.toFixed(2)},${m.services},${m.customers},${m.avgInvoice},${m.paidAmount.toFixed(2)},${m.pendingAmount.toFixed(2)}`);
  }
  lines.push(``);

  lines.push(`3. TOP CUSTOMERS`);
  lines.push(`Customer Name,Mobile Number,Total Visits,Total Spent (INR),Last Service Date,Vehicles`);
  for (const c of data.customers.topCustomersList.slice(0, 50)) {
    lines.push(`"${c.customerName}","${c.mobileNumber}",${c.totalVisits},${c.totalSpent.toFixed(2)},"${c.lastServiceDate}",${c.vehicleCount}`);
  }
  lines.push(``);

  lines.push(`4. VEHICLE SERVICE ACTIVITY`);
  lines.push(`Vehicle Number,Vehicle Model,Customer,Visits,Total Spent (INR),Last Service,Next Due`);
  for (const v of data.vehicles.recentlyServicedVehiclesList.slice(0, 50)) {
    lines.push(`"${v.vehicleNumber}","${v.vehicleModel}","${v.customerName}",${v.totalVisits},${v.totalSpent.toFixed(2)},"${v.lastServiceDate}","${v.nextServiceDueDate}"`);
  }
  lines.push(``);

  lines.push(`5. PARTS & INVENTORY USAGE`);
  lines.push(`Part Name,Quantity Used,Total Value (INR),Services Count`);
  for (const p of data.parts.topPartsList.slice(0, 50)) {
    lines.push(`"${p.partName}",${p.quantityUsed},${p.totalValue.toFixed(2)},${p.servicesCount}`);
  }

  return lines.join('\n');
}
