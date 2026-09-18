import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { DB } from '../db';
import { ServiceRecord, Screen } from '../types';
import { 
  formatCurrency, 
  calculateTrashRetention, 
  getRecordDeletedAt 
} from '../utils';
import { 
  Trash2, 
  RotateCcw, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Eye, 
  ShieldAlert, 
  X,
  Info,
  ArrowLeft
} from 'lucide-react';
import { format } from 'date-fns';

interface RecentlyDeletedScreenProps {
  onViewRecord?: (record: ServiceRecord) => void;
  onNavigate?: (tab: Screen) => void;
}

export const RecentlyDeletedScreen: React.FC<RecentlyDeletedScreenProps> = ({ 
  onViewRecord, 
  onNavigate 
}) => {
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'active' | 'expired'>('all');
  
  // Permanent deletion modal state
  const [targetRecordForPermanentDelete, setTargetRecordForPermanentDelete] = useState<ServiceRecord | null>(null);
  const [isPermanentDeleting, setIsPermanentDeleting] = useState(false);
  
  // Batch cleanup modal state
  const [showBatchCleanupModal, setShowBatchCleanupModal] = useState(false);
  const [isCleaningUpBatch, setIsCleaningUpBatch] = useState(false);

  // Restoring state tracking
  const [restoringId, setRestoringId] = useState<string | null>(null);

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const loadDeletedRecords = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await DB.getDeletedRecords();
      setRecords(data);
    } catch (error) {
      console.error('Failed to load deleted records:', error);
      showToast('Failed to fetch deleted records. Please check connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDeletedRecords();
  }, [loadDeletedRecords]);

  // Handle Restore
  const handleRestore = async (record: ServiceRecord) => {
    setRestoringId(record.id);
    try {
      await DB.restoreRecord(record.id);
      showToast(`Invoice ${record.id} restored successfully! It is now active in Search, Vehicle History, and Reports.`, 'success');
      // Remove from local list immediately
      setRecords(prev => prev.filter(r => r.id !== record.id));
    } catch (err: any) {
      console.error('Failed to restore record:', err);
      showToast(err.message || 'Failed to restore record. Please try again.', 'error');
    } finally {
      setRestoringId(null);
    }
  };

  // Handle Permanent Delete confirmation
  const handleConfirmPermanentDelete = async () => {
    if (!targetRecordForPermanentDelete) return;
    setIsPermanentDeleting(true);
    const idToDelete = targetRecordForPermanentDelete.id;
    try {
      await DB.permanentlyDeleteRecord(idToDelete);
      showToast(`Invoice ${idToDelete} permanently deleted.`, 'info');
      setRecords(prev => prev.filter(r => r.id !== idToDelete));
      setTargetRecordForPermanentDelete(null);
    } catch (err: any) {
      console.error('Failed to permanently delete record:', err);
      showToast(err.message || 'Failed to permanently delete record.', 'error');
    } finally {
      setIsPermanentDeleting(false);
    }
  };

  // Handle Batch Cleanup for Expired Records
  const handleConfirmBatchCleanup = async () => {
    setIsCleaningUpBatch(true);
    try {
      const res = await DB.cleanupExpiredDeletedRecords(90);
      showToast(`Cleaned up ${res.deletedCount} expired record(s) older than 90 days.`, 'info');
      setShowBatchCleanupModal(false);
      await loadDeletedRecords();
    } catch (err: any) {
      console.error('Failed to clean up expired records:', err);
      showToast(err.message || 'Failed to clean up expired records.', 'error');
    } finally {
      setIsCleaningUpBatch(false);
    }
  };

  // Calculate retention info map for fast reference
  const retentionMap = useMemo(() => {
    const map = new Map<string, ReturnType<typeof calculateTrashRetention>>();
    records.forEach(r => {
      const delAt = getRecordDeletedAt(r);
      map.set(r.id, calculateTrashRetention(delAt, 90));
    });
    return map;
  }, [records]);

  // Statistics
  const stats = useMemo(() => {
    let activeCount = 0;
    let expiredCount = 0;
    records.forEach(r => {
      const ret = retentionMap.get(r.id);
      if (ret?.isExpired) {
        expiredCount++;
      } else {
        activeCount++;
      }
    });
    return {
      total: records.length,
      activeCount,
      expiredCount,
    };
  }, [records, retentionMap]);

  // Filtered and searched records
  const filteredRecords = useMemo(() => {
    let result = records;

    // Filter by retention state
    if (filterType === 'active') {
      result = result.filter(r => !retentionMap.get(r.id)?.isExpired);
    } else if (filterType === 'expired') {
      result = result.filter(r => retentionMap.get(r.id)?.isExpired);
    }

    // Search query
    const q = searchQuery.toLowerCase().trim();
    if (q) {
      result = result.filter(r => 
        (r.vehicleNumber && r.vehicleNumber.toLowerCase().includes(q)) ||
        (r.customerName && r.customerName.toLowerCase().includes(q)) ||
        (r.mobileNumber && r.mobileNumber.toLowerCase().includes(q)) ||
        (r.id && r.id.toLowerCase().includes(q)) ||
        (r.vehicleModel && r.vehicleModel.toLowerCase().includes(q))
      );
    }

    return result;
  }, [records, retentionMap, filterType, searchQuery]);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
      {/* Toast message banner */}
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-sm font-semibold transition-all animate-in fade-in slide-in-from-top-2 ${
          toastMessage.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : toastMessage.type === 'error'
            ? 'bg-rose-50 text-rose-800 border-rose-200'
            : 'bg-gray-900 text-white border-gray-800'
        }`}>
          {toastMessage.type === 'success' && <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />}
          {toastMessage.type === 'error' && <AlertTriangle size={18} className="text-rose-600 flex-shrink-0" />}
          {toastMessage.type === 'info' && <Info size={18} className="text-gray-300 flex-shrink-0" />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Screen Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-700">
              <Trash2 size={18} strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Recently Deleted</h1>
          </div>
          <p className="text-sm text-gray-500">
            Deleted service records are safely kept here for <strong className="text-gray-700 font-semibold">90 days</strong> before permanent deletion.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 shadow-xs transition"
            >
              <ArrowLeft size={15} />
              <span>Back to Dashboard</span>
            </button>
          )}

          <button
            onClick={loadDeletedRecords}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-gray-700 bg-white hover:bg-gray-100 rounded-xl border border-gray-200 shadow-xs transition disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* 90-Day Policy Info Banner & Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-gray-400">Total in Trash</p>
            <p className="text-2xl font-black text-gray-900 mt-0.5">{stats.total}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600">
            <Trash2 size={20} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Restorable (≤ 90 Days)</p>
            <p className="text-2xl font-black text-emerald-700 mt-0.5">{stats.activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <RotateCcw size={20} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-rose-600">Expired (&gt; 90 Days)</p>
            <p className="text-2xl font-black text-rose-700 mt-0.5">{stats.expiredCount}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
            <Clock size={20} />
          </div>
        </div>
      </div>

      {/* Expired Records Alert Banner */}
      {stats.expiredCount > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-900">
                {stats.expiredCount} record{stats.expiredCount > 1 ? 's have' : ' has'} exceeded the 90-day restore window.
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Eligible for permanent cleanup in adherence with retention rules.
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowBatchCleanupModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm transition active:scale-98 whitespace-nowrap"
          >
            <Trash2 size={14} />
            <span>Clean Up Expired Records</span>
          </button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-3.5 border border-gray-200 shadow-xs mb-6 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between sm:gap-4">
        <div className="relative flex-1">
          <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by vehicle, customer name, phone, or invoice..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setFilterType('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'active'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Restorable ({stats.activeCount})
          </button>
          <button
            onClick={() => setFilterType('expired')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              filterType === 'expired'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Expired ({stats.expiredCount})
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
          <RefreshCw size={28} className="animate-spin text-primary-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-gray-600">Loading recently deleted records...</p>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-4">
            <Trash2 size={28} />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {searchQuery || filterType !== 'all' ? 'No matching deleted records' : 'Recently Deleted is Empty'}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-4">
            {searchQuery || filterType !== 'all'
              ? 'Try changing your search keywords or filter tab.'
              : 'When you delete a service record, it will be kept here for 90 days before permanent deletion.'}
          </p>
          {(searchQuery || filterType !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterType('all');
              }}
              className="px-4 py-2 text-xs font-bold text-primary-700 bg-primary-50 rounded-xl hover:bg-primary-100 transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl shadow-xs border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] font-extrabold uppercase tracking-wider text-gray-500">
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Deleted &amp; 90-Day Policy</th>
                    <th className="py-3 px-4">Customer &amp; Vehicle</th>
                    <th className="py-3 px-4">Service Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredRecords.map((record) => {
                    const retention = retentionMap.get(record.id) || calculateTrashRetention(getRecordDeletedAt(record), 90);
                    const delDateObj = new Date(retention.deletedAt);
                    const isRestoring = restoringId === record.id;

                    return (
                      <tr key={record.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* Invoice Number */}
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                          {record.id}
                        </td>

                        {/* 90-Day Restore Policy Status */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
                              <Calendar size={13} className="text-gray-400 flex-shrink-0" />
                              <span>{retention.deletedRelativeText}</span>
                              <span className="text-[11px] text-gray-400 font-normal">
                                ({format(delDateObj, 'dd MMM yyyy')})
                              </span>
                            </div>

                            <div>
                              {retention.isExpired ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                  <AlertTriangle size={11} />
                                  <span>{retention.retentionRemainingText}</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                  <Clock size={11} className="text-amber-600" />
                                  <span>{retention.retentionRemainingText}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Customer & Vehicle */}
                        <td className="py-3.5 px-4">
                          <div>
                            <div className="font-bold text-gray-900 uppercase">
                              {record.vehicleNumber}
                            </div>
                            <div className="text-xs text-gray-500">
                              {record.customerName} • {record.mobileNumber}
                            </div>
                            {record.vehicleModel && (
                              <div className="text-[11px] text-gray-400 uppercase">
                                {record.vehicleModel}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Service Date */}
                        <td className="py-3.5 px-4 text-xs font-medium text-gray-600">
                          <div>{format(new Date(record.dateOfService), 'dd MMM yyyy')}</div>
                          <div className="text-[11px] text-gray-400">{record.kilometerReading} km</div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-3.5 px-4">
                          <div className="font-extrabold text-gray-900">
                            {formatCurrency(record.totalCost)}
                          </div>
                          {record.dueAmount > 0 && (
                            <div className="text-[10px] font-bold text-rose-500 uppercase">
                              Due: {formatCurrency(record.dueAmount)}
                            </div>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Invoice */}
                            {onViewRecord && (
                              <button
                                onClick={() => onViewRecord(record)}
                                className="p-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg shadow-xs transition"
                                title="View original invoice details"
                              >
                                <Eye size={16} strokeWidth={2.5} />
                              </button>
                            )}

                            {/* Restore Button */}
                            <button
                              onClick={() => handleRestore(record)}
                              disabled={isRestoring}
                              className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 shadow-xs transition active:scale-95 disabled:opacity-50"
                              title="Restore to active records"
                            >
                              <RotateCcw size={14} className={isRestoring ? 'animate-spin' : ''} strokeWidth={2.5} />
                              <span>Restore</span>
                            </button>

                            {/* Permanently Delete Button */}
                            <button
                              onClick={() => setTargetRecordForPermanentDelete(record)}
                              className="flex items-center gap-1.5 py-1.5 px-3 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 shadow-xs transition active:scale-95"
                              title="Permanently remove forever"
                            >
                              <Trash2 size={14} strokeWidth={2.5} />
                              <span>Permanently Delete</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-3.5">
            {filteredRecords.map((record) => {
              const retention = retentionMap.get(record.id) || calculateTrashRetention(getRecordDeletedAt(record), 90);
              const delDateObj = new Date(retention.deletedAt);
              const isRestoring = restoringId === record.id;

              return (
                <div key={record.id} className="bg-white rounded-xl shadow-xs border border-gray-200 p-4 space-y-3">
                  {/* Top: Vehicle & Amount */}
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900 text-base uppercase">{record.vehicleNumber}</h3>
                        <span className="font-mono text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600 font-semibold">
                          {record.id}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {record.customerName} • {record.mobileNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900 text-base">{formatCurrency(record.totalCost)}</p>
                      {record.dueAmount > 0 && (
                        <p className="text-[10px] text-rose-500 font-bold uppercase">
                          Due: {formatCurrency(record.dueAmount)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 90-Day Policy Box */}
                  <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-gray-700 flex items-center gap-1.5">
                        <Calendar size={13} className="text-gray-400" />
                        {retention.deletedRelativeText}
                      </span>
                      <span className="text-[11px] text-gray-400">
                        {format(delDateObj, 'dd MMM yyyy')}
                      </span>
                    </div>

                    <div className="pt-1">
                      {retention.isExpired ? (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
                          <AlertTriangle size={12} />
                          <span>{retention.retentionRemainingText}</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                          <Clock size={12} className="text-amber-700" />
                          <span>{retention.retentionRemainingText}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Service info chips */}
                  <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                    <span>Service: {format(new Date(record.dateOfService), 'dd MMM yy')}</span>
                    <span>•</span>
                    <span>{record.kilometerReading} km</span>
                    {record.vehicleModel && (
                      <>
                        <span>•</span>
                        <span className="uppercase">{record.vehicleModel}</span>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => handleRestore(record)}
                      disabled={isRestoring}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-extrabold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 active:scale-98 rounded-xl border border-emerald-300 shadow-xs transition"
                    >
                      <RotateCcw size={15} className={isRestoring ? 'animate-spin' : ''} strokeWidth={2.5} />
                      <span>Restore</span>
                    </button>

                    <button
                      onClick={() => setTargetRecordForPermanentDelete(record)}
                      className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-extrabold text-rose-800 bg-rose-50 hover:bg-rose-100 active:scale-98 rounded-xl border border-rose-300 shadow-xs transition"
                    >
                      <Trash2 size={15} strokeWidth={2.5} />
                      <span>Delete Forever</span>
                    </button>
                  </div>

                  {onViewRecord && (
                    <button
                      onClick={() => onViewRecord(record)}
                      className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition"
                    >
                      <Eye size={14} />
                      <span>View Invoice Details</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Permanent Delete Confirmation Dialog */}
      {targetRecordForPermanentDelete && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                <ShieldAlert size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
                  Permanently Delete Record?
                </h3>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="bg-rose-50/60 border border-rose-200 rounded-xl p-3.5 my-4 text-xs space-y-1.5 text-gray-700">
              <p className="font-semibold text-gray-900">
                You are about to permanently erase:
              </p>
              <div className="font-mono text-xs bg-white px-2.5 py-1.5 rounded-lg border border-rose-100">
                <span className="font-bold text-gray-900">{targetRecordForPermanentDelete.id}</span>
                <span className="text-gray-500"> • {targetRecordForPermanentDelete.vehicleNumber} ({targetRecordForPermanentDelete.customerName})</span>
              </div>
              <p className="text-rose-800 font-medium">
                Warning: This invoice and all its parts, labour, and payment history will be permanently deleted from Supabase. You will not be able to restore it.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setTargetRecordForPermanentDelete(null)}
                disabled={isPermanentDeleting}
                className="px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
              >
                Keep in Trash
              </button>
              <button
                onClick={handleConfirmPermanentDelete}
                disabled={isPermanentDeleting}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isPermanentDeleting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Deleting Forever...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} strokeWidth={2.5} />
                    <span>Yes, Permanently Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Cleanup Modal */}
      {showBatchCleanupModal && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center">
                <AlertTriangle size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
                  Clean Up Expired Records?
                </h3>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                  90-Day Retention Policy
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-600 my-4 leading-relaxed">
              You are about to permanently delete <strong className="text-gray-900 font-bold">{stats.expiredCount} record(s)</strong> that have remained in Recently Deleted for more than 90 days.
              <br /><br />
              This action <strong className="text-rose-600 font-bold">cannot be undone</strong>. Please confirm intended retention cleanup.
            </p>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setShowBatchCleanupModal(false)}
                disabled={isCleaningUpBatch}
                className="px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBatchCleanup}
                disabled={isCleaningUpBatch}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-xl shadow-md transition disabled:opacity-50"
              >
                {isCleaningUpBatch ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>Cleaning Up...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={14} strokeWidth={2.5} />
                    <span>Confirm &amp; Clean Up</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
