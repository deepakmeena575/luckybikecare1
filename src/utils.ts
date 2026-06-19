import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
