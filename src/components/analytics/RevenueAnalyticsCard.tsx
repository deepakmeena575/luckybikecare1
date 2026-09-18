import React, { useState } from 'react';
import { FullBusinessAnalytics } from '../../businessAnalytics';
import { formatCurrency } from '../../utils';
import { 
  TrendingUp, 
  IndianRupee, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3
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

interface RevenueAnalyticsCardProps {
  revenue: FullBusinessAnalytics['revenue'];
}

type RevenueTimeframe = '7D' | '30D' | '6M' | '12M';

export const RevenueAnalyticsCard: React.FC<RevenueAnalyticsCardProps> = ({ revenue }) => {
  const [timeframe, setTimeframe] = useState<RevenueTimeframe>('6M');

  let chartData: Array<{ key: string; label: string; revenue: number; services: number }> = [];

  if (timeframe === '7D') {
    chartData = revenue.chart7D.map(d => ({
      key: d.dateKey,
      label: d.label,
      revenue: d.revenue,
      services: d.services
    }));
  } else if (timeframe === '30D') {
    chartData = revenue.chart30D.map(d => ({
      key: d.dateKey,
      label: d.label,
      revenue: d.revenue,
      services: d.services
    }));
  } else if (timeframe === '6M') {
    chartData = revenue.chart6M.map(d => ({
      key: d.monthKey,
      label: d.month,
      revenue: d.revenue,
      services: d.services
    }));
  } else {
    chartData = revenue.chart12M.map(d => ({
      key: d.monthKey,
      label: d.month,
      revenue: d.revenue,
      services: d.services
    }));
  }

  const periodTotalRevenue = chartData.reduce((sum, item) => sum + item.revenue, 0);
  const periodTotalServices = chartData.reduce((sum, item) => sum + item.services, 0);

  return (
    <div className="glass-card p-3.5 sm:p-5 space-y-4">
      {/* Header & Subtitle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center shrink-0">
              <TrendingUp size={16} />
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
              Revenue Analytics
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Daily, weekly, and monthly workshop earnings with historical trends
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 mr-1.5 text-xs text-gray-500">
            <span>Period: <strong className="text-gray-900">{formatCurrency(periodTotalRevenue)}</strong></span>
            <span>•</span>
            <span>Services: <strong className="text-gray-900">{periodTotalServices}</strong></span>
          </div>

          <div className="inline-flex rounded-lg p-1 bg-gray-100 border border-gray-200/80 text-xs font-semibold">
            {(['7D', '30D', '6M', '12M'] as RevenueTimeframe[]).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  timeframe === tf
                    ? 'bg-white text-gray-900 shadow-xs font-bold'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tf === '7D' ? '7 Days' : tf === '30D' ? '30 Days' : tf === '6M' ? '6 Mos' : '12 Mos'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue Breakdown Mini Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {/* Daily Revenue */}
        <div className="p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">Today's Revenue</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900 truncate">
            {formatCurrency(revenue.dailyRevenueToday)}
          </p>
        </div>

        {/* Weekly Revenue */}
        <div className="p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">This Week</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900 truncate">
            {formatCurrency(revenue.weeklyRevenue)}
          </p>
        </div>

        {/* Monthly Revenue */}
        <div className="p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">This Month</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-primary-700 truncate">
            {formatCurrency(revenue.monthlyRevenue)}
          </p>
        </div>

        {/* Previous Month */}
        <div className="p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">Previous Month</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900 truncate">
            {formatCurrency(revenue.previousMonthRevenue)}
          </p>
        </div>

        {/* MoM Growth / Decline */}
        <div className="p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">MoM Growth</p>
          <div className="flex items-center gap-1">
            {revenue.monthOverMonthGrowth !== null ? (
              <span className={`text-xs sm:text-sm font-bold flex items-center ${
                revenue.monthOverMonthGrowth >= 0 ? 'text-emerald-600' : 'text-rose-600'
              }`}>
                {revenue.monthOverMonthGrowth >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
                {revenue.monthOverMonthGrowth}%
              </span>
            ) : (
              <span className="text-xs text-gray-500">—</span>
            )}
          </div>
        </div>

        {/* Total Lifetime Revenue */}
        <div className="p-2.5 rounded-lg bg-primary-50/50 border border-primary-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-primary-800 mb-0.5">Lifetime</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-primary-900 truncate">
            {formatCurrency(revenue.totalLifetimeRevenue)}
          </p>
        </div>
      </div>

      {/* Chart */}
      <div className="h-48 sm:h-56 md:h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#6b7280' }} 
              dy={8} 
            />
            <YAxis 
              yAxisId="rev"
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#6b7280' }} 
              tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`} 
            />
            <YAxis 
              yAxisId="count"
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
                if (value === 'services') return <span className="text-xs text-gray-700 font-medium">Services Count</span>;
                return <span className="text-xs text-gray-700 font-medium">{value}</span>;
              }}
            />
            <Bar 
              yAxisId="rev"
              dataKey="revenue" 
              name="revenue" 
              fill="#ea580c" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={36} 
            />
            <Line 
              yAxisId="count"
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
  );
};
