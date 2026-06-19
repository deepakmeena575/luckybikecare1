import React, { useEffect, useState } from 'react';
import { DB } from '../db';
import { Users, FileText, IndianRupee, AlertCircle, BellRing, Settings, Loader2 } from 'lucide-react';
import { formatCurrency } from '../utils';
import { format } from 'date-fns';

export const DashboardScreen: React.FC = () => {
  const [stats, setStats] = useState<ReturnType<typeof DB.getDashboardStats> | null>(null);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      try {
        const data = await DB.getDashboardStats();
        if (mounted) setStats(data);
      } catch (e) {
        console.error(e);
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  if (!stats) {
    return (
      <div className="flex-1 flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-primary-500" size={32} />
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Overview of service center performance.</p>
        </div>
        <div className="hidden md:flex items-center space-x-3 bg-gray-50 px-4 py-2 rounded-xl shadow-sm border border-gray-100">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-sm font-medium text-gray-700">System Online</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Total Customers" 
          value={stats.totalCustomers.toString()} 
          icon={<Users size={20} className="text-blue-600" />} 
          bg="bg-blue-50" 
        />
        <StatCard 
          title="Total Services" 
          value={stats.totalServices.toString()} 
          icon={<FileText size={20} className="text-emerald-600" />} 
          bg="bg-emerald-50" 
        />
        <StatCard 
          title="Monthly Revenue" 
          value={formatCurrency(stats.monthlyRevenue)} 
          icon={<IndianRupee size={20} className="text-violet-600" />} 
          bg="bg-violet-50" 
        />
        <StatCard 
          title="Pending Dues" 
          value={formatCurrency(stats.pendingDuesTotal)} 
          icon={<AlertCircle size={20} className="text-rose-600" />} 
          bg="bg-rose-50" 
          highlight={stats.pendingDuesTotal > 0}
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Upcoming Reminders */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <BellRing size={18} className="text-amber-500" />
              <span>Upcoming Service Reminders</span>
            </h2>
            <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-full">
              {stats.upcomingRemindersCount}
            </span>
          </div>
          
          <div className="space-y-3">
            {stats.upcomingReminderRecords.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No reminders in the next 30 days.</p>
            ) : (
              stats.upcomingReminderRecords.slice(0, 5).map(record => (
                <div key={record.id} className="flex flex-col sm:flex-row sm:justify-between p-3 rounded-lg border border-gray-100 bg-gray-50/50">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{record.customerName}</p>
                    <p className="text-xs text-gray-500">{record.vehicleNumber} • {record.mobileNumber}</p>
                  </div>
                  <div className="mt-2 sm:mt-0 text-left sm:text-right">
                    <p className="text-xs font-medium text-amber-600">
                      Due: {format(new Date(record.nextServiceDate), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>
              ))
            )}
            {stats.upcomingReminderRecords.length > 5 && (
              <button className="w-full text-center text-sm text-primary-600 font-medium pt-2">
                View all {stats.upcomingReminderRecords.length} reminders
              </button>
            )}
          </div>
        </div>

        {/* Pending Dues List */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
              <AlertCircle size={18} className="text-rose-500" />
              <span>Pending Dues</span>
            </h2>
          </div>
          
          <div className="space-y-3">
            {stats.pendingDueRecords.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No pending dues. Great job!</p>
            ) : (
              stats.pendingDueRecords.slice(0, 5).map(record => (
                <div key={record.id} className="flex items-center justify-between p-3 rounded-lg border border-rose-100 bg-rose-50/30">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{record.customerName}</p>
                    <p className="text-xs text-gray-500">{record.vehicleNumber} • {format(new Date(record.dateOfService), 'MMM dd, yyyy')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-rose-600">
                      {formatCurrency(record.dueAmount)}
                    </p>
                    <p className="text-[10px] text-gray-500">Invoice: {record.id}</p>
                  </div>
                </div>
              ))
            )}
             {stats.pendingDueRecords.length > 5 && (
              <button className="w-full text-center text-sm text-primary-600 font-medium pt-2">
                View all dues
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Services */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
            <FileText size={18} className="text-primary-500" />
            <span>Recent Services</span>
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/50">
              <tr>
                <th className="px-4 py-3 font-medium rounded-tl-lg rounded-bl-lg">Date</th>
                <th className="px-4 py-3 font-medium">Customer</th>
                <th className="px-4 py-3 font-medium">Vehicle</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium rounded-tr-lg rounded-br-lg text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-500">No recent services.</td>
                </tr>
              ) : (
                stats.recentRecords.map(record => (
                  <tr key={record.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/30 transition-colors">
                    <td className="px-4 py-3 whitespace-nowrap text-gray-600">{format(new Date(record.dateOfService), 'dd MMM yyyy')}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{record.customerName}</td>
                    <td className="px-4 py-3 text-gray-600">{record.vehicleNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{formatCurrency(record.totalCost)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${record.dueAmount === 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {record.dueAmount === 0 ? 'Paid' : 'Due'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  bg: string;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bg, highlight }) => (
  <div className={`glass-card p-5 border-l-4 ${highlight ? 'border-l-rose-500' : 'border-l-transparent'}`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl ${bg}`}>
        {icon}
      </div>
    </div>
  </div>
);
