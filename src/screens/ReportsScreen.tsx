import React, { useState, useEffect } from 'react';
import { DB } from '../db';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { formatCurrency } from '../utils';

export const ReportsScreen: React.FC = () => {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const records = await DB.getRecords();
        const data = [];
        const now = new Date();
        
        // Generate last 6 months data
        for (let i = 5; i >= 0; i--) {
          const monthStart = startOfMonth(subMonths(now, i));
          const monthEnd = endOfMonth(subMonths(now, i));
          
          const monthRecords = records.filter(r => {
            const d = new Date(r.dateOfService);
            return isWithinInterval(d, { start: monthStart, end: monthEnd });
          });

          const revenue = monthRecords.reduce((sum, r) => sum + r.totalCost, 0);
          const volume = monthRecords.length;

          data.push({
            month: format(monthStart, 'MMM yy'),
            revenue,
            volume
          });
        }
        
        if (mounted) setChartData(data);
      } catch (error) {
        console.error(error);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const total6MonthRevenue = chartData.reduce((acc, curr) => acc + curr.revenue, 0);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
      <div className="mb-6 max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Analytics & Reports</h1>
        <p className="text-sm text-gray-500 mt-1">6-month performance metrics.</p>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="glass-card p-5">
           <h2 className="text-lg font-bold text-gray-900 mb-1">Revenue Trend</h2>
           <p className="text-sm text-gray-500 mb-6 flex items-center gap-2">
             <span>Total (6m):</span> 
             <span className="font-bold text-primary-600">{formatCurrency(total6MonthRevenue)}</span>
           </p>
           
           <div className="h-72 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} tickFormatter={(val) => `₹${val/1000}k`} />
                 <Tooltip 
                   formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                   contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Line type="monotone" dataKey="revenue" stroke="#f97316" strokeWidth={3} dot={{ r: 4, fill: '#f97316', strokeWidth: 2, stroke: '#ffffff' }} activeDot={{ r: 6 }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="glass-card p-5">
           <h2 className="text-lg font-bold text-gray-900 mb-1">Service Volume</h2>
           <p className="text-sm text-gray-500 mb-6">Number of vehicles serviced per month</p>
           
           <div className="h-72 w-full">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
                 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} allowDecimals={false} />
                 <Tooltip 
                   formatter={(value: number) => [value, 'Services']}
                   cursor={{ fill: '#f3f4f6' }}
                   contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb', color: '#111827', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Bar dataKey="volume" fill="#f97316" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>
    </div>
  );
};
