import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ServiceRecord, TrashRetentionInfo } from "./types";

/**
 * Merges tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safe Float Parser
 */
export const safeParseFloat = (val: any): number => {
  const parsed = parseFloat(val);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Safe Add to prevent floating point errors
 */
export const safeAdd = (...args: number[]): number => {
  let sum = 0;
  for (const n of args) {
    sum += Math.round(safeParseFloat(n) * 100);
  }
  return sum / 100;
};

/**
 * Safe Subtract
 */
export const safeSubtract = (a: number, b: number): number => {
  return Math.round(safeParseFloat(a) * 100 - safeParseFloat(b) * 100) / 100;
};

/**
 * Business Logic: Calculate Final Bill
 */
export const calculateServiceBill = (
  generalLabour: number,
  serviceItems: { labourCost: number; exchangeValue: number; partCost: number }[],
  cashPaid: number,
  onlinePaid: number
) => {
  const totalPartLabour = serviceItems.reduce((acc, item) => safeAdd(acc, item.labourCost), 0);
  const totalExchangeValue = serviceItems.reduce((acc, item) => safeAdd(acc, item.exchangeValue), 0);
  
  const totalLabourBeforeExchange = safeAdd(generalLabour, totalPartLabour);
  
  // Final Service Bill = Total Labour Before Exchange - Exchange Value (if negative, set to 0)
  let finalServiceBill = safeSubtract(totalLabourBeforeExchange, totalExchangeValue);
  if (finalServiceBill < 0) finalServiceBill = 0;
  
  // Due Amount = Final Service Bill - (Cash + Online)
  // Part costs are tracked but not added to the bill! Customer pays service bill only.
  const totalPaid = safeAdd(cashPaid, onlinePaid);
  let dueAmount = safeSubtract(finalServiceBill, totalPaid);
  if (dueAmount < 0) dueAmount = 0;

  return {
    finalServiceBill,
    dueAmount,
    totalPartLabour,
    totalExchangeValue,
  };
};

export const parseServiceDescription = (desc: any): any[] => {
  if (typeof desc === 'string') {
    try {
      return JSON.parse(desc);
    } catch {
      return [];
    }
  }
  if (Array.isArray(desc)) return desc;
  return [];
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Safely parses an ISO date string (e.g. YYYY-MM-DD) into a local Date set to midday (12:00:00)
 * to avoid timezone shifts and daylight savings boundaries.
 */
export const parseIsoDateOnly = (dateStr: string | null | undefined): Date => {
  if (!dateStr) return new Date();
  const datePart = dateStr.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      return new Date(year, month, day, 12, 0, 0);
    }
  }
  return new Date(dateStr);
};

/**
 * Checks whether a service record has been marked as soft-deleted / moved to trash.
 */
export const isRecordDeleted = (record: ServiceRecord): boolean => {
  if (record.deletedAt) return true;
  return typeof record.reminderStatus === 'string' && record.reminderStatus.startsWith('DELETED:');
};

/**
 * Extracts the ISO deletedAt string from a service record.
 */
export const getRecordDeletedAt = (record: ServiceRecord): string | null => {
  if (record.deletedAt) return record.deletedAt;
  if (typeof record.reminderStatus === 'string' && record.reminderStatus.startsWith('DELETED:')) {
    const raw = record.reminderStatus.slice(8);
    const pipeIdx = raw.indexOf('|');
    return pipeIdx >= 0 ? raw.slice(0, pipeIdx) : raw;
  }
  return null;
};

/**
 * Extracts the original reminder status ('Not Sent' or 'Sent') preserved before moving to trash.
 */
export const getOriginalReminderStatus = (record: ServiceRecord): 'Not Sent' | 'Sent' => {
  if (typeof record.reminderStatus === 'string' && record.reminderStatus.startsWith('DELETED:')) {
    const raw = record.reminderStatus.slice(8);
    const pipeIdx = raw.indexOf('|');
    if (pipeIdx >= 0) {
      const orig = raw.slice(pipeIdx + 1);
      return orig.toLowerCase() === 'sent' ? 'Sent' : 'Not Sent';
    }
    return 'Not Sent';
  }
  return record.reminderStatus === 'Sent' ? 'Sent' : 'Not Sent';
};

/**
 * Calculates the 90-day retention information for a deleted record.
 * Required display fields:
 * - Deleted Date
 * - Days Remaining
 * Example:
 * "Deleted 15 days ago"
 * "Restore available for 75 more days"
 */
export const calculateTrashRetention = (
  deletedAtStr: string | null | undefined, 
  totalRetentionDays: number = 90
): TrashRetentionInfo => {
  const now = new Date();
  const deletedDate = deletedAtStr ? new Date(deletedAtStr) : now;
  const validDeletedDate = isNaN(deletedDate.getTime()) ? now : deletedDate;
  
  const msPerDay = 1000 * 60 * 60 * 24;
  const startOfNow = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfDel = new Date(validDeletedDate.getFullYear(), validDeletedDate.getMonth(), validDeletedDate.getDate()).getTime();
  const diffDays = Math.max(0, Math.floor((startOfNow - startOfDel) / msPerDay));
  
  const daysRemaining = Math.max(0, totalRetentionDays - diffDays);
  const isExpired = diffDays >= totalRetentionDays;

  let deletedRelativeText = 'Deleted today';
  if (diffDays === 1) {
    deletedRelativeText = 'Deleted 1 day ago';
  } else if (diffDays > 1) {
    deletedRelativeText = `Deleted ${diffDays} days ago`;
  }

  let retentionRemainingText = `Restore available for ${daysRemaining} more days`;
  if (daysRemaining === 1) {
    retentionRemainingText = 'Restore available for 1 more day';
  } else if (isExpired || daysRemaining === 0) {
    retentionRemainingText = 'Restore expired (Eligible for cleanup)';
  }

  return {
    deletedAt: validDeletedDate.toISOString(),
    daysSinceDeleted: diffDays,
    daysRemaining,
    isExpired,
    deletedRelativeText,
    retentionRemainingText
  };
};

/**
 * Generates search and matching variations for Indian vehicle registrations
 * (e.g., handles spaces, no spaces, state code, district, series, registration numbers).
 * E.g., for "RJ20ZS7028" -> ["RJ20ZS7028", "RJ 20 ZS 7028", "RJ20 ZS 7028", etc.]
 */
export const getVehicleRegistrationVariants = (rawInput: string): string[] => {
  const trimmed = (rawInput || '').trim();
  if (!trimmed) return [];
  const clean = trimmed.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const variants = new Set<string>();
  variants.add(trimmed);
  if (clean) variants.add(clean);

  const match = clean.match(/^([A-Z]{2})(\d{1,2})([A-Z]{0,3})(\d{0,4})$/);
  if (match) {
    const [, state, dist, series, num] = match;
    const parts = [state, dist, series, num].filter(Boolean);
    if (parts.length > 1) {
      variants.add(parts.join(' '));
    }
    if (series || num) {
      variants.add(`${state}${dist} ${series} ${num}`.trim());
      variants.add(`${state} ${dist} ${series}${num}`.trim());
      variants.add(`${state}${dist}${series} ${num}`.trim());
      variants.add(`${state} ${dist}${series} ${num}`.trim());
    }
  }

  return Array.from(variants).filter(Boolean);
};
