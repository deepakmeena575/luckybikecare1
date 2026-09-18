import React, { useState } from 'react';
import { MonthlyPerformanceRow } from '../../businessAnalytics';
import { formatCurrency } from '../../utils';
import { CalendarRange, ArrowUpDown } from 'lucide-react';

interface MonthlyPerformanceTableProps {
  data6M: MonthlyPerformanceRow[];
  data12M: MonthlyPerformanceRow[];
}

export const MonthlyPerformanceTable: React.FC<MonthlyPerformanceTableProps> = ({ data6M, data12M }) => {
  const [range, setRange] = useState<'6M' | '12M'>('6M');

  const rows = range === '6M' ? data6M : data12M;

  const totalRev = rows.reduce((s, r) => s + r.revenue, 0);
  const totalServices = rows.reduce((s, r) => s + r.services, 0);
  const totalPaid = rows.reduce((s, r) => s + r.paidAmount, 0);
  const totalPending = rows.reduce((s, r) => s + r.pendingAmount, 0);

  return (
    <div className="glass-card p-3.5 sm:p-5 space-y-3.5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <CalendarRange size={16} />
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
              Monthly Business Performance
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Historical audit of revenue, service counts, unique customers, and collection status
          </p>
        </div>

        <div className="inline-flex rounded-lg p-1 bg-gray-100 border border-gray-200/80 text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setRange('6M')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              range === '6M'
                ? 'bg-white text-gray-900 shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Last 6 Months
          </button>
          <button
            type="button"
            onClick={() => setRange('12M')}
            className={`px-2.5 py-1 rounded-md transition-all ${
              range === '12M'
                ? 'bg-white text-gray-900 shadow-xs font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Last 12 Months
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
            <tr>
              <th className="py-2.5 px-3">Month</th>
              <th className="py-2.5 px-3 text-right">Revenue</th>
              <th className="py-2.5 px-3 text-center">Services</th>
              <th className="py-2.5 px-3 text-center">Customers</th>
              <th className="py-2.5 px-3 text-right">Avg Invoice</th>
              <th className="py-2.5 px-3 text-right">Paid Amount</th>
              <th className="py-2.5 px-3 text-right">Pending Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((row) => (
              <tr key={row.monthKey} className="hover:bg-gray-50/80 transition-colors">
                <td className="py-2 px-3 font-bold text-gray-900 whitespace-nowrap">
                  {row.monthName}
                </td>
                <td className="py-2 px-3 text-right font-extrabold text-primary-700 whitespace-nowrap">
                  {formatCurrency(row.revenue)}
                </td>
                <td className="py-2 px-3 text-center font-medium text-gray-800 whitespace-nowrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                    {row.services}
                  </span>
                </td>
                <td className="py-2 px-3 text-center font-medium text-gray-700 whitespace-nowrap">
                  {row.customers}
                </td>
                <td className="py-2 px-3 text-right font-medium text-gray-800 whitespace-nowrap">
                  {formatCurrency(row.avgInvoice)}
                </td>
                <td className="py-2 px-3 text-right font-semibold text-emerald-700 whitespace-nowrap">
                  {formatCurrency(row.paidAmount)}
                </td>
                <td className="py-2 px-3 text-right font-semibold whitespace-nowrap">
                  {row.pendingAmount > 0 ? (
                    <span className="text-rose-600 font-bold">{formatCurrency(row.pendingAmount)}</span>
                  ) : (
                    <span className="text-gray-400">₹0</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50/90 font-bold text-gray-900 border-t-2 border-gray-200">
            <tr>
              <td className="py-2.5 px-3">Total / Average</td>
              <td className="py-2.5 px-3 text-right text-primary-800 font-extrabold whitespace-nowrap">
                {formatCurrency(totalRev)}
              </td>
              <td className="py-2.5 px-3 text-center text-blue-800 whitespace-nowrap">
                {totalServices}
              </td>
              <td className="py-2.5 px-3 text-center text-gray-600">—</td>
              <td className="py-2.5 px-3 text-right text-gray-800 whitespace-nowrap">
                {totalServices > 0 ? formatCurrency(Math.round(totalRev / totalServices)) : '₹0'}
              </td>
              <td className="py-2.5 px-3 text-right text-emerald-800 whitespace-nowrap">
                {formatCurrency(totalPaid)}
              </td>
              <td className="py-2.5 px-3 text-right text-rose-800 whitespace-nowrap">
                {formatCurrency(totalPending)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
