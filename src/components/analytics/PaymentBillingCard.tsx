import React from 'react';
import { FullBusinessAnalytics } from '../../businessAnalytics';
import { formatCurrency } from '../../utils';
import { 
  CreditCard, 
  Wallet, 
  Smartphone, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Receipt,
  Layers
} from 'lucide-react';

interface PaymentBillingCardProps {
  billing: FullBusinessAnalytics['paymentBilling'];
}

export const PaymentBillingCard: React.FC<PaymentBillingCardProps> = ({ billing }) => {
  return (
    <div className="glass-card p-3.5 sm:p-5 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <CreditCard size={16} />
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
            Payment & Billing Report
          </h3>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Settlement efficiency, payment mode collections (Cash vs Online UPI), and pending dues audit
        </p>
      </div>

      {/* Main Billing Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Billed */}
        <div className="p-3 rounded-lg bg-gray-50 border border-gray-200/80">
          <p className="text-[11px] font-medium text-gray-500 mb-0.5">Total Billed</p>
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 truncate">
            {formatCurrency(billing.totalBilledAmount)}
          </h4>
          <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">
            Across all service orders
          </p>
        </div>

        {/* Total Collected / Paid */}
        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[11px] font-medium text-emerald-800">Total Collected</p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
              {billing.paidPercentage}% Settled
            </span>
          </div>
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-emerald-900 truncate">
            {formatCurrency(billing.totalPaidAmount)}
          </h4>
          <div className="mt-1.5 pt-1.5 border-t border-emerald-200/60 flex items-center justify-between text-[10px] sm:text-[11px] text-emerald-800">
            <span className="flex items-center gap-1">
              <Wallet size={11} />
              Cash: {formatCurrency(billing.cashPaidTotal)}
            </span>
            <span className="flex items-center gap-1">
              <Smartphone size={11} />
              UPI: {formatCurrency(billing.onlinePaidTotal)}
            </span>
          </div>
        </div>

        {/* Total Pending */}
        <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-200/80">
          <div className="flex items-center justify-between mb-0.5">
            <p className="text-[11px] font-medium text-rose-800">Total Pending Dues</p>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
              {billing.pendingInvoicesCount + billing.partiallyPaidCount} Invoices
            </span>
          </div>
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-rose-900 truncate">
            {formatCurrency(billing.totalPendingAmount)}
          </h4>
          <p className="text-[10px] sm:text-[11px] text-rose-700/80 mt-0.5">
            Awaiting customer settlement
          </p>
        </div>

        {/* Avg & Max Ticket */}
        <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200/80">
          <p className="text-[11px] font-medium text-indigo-800 mb-0.5">Ticket Distribution</p>
          <div className="flex items-baseline justify-between">
            <div>
              <p className="text-[10px] text-gray-500">Average</p>
              <p className="text-sm sm:text-base font-bold text-gray-900 truncate">
                {formatCurrency(billing.avgInvoiceValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-500">Highest Bill</p>
              <p className="text-sm sm:text-base font-bold text-indigo-700 truncate">
                {formatCurrency(billing.highestInvoiceValue)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Payment Status Ratio Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-semibold text-gray-700">
          <span className="flex items-center gap-1.5 text-[11px] sm:text-xs">
            <Layers size={13} className="text-gray-500" />
            Payment Status Distribution
          </span>
          <span className="text-gray-500 text-[10px] sm:text-[11px]">
            {billing.paidInvoicesCount + billing.partiallyPaidCount + billing.pendingInvoicesCount} Total Evaluated
          </span>
        </div>

        {/* Segmented Bar */}
        <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden flex shadow-inner">
          <div 
            style={{ width: `${billing.paidPercentage}%` }} 
            className="bg-emerald-500 transition-all"
            title={`Fully Paid: ${billing.paidPercentage}%`}
          />
          <div 
            style={{ width: `${billing.partiallyPaidPercentage}%` }} 
            className="bg-amber-400 transition-all"
            title={`Partially Paid: ${billing.partiallyPaidPercentage}%`}
          />
          <div 
            style={{ width: `${billing.pendingPercentage}%` }} 
            className="bg-rose-500 transition-all"
            title={`Pending: ${billing.pendingPercentage}%`}
          />
        </div>

        {/* Legend & Breakdown Chips */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
          {/* Fully Paid */}
          <div className="p-2 rounded-lg border border-emerald-100 bg-emerald-50/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-gray-900 truncate text-[11px] sm:text-xs">Fully Settled</p>
                <p className="text-[10px] text-gray-500">{billing.paidInvoicesCount} Invoices</p>
              </div>
            </div>
            <span className="font-bold text-emerald-700 text-xs">{billing.paidPercentage}%</span>
          </div>

          {/* Partially Paid */}
          <div className="p-2 rounded-lg border border-amber-100 bg-amber-50/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <Clock size={14} className="text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-gray-900 truncate text-[11px] sm:text-xs">Partially Paid</p>
                <p className="text-[10px] text-gray-500">{billing.partiallyPaidCount} Invoices</p>
              </div>
            </div>
            <span className="font-bold text-amber-700 text-xs">{billing.partiallyPaidPercentage}%</span>
          </div>

          {/* Fully Pending */}
          <div className="p-2 rounded-lg border border-rose-100 bg-rose-50/40 flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <AlertCircle size={14} className="text-rose-600 shrink-0" />
              <div>
                <p className="font-bold text-gray-900 truncate text-[11px] sm:text-xs">Unpaid / Due</p>
                <p className="text-[10px] text-gray-500">{billing.pendingInvoicesCount} Invoices</p>
              </div>
            </div>
            <span className="font-bold text-rose-700 text-xs">{billing.pendingPercentage}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
