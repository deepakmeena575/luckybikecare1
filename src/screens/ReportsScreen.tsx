import React, { useState, useEffect, useCallback } from 'react';
import { DB } from '../db';
import { ServiceRecord } from '../types';
import { 
  FullBusinessAnalytics, 
  DateFilterPreset, 
  DateFilterConfig, 
  computeFullBusinessAnalytics, 
  filterRecordsByDate, 
  generateAnalyticsCsv 
} from '../businessAnalytics';
import { formatCurrency } from '../utils';
import { AnalyticsKpiCards } from '../components/analytics/AnalyticsKpiCards';
import { TopHighlightsCards } from '../components/analytics/TopHighlightsCards';
import { RevenueAnalyticsCard } from '../components/analytics/RevenueAnalyticsCard';
import { ServiceAnalyticsCard } from '../components/analytics/ServiceAnalyticsCard';
import { PaymentBillingCard } from '../components/analytics/PaymentBillingCard';
import { MonthlyPerformanceTable } from '../components/analytics/MonthlyPerformanceTable';
import { CustomerAnalyticsTable } from '../components/analytics/CustomerAnalyticsTable';
import { VehicleAnalyticsTable } from '../components/analytics/VehicleAnalyticsTable';
import { PartsAnalyticsTable } from '../components/analytics/PartsAnalyticsTable';
import { ServiceReminderAnalyticsCard } from '../components/analytics/ServiceReminderAnalyticsCard';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer, 
  RefreshCw, 
  Filter, 
  Check, 
  AlertCircle,
  FileSpreadsheet,
  Layers
} from 'lucide-react';
import { format } from 'date-fns';

