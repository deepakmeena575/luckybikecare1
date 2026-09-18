import React, { useEffect, useState } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Calendar, 
  Clock, 
  Receipt, 
  IndianRupee, 
  FileText, 
  PlusCircle, 
  History, 
  AlertCircle,
  Loader2,
  ExternalLink,
  MessageCircle
} from 'lucide-react';
import { VehicleQuickSummaryData, ServiceRecord } from '../types';
import { DB } from '../db';
import { formatCurrency } from '../utils';
import { format, differenceInDays } from 'date-fns';

interface VehicleQuickSummaryModalProps {
  vehicleNumber: string | null;
  isOpen: boolean;
  onClose: () => void;
  onViewHistory: (vehicleNumber: string) => void;
  onViewInvoice: (record: ServiceRecord) => void;
  onCreateNewService: (record: ServiceRecord) => void;
}

export const VehicleQuickSummaryModal: React.FC<VehicleQuickSummaryModalProps> = ({
  vehicleNumber,
  isOpen,
  onClose,
  onViewHistory,
  onViewInvoice,
  onCreateNewService,
}) => {
  const [data, setData] = useState<VehicleQuickSummaryData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !vehicleNumber) {
      setData(null);
      setError(null);
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        const summary = await DB.getVehicleQuickSummary(vehicleNumber);
        if (mounted) {
          if (!summary) {
            setError('No active records found for this vehicle.');
          } else {
            setData(summary);
          }
        }
      } catch (err: any) {
        console.error('Error loading vehicle summary:', err);
        if (mounted) setError(err.message || 'Failed to load summary');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [isOpen, vehicleNumber]);

  if (!isOpen) return null;

  // Calculate days remaining or overdue for next service
  let nextServiceStatus: { label: string; isOverdue: boolean; diffText: string } | null = null;
  if (data?.nextServiceDate) {
    try {
      const nextDate = new Date(data.nextServiceDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      nextDate.setHours(0, 0, 0, 0);
      const diffDays = differenceInDays(nextDate, today);

      if (diffDays < 0) {
        nextServiceStatus = {
          label: 'Overdue',
          isOverdue: true,
          diffText: `${Math.abs(diffDays)} days overdue`,
        };
      } else if (diffDays === 0) {
        nextServiceStatus = {
          label: 'Due Today',
          isOverdue: false,
          diffText: 'Service due today',
        };
      } else {
        nextServiceStatus = {
          label: 'Upcoming',
          isOverdue: false,
          diffText: `Due in ${diffDays} days`,
        };
      }
    } catch {
      // ignore date calculation errors
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-gray-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
        aria-hidden="true" 
      />

      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden max-h-[92vh] z-10 animate-in slide-in-from-bottom-6 duration-200">
        {/* Header with Indian registration plate style */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center space-x-3">
            <div className="inline-flex items-center rounded-lg border-2 border-gray-800 bg-yellow-400/90 text-gray-950 font-mono font-extrabold px-3 py-1 shadow-xs tracking-wider text-sm sm:text-base">
              <span className="text-[10px] uppercase font-bold text-gray-700 mr-1.5 border-r border-gray-800/40 pr-1">IND</span>
              <span>{data?.vehicleNumber || vehicleNumber}</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Vehicle Summary</p>
              <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight truncate max-w-[160px] sm:max-w-[220px]">
                {data?.vehicleModel || 'Vehicle'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded-full transition"
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-gray-800 text-sm">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 size={32} className="animate-spin text-primary-500" />
              <p className="text-xs font-medium text-gray-500">Retrieving vehicle records...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center space-y-2">
              <AlertCircle size={32} className="mx-auto text-amber-500" />
              <p className="font-semibold text-gray-800">{error}</p>
              <p className="text-xs text-gray-500">Please try searching with a different vehicle number.</p>
            </div>
          ) : data ? (
            <>
              {/* Customer & Contact Card */}
              <div className="bg-gray-50/70 border border-gray-200/80 rounded-xl p-3.5 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-900 font-semibold">
                    <User size={16} className="text-primary-500 flex-shrink-0" />
                    <span className="truncate">{data.customerName}</span>
                  </div>
                  {data.mobileNumber && (
                    <a
                      href={`tel:${data.mobileNumber}`}
                      className="inline-flex items-center space-x-1 text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100 px-2.5 py-1 rounded-lg transition"
                    >
                      <Phone size={12} />
                      <span>{data.mobileNumber}</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Metrics Grid: 2 columns */}
              <div className="grid grid-cols-2 gap-3">
                {/* Total Services */}
                <div className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-2xs">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Total Services</p>
                  <p className="text-lg font-extrabold text-gray-900 mt-0.5">
                    {data.totalServices} <span className="text-xs font-medium text-gray-500">times</span>
                  </p>
                </div>

                {/* Total Amount Spent */}
                <div className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-2xs">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">Total Spent</p>
                  <p className="text-lg font-extrabold text-emerald-600 mt-0.5">
                    {formatCurrency(data.totalAmountSpent)}
                  </p>
                </div>

                {/* Last Service Date */}
                <div className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-2xs">
                  <div className="flex items-center space-x-1.5 text-gray-500 mb-1">
                    <Calendar size={13} className="text-blue-500" />
                    <span className="text-[11px] font-semibold uppercase tracking-wide">Last Service</span>
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {data.lastServiceDate ? format(new Date(data.lastServiceDate), 'dd MMM yyyy') : '—'}
                  </p>
                </div>

                {/* Next Service Date */}
                <div className="bg-white border border-gray-200/80 rounded-xl p-3 shadow-2xs">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-1.5 text-gray-500">
                      <Clock size={13} className="text-amber-500" />
                      <span className="text-[11px] font-semibold uppercase tracking-wide">Next Service</span>
                    </div>
                    {nextServiceStatus && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase ${
                        nextServiceStatus.isOverdue 
                          ? 'bg-rose-100 text-rose-700' 
                          : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {nextServiceStatus.label}
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-gray-900">
                    {data.nextServiceDate ? format(new Date(data.nextServiceDate), 'dd MMM yyyy') : '—'}
                  </p>
                  {nextServiceStatus && (
                    <p className={`text-[10px] font-medium mt-0.5 ${nextServiceStatus.isOverdue ? 'text-rose-600' : 'text-gray-500'}`}>
                      {nextServiceStatus.diffText}
                    </p>
                  )}
                </div>
              </div>

              {/* Last Invoice Reference */}
              <div className="flex items-center justify-between bg-gray-50 border border-gray-200/70 rounded-xl px-3.5 py-2.5 text-xs">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Receipt size={14} className="text-gray-400" />
                  <span>Last Invoice:</span>
                  <span className="font-mono font-bold text-gray-900">{data.lastInvoiceNumber}</span>
                </div>
                <button
                  onClick={() => {
                    onClose();
                    onViewInvoice(data.latestRecord);
                  }}
                  className="text-primary-600 hover:text-primary-700 font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Open</span>
                  <ExternalLink size={12} />
                </button>
              </div>

              {/* Quick Actions Title */}
              <div className="pt-2">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-2.5">Quick Actions</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Action 1: View Vehicle History */}
                  <button
                    onClick={() => {
                      onClose();
                      onViewHistory(data.vehicleNumber);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-98 text-gray-700 text-xs font-bold transition shadow-2xs"
                  >
                    <History size={14} className="text-gray-600" />
                    <span>View History</span>
                  </button>

                  {/* Action 2: View Latest Invoice */}
                  <button
                    onClick={() => {
                      onClose();
                      onViewInvoice(data.latestRecord);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 active:scale-98 text-gray-700 text-xs font-bold transition shadow-2xs"
                  >
                    <FileText size={14} className="text-blue-600" />
                    <span>Latest Invoice</span>
                  </button>

                  {/* Action 3: Create New Service */}
                  <button
                    onClick={() => {
                      onClose();
                      onCreateNewService(data.latestRecord);
                    }}
                    className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 active:scale-98 text-white text-xs font-bold transition shadow-sm"
                  >
                    <PlusCircle size={14} />
                    <span>New Service</span>
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
