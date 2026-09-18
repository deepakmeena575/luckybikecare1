import React, { useState } from 'react';
import { FullBusinessAnalytics } from '../../businessAnalytics';
import { 
  Wrench, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  CalendarDays, 
  Bike, 
  Sparkles,
  BarChart2
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

interface ServiceAnalyticsCardProps {
  services: FullBusinessAnalytics['services'];
}

type ServiceTimeframe = '7D' | '30D' | '6M' | '12M';

export const ServiceAnalyticsCard: React.FC<ServiceAnalyticsCardProps> = ({ services }) => {
  const [timeframe, setTimeframe] = useState<ServiceTimeframe>('6M');

  let chartData: Array<{ label: string; services: number }> = [];

  if (timeframe === '7D') {
    chartData = services.chart7D.map(d => ({ label: d.label, services: d.services }));
  } else if (timeframe === '30D') {
    chartData = services.chart30D.map(d => ({ label: d.label, services: d.services }));
  } else if (timeframe === '6M') {
    chartData = services.chart6M.map(d => ({ label: d.month, services: d.services }));
  } else {
    chartData = services.chart12M.map(d => ({ label: d.month, services: d.services }));
  }

  const completionRate = services.totalServices > 0 
    ? Math.round((services.completedServices / services.totalServices) * 100) 
    : 100;

  return (
    <div className="glass-card p-3.5 sm:p-5 space-y-4">
      {/* Header & Subtitle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
              <Wrench size={16} />
            </div>
            <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
              Service Operations & Volume
            </h3>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Workload distribution, service status fulfillment, and monthly throughput
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="inline-flex rounded-lg p-1 bg-gray-100 border border-gray-200/80 text-xs font-semibold">
          {(['7D', '30D', '6M', '12M'] as ServiceTimeframe[]).map((tf) => (
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

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {/* Total Services */}
        <div className="p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">Total Services</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
            {services.totalServices}
          </p>
        </div>

        {/* Completed Services */}
        <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-teal-800 mb-0.5">Completed</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-teal-900">
            {services.completedServices} ({completionRate}%)
          </p>
        </div>

        {/* Pending Services */}
        <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-amber-800 mb-0.5">Pending Dues</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-amber-900">
            {services.pendingServices}
          </p>
        </div>

        {/* Cancelled Services */}
        <div className="p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">Cancelled</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-gray-700">
            {services.cancelledServices}
          </p>
        </div>

        {/* Services This Month */}
        <div className="p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">This Month</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
            {services.servicesThisMonth} services
          </p>
        </div>

        {/* Monthly Avg Throughput */}
        <div className="p-2.5 rounded-lg bg-gray-50/80 border border-gray-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">Avg Per Month</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
            ~{services.avgServicesPerMonth} / month
          </p>
        </div>
      </div>

      {/* Operational Highlights inside Service Analytics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-blue-50/60 border border-blue-100/80 text-xs">
          <div className="p-1.5 rounded-md bg-blue-100 text-blue-700 shrink-0">
            <Bike size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-500 text-[10px] sm:text-[11px]">Most Serviced Vehicle</p>
            <p className="font-bold text-gray-900 truncate text-xs sm:text-sm">{services.mostServicedVehicleName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-purple-50/60 border border-purple-100/80 text-xs">
          <div className="p-1.5 rounded-md bg-purple-100 text-purple-700 shrink-0">
            <Sparkles size={15} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-gray-500 text-[10px] sm:text-[11px]">Most Frequent Service Job</p>
            <p className="font-bold text-gray-900 truncate text-xs sm:text-sm">{services.mostCommonServiceName}</p>
          </div>
        </div>
      </div>

      {/* Service Volume Chart */}
      <div className="h-44 sm:h-52 md:h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#6b7280' }} 
              dy={8} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: '#6b7280' }} 
              allowDecimals={false}
            />
            <Tooltip 
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const serv = payload[0].value as number;
                  return (
                    <div className="bg-white p-2.5 rounded-xl shadow-lg border border-gray-200 text-xs">
                      <p className="font-bold text-gray-900 mb-1">{label}</p>
                      <p className="text-teal-700 font-semibold">{serv} services completed</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar 
              dataKey="services" 
              fill="#0d9488" 
              radius={[4, 4, 0, 0]} 
              maxBarSize={32} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
