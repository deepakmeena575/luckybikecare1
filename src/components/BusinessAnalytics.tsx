import React, { useState } from 'react';
import { BusinessAnalyticsData } from '../businessAnalytics';
import { formatCurrency } from '../utils';
import { 
  BarChart3, 
  IndianRupee, 
  Calendar, 
  TrendingUp, 
  History, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Receipt, 
  Wrench, 
  Award, 
  Package,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';

interface BusinessAnalyticsProps {
  data: BusinessAnalyticsData;
}

export const BusinessAnalytics: React.FC<BusinessAnalyticsProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<'6M' | '12M'>('6M');

  const activeChartData = timeRange === '6M' ? data.monthlyData6M : data.monthlyData12M;

  const totalRangeRevenue = activeChartData.reduce((sum, item) => sum + item.revenue, 0);
  const totalRangeServices = activeChartData.reduce((sum, item) => sum + item.services, 0);

  return (
    <div className="space-y-6 mb-8">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-gray-100">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="text-primary-600" size={22} />
            <span>Business Analytics</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Real-time financial metrics, service volume, and workshop performance
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500">
          <span className="inline-block w-2 h-2 rounded-full bg-primary-500"></span>
          <span>Live Workshop Records</span>
        </div>
      </div>

      {/* 7 Primary Business Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* 1. Today's Revenue */}
        <div className="glass-card p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Today's Revenue</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                {formatCurrency(data.todaysRevenue)}
              </h3>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {data.todaysServicesCount === 0 
                  ? 'No services logged today' 
                  : `${data.todaysServicesCount} service${data.todaysServicesCount === 1 ? '' : 's'} today`}
              </p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-primary-50 text-primary-600 shrink-0">
              <IndianRupee size={20} />
            </div>
          </div>
        </div>

        {/* 2. This Month's Revenue */}
        <div className="glass-card p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <div className="flex items-center gap-1.5 mb-1">
                <p className="text-xs font-medium text-gray-500 truncate">This Month's Revenue</p>
                {data.monthOverMonthGrowth !== null && (
                  <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    data.monthOverMonthGrowth >= 0 
                      ? 'bg-emerald-50 text-emerald-700' 
                      : 'bg-rose-50 text-rose-700'
                  }`}>
                    {data.monthOverMonthGrowth >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                    {Math.abs(data.monthOverMonthGrowth)}%
                  </span>
                )}
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                {formatCurrency(data.thisMonthRevenue)}
              </h3>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {data.thisMonthLabel} • {data.thisMonthServicesCount} services
              </p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-violet-50 text-violet-600 shrink-0">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>

        {/* 3. Previous Month's Revenue */}
        <div className="glass-card p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-medium text-gray-500 mb-1 truncate">Previous Month's Revenue</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                {formatCurrency(data.previousMonthRevenue)}
              </h3>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {data.previousMonthLabel} • {data.previousMonthServicesCount} services
              </p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <History size={20} />
            </div>
          </div>
        </div>

        {/* 4. Total Services */}
        <div className="glass-card p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Total Services</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                {data.totalServices}
              </h3>
              <p className="text-xs text-gray-500 mt-1 truncate">
                All-time service records
              </p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <FileText size={20} />
            </div>
          </div>
        </div>

        {/* 5. Completed Services */}
        <div className="glass-card p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Completed Services</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                {data.completedServices}
              </h3>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {data.completionRate}% fully settled ({data.totalServices - data.completedServices} with dues)
              </p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-teal-50 text-teal-600 shrink-0">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        {/* 6. Pending Payments */}
        <div className={`glass-card p-4 sm:p-5 transition-all border-l-4 ${
          data.pendingPaymentsTotal > 0 ? 'border-l-rose-500' : 'border-l-transparent'
        }`}>
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Pending Payments</p>
              <h3 className={`text-xl sm:text-2xl font-bold tracking-tight truncate ${
                data.pendingPaymentsTotal > 0 ? 'text-rose-600' : 'text-gray-900'
              }`}>
                {formatCurrency(data.pendingPaymentsTotal)}
              </h3>
              <p className="text-xs text-gray-500 mt-1 truncate">
                {data.pendingInvoicesCount === 0 
                  ? 'All invoices settled' 
                  : `${data.pendingInvoicesCount} invoice${data.pendingInvoicesCount === 1 ? '' : 's'} pending`}
              </p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-rose-50 text-rose-600 shrink-0">
              <AlertCircle size={20} />
            </div>
          </div>
        </div>

        {/* 7. Average Invoice Value */}
        <div className="glass-card p-4 sm:p-5 transition-all sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <p className="text-xs font-medium text-gray-500 mb-1">Average Invoice Value</p>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight truncate">
                {formatCurrency(data.avgInvoiceValue)}
              </h3>
              <p className="text-xs text-gray-500 mt-1 truncate">
                Total lifetime billed: {formatCurrency(data.totalLifetimeRevenue)}
              </p>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <Receipt size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 3 Operational Insights: Most Serviced Vehicle, Most Valuable Customer, Most Used Part */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        {/* 8. Most Serviced Vehicle */}
        <div className="glass-card p-4 sm:p-5 border-l-4 border-l-orange-500">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-primary-700 uppercase tracking-wider mb-1">
                <span>Top Vehicle</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {data.mostServicedVehicle ? data.mostServicedVehicle.vehicleNumber : 'None'}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5 truncate">
                {data.mostServicedVehicle?.vehicleModel || 'Motorcycle'}
              </p>
              <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{data.mostServicedVehicle?.servicesCount || 0} service visits</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(data.mostServicedVehicle?.totalSpent || 0)}
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-orange-50 text-primary-600 shrink-0 ml-3">
              <Wrench size={18} />
            </div>
          </div>
        </div>

        {/* 9. Most Valuable Customer */}
        <div className="glass-card p-4 sm:p-5 border-l-4 border-l-indigo-500">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 uppercase tracking-wider mb-1">
                <span>Top Customer</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {data.mostValuableCustomer ? data.mostValuableCustomer.customerName : 'None'}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5 truncate">
                {data.mostValuableCustomer?.mobileNumber || 'Customer'}
              </p>
              <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>{data.mostValuableCustomer?.visitsCount || 0} visits</span>
                <span className="font-semibold text-indigo-600">
                  {formatCurrency(data.mostValuableCustomer?.totalSpent || 0)}
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 shrink-0 ml-3">
              <Award size={18} />
            </div>
          </div>
        </div>

        {/* 10. Most Used Part */}
        <div className="glass-card p-4 sm:p-5 border-l-4 border-l-sky-500">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-700 uppercase tracking-wider mb-1">
                <span>Top Part</span>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-gray-900 truncate">
                {data.mostUsedPart ? data.mostUsedPart.partName : 'None'}
              </h4>
              <p className="text-xs text-gray-600 mt-0.5 truncate">
                High-demand workshop item
              </p>
              <div className="mt-2.5 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <span>Installed {data.mostUsedPart?.usageCount || 0} times</span>
                <span className="font-semibold text-sky-600">
                  {formatCurrency(data.mostUsedPart?.totalCost || 0)}
                </span>
              </div>
            </div>
            <div className="p-2.5 rounded-xl bg-sky-50 text-sky-600 shrink-0 ml-3">
              <Package size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Revenue Graph */}
      <div className="glass-card p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 size={18} className="text-primary-600" />
              <span>Monthly Revenue & Service Volume</span>
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
              Calendar month performance trend ({timeRange === '6M' ? 'Last 6 Months' : 'Last 12 Months'})
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="hidden md:flex items-center gap-3 mr-2 text-xs">
              <span className="text-gray-500">Period Revenue: <strong className="text-gray-900">{formatCurrency(totalRangeRevenue)}</strong></span>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">Services: <strong className="text-gray-900">{totalRangeServices}</strong></span>
            </div>

            <div className="inline-flex rounded-lg p-1 bg-gray-100 border border-gray-200/80 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTimeRange('6M')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  timeRange === '6M'
                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                6 Months
              </button>
              <button
                type="button"
                onClick={() => setTimeRange('12M')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  timeRange === '12M'
                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                12 Months
              </button>
            </div>
          </div>
        </div>

        {/* Chart Container */}
        <div className="h-64 sm:h-72 md:h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={activeChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#6b7280' }} 
                dy={8} 
              />
              <YAxis 
                yAxisId="revenue"
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#6b7280' }} 
                tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} 
              />
              <YAxis 
                yAxisId="services"
                orientation="right"
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: '#6b7280' }} 
                allowDecimals={false}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const rev = payload.find(p => p.dataKey === 'revenue')?.value as number || 0;
                    const serv = payload.find(p => p.dataKey === 'services')?.value as number || 0;
                    return (
                      <div className="bg-white p-3 rounded-xl shadow-lg border border-gray-200 text-xs">
                        <p className="font-bold text-gray-900 mb-1.5 pb-1 border-b border-gray-100">{label}</p>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <span className="w-2 h-2 rounded-full bg-primary-600"></span>
                              Revenue:
                            </span>
                            <span className="font-bold text-primary-700">{formatCurrency(rev)}</span>
                          </div>
                          <div className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-gray-600">
                              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                              Services:
                            </span>
                            <span className="font-bold text-blue-700">{serv} services</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                align="center"
                height={36}
                formatter={(value) => {
                  if (value === 'revenue') return <span className="text-xs text-gray-700 font-medium">Revenue (₹)</span>;
                  if (value === 'services') return <span className="text-xs text-gray-700 font-medium">Number of Services</span>;
                  return <span className="text-xs text-gray-700 font-medium">{value}</span>;
                }}
              />
              <Bar 
                yAxisId="revenue"
                dataKey="revenue" 
                name="revenue" 
                fill="#ea580c" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={36} 
              />
              <Line 
                yAxisId="services"
                type="monotone" 
                dataKey="services" 
                name="services" 
                stroke="#2563eb" 
                strokeWidth={2.5} 
                dot={{ r: 3.5, fill: '#2563eb', strokeWidth: 1.5, stroke: '#ffffff' }} 
                activeDot={{ r: 5 }} 
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