export const ReportsScreen: React.FC = () => {
  const [allRecords, setAllRecords] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Global Date Filter State
  const [filterPreset, setFilterPreset] = useState<DateFilterPreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Toast / notification feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const loadData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const records = await DB.getRecords();
      setAllRecords(records);
      if (isRefresh) {
        showToast('Workshop analytics refreshed successfully');
      }
    } catch (err: any) {
      console.error('Failed to load records for analytics:', err);
      setError('Unable to load database records. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Compute analytics based on current filter
  const filterConfig: DateFilterConfig = {
    preset: filterPreset,
    customStartDate: filterPreset === 'custom' ? customStartDate : undefined,
    customEndDate: filterPreset === 'custom' ? customEndDate : undefined,
  };

  const { filterLabel } = filterRecordsByDate(allRecords, filterConfig);
  const analytics: FullBusinessAnalytics = computeFullBusinessAnalytics(allRecords, filterConfig);

  // Export to CSV
  const handleExportCsv = () => {
    try {
      const csvContent = generateAnalyticsCsv(analytics, filterLabel);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const dateTag = format(new Date(), 'yyyyMMdd_HHmm');
      link.setAttribute('download', `LuckyBikeCare_Business_Report_${dateTag}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Business report CSV downloaded');
    } catch (e) {
      console.error('Export CSV error:', e);
      showToast('Failed to export CSV report');
    }
  };

  // Print Report
  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold text-gray-700">Loading Business Analytics...</p>
          <p className="text-xs text-gray-400">Auditing workshop records and computing revenue metrics</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="glass-card p-6 max-w-md w-full text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle size={24} />
          </div>
          <h3 className="text-base font-bold text-gray-900">Failed to Load Reports</h3>
          <p className="text-xs text-gray-500">{error}</p>
          <button
            type="button"
            onClick={() => loadData()}
            className="btn-primary w-full py-2.5 text-xs font-semibold flex items-center justify-center gap-2"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 sm:p-5 md:p-6 overflow-y-auto pb-24 md:pb-12 space-y-4 sm:space-y-5 max-w-7xl mx-auto w-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white text-xs sm:text-sm font-medium px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-gray-700 animate-in fade-in slide-in-from-bottom-2 no-print">
          <Check size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-gray-200/80">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-500 text-white flex items-center justify-center shadow-xs">
              <BarChart3 size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              Business Analytics
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Understand your workshop performance, revenue, services, customers and vehicle activity.
          </p>
        </div>

        {/* Global Controls: Date Filter, Export, Print, Refresh */}
        <div className="flex flex-wrap items-center gap-2 no-print">
          {/* Global Date Filter Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-2.5 py-1.5 shadow-xs">
            <Filter size={14} className="text-primary-600 shrink-0" />
            <select
              value={filterPreset}
              onChange={(e) => setFilterPreset(e.target.value as DateFilterPreset)}
              className="text-xs font-semibold text-gray-800 bg-transparent border-none focus:outline-none cursor-pointer pr-2"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
              <option value="prev_month">Previous Month</option>
              <option value="last_3m">Last 3 Months</option>
              <option value="last_6m">Last 6 Months</option>
              <option value="this_year">This Year</option>
              <option value="custom">Custom Date Range</option>
            </select>
          </div>

          {/* Export Report */}
          <button
            type="button"
            onClick={handleExportCsv}
            title="Download Full Business Report in CSV"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 shadow-xs transition-colors"
          >
            <Download size={14} className="text-gray-500" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Print Report */}
          <button
            type="button"
            onClick={handlePrint}
            title="Print or Save PDF Report"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 shadow-xs transition-colors"
          >
            <Printer size={14} className="text-gray-500" />
            <span className="hidden sm:inline">Print Report</span>
          </button>

          {/* Refresh Data */}
          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            title="Refresh database records"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-primary-700 bg-primary-50 border border-primary-200 rounded-xl hover:bg-primary-100 shadow-xs transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">{refreshing ? 'Updating...' : 'Refresh'}</span>
          </button>
        </div>
      </div>

      {/* Custom Date Inputs (when Custom Range selected) */}
      {filterPreset === 'custom' && (
        <div className="glass-card p-3 sm:p-4 bg-primary-50/40 border border-primary-200/80 flex flex-wrap items-center gap-3 no-print">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
            <Calendar size={14} className="text-primary-600" />
            <span>Select Custom Range:</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">From:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">To:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
          {customStartDate && customEndDate && (
            <span className="text-xs font-semibold text-primary-800 bg-primary-100 px-2 py-1 rounded">
              Active: {filterLabel}
            </span>
          )}
        </div>
      )}

      {/* Print-Only Header Banner */}
      <div className="hidden print:block mb-6 pb-4 border-b-2 border-gray-900">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">LUCKY BIKE CARE</h1>
            <p className="text-xs text-gray-600">Official Workshop Performance & Financial Report</p>
          </div>
          <div className="text-right text-xs text-gray-600">
            <p>Generated: {format(new Date(), 'dd MMMM yyyy HH:mm')}</p>
            <p className="font-semibold">Period: {filterLabel}</p>
          </div>
        </div>
      </div>

      {/* 1. Top 12 KPI Summary Cards */}
      <AnalyticsKpiCards kpis={analytics.kpis} />

      {/* 2. Top Performing Highlights (Most Serviced Vehicle, Top Customer, Top Part, Most Common Service, Highest Bill, Best Month) */}
      <TopHighlightsCards highlights={analytics.topHighlights} />

      {/* 3. Revenue Analytics (with 7D, 30D, 6M, 12M interactive chart) */}
      <RevenueAnalyticsCard revenue={analytics.revenue} />

      {/* 4. Service Volume & Operations Analytics (with interactive chart) */}
      <ServiceAnalyticsCard services={analytics.services} />

      {/* 5. Payment & Billing Report */}
      <PaymentBillingCard billing={analytics.paymentBilling} />

      {/* 6. Monthly Business Performance Table */}
      <MonthlyPerformanceTable 
        data6M={analytics.monthlyPerformance.data6M}
        data12M={analytics.monthlyPerformance.data12M}
      />

      {/* 7. Customer Analytics & Directory */}
      <CustomerAnalyticsTable customers={analytics.customers} />

      {/* 8. Vehicle Fleet Analytics */}
      <VehicleAnalyticsTable vehicles={analytics.vehicles} />

      {/* 9. Parts & Inventory Analytics */}
      <PartsAnalyticsTable parts={analytics.parts} />

      {/* 10. Service Reminder Analytics (Strictly Service Reminders) */}
      <ServiceReminderAnalyticsCard reminders={analytics.serviceReminders} />
    </div>
  );
};
