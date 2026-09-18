import React, { useState, useMemo } from 'react';
import { 
  BellRing, 
  Calendar, 
  Clock, 
  Phone, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  MessageCircle, 
  RotateCw, 
  X, 
  Check,
  Maximize2,
  Minimize2,
  CalendarClock,
  Copy,
  Database
} from 'lucide-react';
import { ServiceReminderItem, ReminderCategory } from '../types';
import { DB } from '../db';
import { generateServiceReminderWhatsAppText } from '../whatsappTemplates';
import { format } from 'date-fns';
import { parseIsoDateOnly } from '../utils';

interface SmartReminderCenterProps {
  reminders: ServiceReminderItem[];
  counts: Record<ReminderCategory, number>;
  onReminderUpdated?: () => Promise<void> | void;
  isExpandedView?: boolean;
  onToggleExpand?: () => void;
}

export const SmartReminderCenter: React.FC<SmartReminderCenterProps> = ({
  reminders: initialReminders,
  counts: initialCounts,
  onReminderUpdated,
  isExpandedView = false,
  onToggleExpand,
}) => {
  const [reminders, setReminders] = useState<ServiceReminderItem[]>(initialReminders);
  const [activeCategory, setActiveCategory] = useState<ReminderCategory | 'all'>('this_month');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReminderId, setSelectedReminderId] = useState<string | null>(null);
  const [showAllInline, setShowAllInline] = useState(false);

  // Confirmation modal state
  const [confirmModalItem, setConfirmModalItem] = useState<ServiceReminderItem | null>(null);
  const [migrationErrorItem, setMigrationErrorItem] = useState<ServiceReminderItem | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync with prop updates from database
  React.useEffect(() => {
    setReminders(initialReminders);
  }, [initialReminders]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Filter reminders based on active category and search
  const filteredReminders = useMemo(() => {
    return reminders.filter(item => {
      // Category filter
      if (activeCategory !== 'all' && !item.categories.includes(activeCategory)) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesVeh = item.vehicleNumber.toLowerCase().includes(q);
        const matchesCust = item.customerName.toLowerCase().includes(q);
        const matchesMob = item.mobileNumber.includes(q);
        return matchesVeh || matchesCust || matchesMob;
      }
      return true;
    });
  }, [reminders, activeCategory, searchQuery]);

  // Recalculate category counts dynamically
  const categoryCounts = useMemo(() => {
    const counts: Record<ReminderCategory, number> = {
      this_month: 0,
      this_week: 0,
      next_7_days: 0,
      overdue: 0,
    };
    reminders.forEach(item => {
      item.categories.forEach(cat => {
        counts[cat]++;
      });
    });
    return counts;
  }, [reminders]);

  // Handle clicking WhatsApp send reminder
  const handleOpenWhatsApp = (item: ServiceReminderItem) => {
    const text = generateServiceReminderWhatsAppText(item);
    let cleanMobile = item.mobileNumber.replace(/\D/g, '');
    if (cleanMobile.startsWith('91') && cleanMobile.length === 12) {
      cleanMobile = cleanMobile.slice(2);
    }
    const url = `https://wa.me/91${cleanMobile}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');

    // Prompt user to confirm after sending
    setConfirmModalItem(item);
  };

  // Confirm that the reminder was indeed sent
  const handleConfirmSent = async () => {
    if (!confirmModalItem) return;
    setIsUpdating(true);
    const sentTimestamp = new Date().toISOString();

    try {
      // 1. Update the corresponding database service record
      // 2. Set reminderStatus = "sent"
      // 3. Set lastReminderSentDate = current timestamp
      await DB.updateReminderStatus(confirmModalItem.record.id, 'sent', sentTimestamp);

      // 4. Refresh/update the UI from the database result
      if (onReminderUpdated) {
        await onReminderUpdated();
      }

      showToast(`Reminder marked as "Sent" for ${confirmModalItem.vehicleNumber}`);
      setConfirmModalItem(null);
    } catch (err: any) {
      console.error('Failed to update reminder status in database:', err);
      // Check if columns do not yet exist in database table
      if (err?.code === 'PGRST204' || err?.message?.includes('reminderStatus')) {
        setMigrationErrorItem(confirmModalItem);
        setConfirmModalItem(null);
      } else {
        showToast(err?.message || 'Error updating reminder status. Please try again.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const categoriesConfig: { id: ReminderCategory; label: string; count: number; badgeColor: string }[] = [
    { id: 'this_month', label: 'Due This Month', count: categoryCounts.this_month, badgeColor: 'bg-amber-100 text-amber-800' },
    { id: 'this_week', label: 'Due This Week', count: categoryCounts.this_week, badgeColor: 'bg-blue-100 text-blue-800' },
    { id: 'next_7_days', label: 'Due in Next 7 Days', count: categoryCounts.next_7_days, badgeColor: 'bg-emerald-100 text-emerald-800' },
    { id: 'overdue', label: 'Overdue', count: categoryCounts.overdue, badgeColor: 'bg-rose-100 text-rose-800' },
  ];

  const displayedList = isExpandedView || showAllInline 
    ? filteredReminders 
    : filteredReminders.slice(0, 5);

  return (
    <div className="glass-card p-5 relative flex flex-col h-full">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 bg-gray-900 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 transition-all animate-in fade-in slide-in-from-top-2">
          <Check size={14} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
            <BellRing size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 leading-tight">Smart Service Reminder Center</h2>
            <p className="text-xs text-gray-500">Next Service = Latest Completed Service + 3 Months</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-full">
            {reminders.length} Total
          </span>
          {onToggleExpand && (
            <button
              onClick={onToggleExpand}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition"
              title={isExpandedView ? "Minimize view" : "Expand Reminder Center"}
              aria-label={isExpandedView ? "Minimize" : "Expand"}
            >
              {isExpandedView ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Reminder Categories Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-3 hide-scrollbar">
        {categoriesConfig.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <span>{cat.label}</span>
              <span className={`text-[11px] px-1.5 py-0.2 rounded-full font-bold ${
                isActive ? 'bg-white/20 text-white' : cat.badgeColor
              }`}>
                {cat.count}
              </span>
            </button>
          );
        })}
        <button
          onClick={() => setActiveCategory('all')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
            activeCategory === 'all'
              ? 'bg-gray-900 text-white border-gray-900 shadow-sm'
              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
          }`}
        >
          All ({reminders.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter by vehicle, customer name, or mobile..."
          className="w-full pl-8 pr-3 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-amber-500 focus:border-amber-500 transition"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Reminders List */}
      <div className="space-y-2.5 flex-1 overflow-y-auto pr-0.5">
        {displayedList.length === 0 ? (
          <div className="text-center py-8 bg-gray-50/40 rounded-xl border border-dashed border-gray-200 p-4">
            <CalendarClock size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium text-gray-600">No service reminders in this category.</p>
            <p className="text-xs text-gray-400 mt-0.5">All vehicles are serviced or checked.</p>
          </div>
        ) : (
          displayedList.map(item => {
            const isSelected = selectedReminderId === item.record.id;
            const isSent = item.reminderStatus === 'Sent';
            const isOverdue = item.daysDiff < 0;
            const isDueToday = item.daysDiff === 0;

            let dueBadgeText = '';
            if (isOverdue) {
              dueBadgeText = `${Math.abs(item.daysDiff)}d overdue`;
            } else if (isDueToday) {
              dueBadgeText = 'Due Today';
            } else {
              dueBadgeText = `In ${item.daysDiff}d`;
            }

            return (
              <div
                key={item.record.id}
                onClick={() => setSelectedReminderId(isSelected ? null : item.record.id)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50/40 shadow-sm'
                    : isSent
                    ? 'border-emerald-100 bg-emerald-50/20 hover:bg-emerald-50/40'
                    : 'border-gray-100 bg-gray-50/30 hover:bg-amber-50/30'
                }`}
              >
                {/* Primary Card Details */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-bold text-gray-900 text-sm">{item.customerName}</span>
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md">
                        {item.vehicleNumber}
                      </span>
                      {item.vehicleModel && (
                        <span className="text-[11px] text-gray-500 truncate">
                          ({item.vehicleModel})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center text-xs text-gray-500 gap-3 flex-wrap">
                      <span className="flex items-center gap-1 font-medium text-gray-700">
                        <Phone size={12} className="text-gray-400" />
                        {item.mobileNumber}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-gray-400" />
                        Last Service: <strong className="text-gray-700">{format(parseIsoDateOnly(item.lastServiceDate), 'dd MMM yyyy')}</strong>
                      </span>
                    </div>
                  </div>

                  {/* Due Date and Due Tag */}
                  <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2">
                    <div>
                      <p className="text-xs font-bold text-gray-900 flex items-center sm:justify-end gap-1">
                        <Clock size={12} className="text-amber-500" />
                        Due: {format(parseIsoDateOnly(item.nextServiceDueDate), 'dd MMM yyyy')}
                      </p>
                      <p className={`text-[11px] font-semibold mt-0.5 ${
                        isOverdue ? 'text-rose-600' : isDueToday ? 'text-amber-600' : 'text-emerald-600'
                      }`}>
                        {dueBadgeText}
                      </p>
                    </div>

                    {/* Reminder Status Badge */}
                    <div className="mt-1">
                      {isSent ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} />
                          Reminder Sent
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600 border border-gray-200">
                          Not Sent
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Last Reminder Sent Date row */}
                <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-gray-500">
                  <span className="truncate">
                    Last Reminder: {item.lastReminderSentDate 
                      ? <strong className="text-gray-700">{format(new Date(item.lastReminderSentDate), 'dd MMM yyyy, hh:mm a')}</strong>
                      : <span className="italic text-gray-400">Not sent yet</span>
                    }
                  </span>

                  {/* Quick Action Button for card */}
                  <div className="flex items-center justify-end gap-2 shrink-0">
                    {isSent ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-emerald-700 font-medium hidden xs:inline">
                          Cycle Complete
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenWhatsApp(item);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:text-emerald-700 hover:border-emerald-300 rounded-lg transition flex items-center gap-1 shadow-2xs hover:bg-emerald-50 active:scale-95"
                          title="Send reminder again intentionally"
                        >
                          <RotateCw size={11} className="text-gray-500" />
                          <span>Send Again</span>
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenWhatsApp(item);
                        }}
                        className="w-full sm:w-auto px-3 py-1.5 text-xs font-bold bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                        title="Send Service Reminder via WhatsApp"
                      >
                        <MessageCircle size={13} />
                        <span>Send Service Reminder</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Card Details if clicked */}
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-amber-200/60 bg-amber-50/60 -mx-3.5 -mb-3.5 p-3.5 rounded-b-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <span className="text-gray-500">Customer:</span>{' '}
                        <span className="font-semibold text-gray-900">{item.customerName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Vehicle:</span>{' '}
                        <span className="font-mono font-semibold text-gray-900">{item.vehicleNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Mobile:</span>{' '}
                        <span className="font-semibold text-gray-900">{item.mobileNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Last Service Date:</span>{' '}
                        <span className="font-semibold text-gray-900">{format(parseIsoDateOnly(item.lastServiceDate), 'dd MMM yyyy')}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Next Due Date:</span>{' '}
                        <span className="font-semibold text-gray-900">{format(parseIsoDateOnly(item.nextServiceDueDate), 'dd MMM yyyy')}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Status:</span>{' '}
                        <span className="font-semibold text-gray-900">{item.reminderStatus}</span>
                        {item.lastReminderSentDate && (
                          <span className="text-[10px] text-gray-500 ml-1">
                            ({format(new Date(item.lastReminderSentDate), 'dd MMM yyyy, hh:mm a')})
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-amber-200/50">
                      <p className="text-[11px] text-gray-500">
                        {isSent 
                          ? 'Reminder already sent for this cycle. Use "Send Again" only if necessary.'
                          : 'Sends exclusive service reminder message without invoices or payment dues.'}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        {isSent ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenWhatsApp(item);
                            }}
                            className="px-3 py-1.5 text-xs font-semibold bg-white border border-gray-300 text-gray-700 hover:text-emerald-700 hover:border-emerald-300 rounded-lg transition flex items-center gap-1.5 shadow-2xs active:scale-95"
                          >
                            <RotateCw size={12} />
                            <span>Send Again</span>
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenWhatsApp(item);
                            }}
                            className="px-3.5 py-1.5 text-xs font-bold bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition flex items-center gap-1.5 shadow-sm active:scale-95"
                          >
                            <MessageCircle size={13} />
                            <span>Send Service Reminder</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Show more / Show less button in inline view */}
      {!isExpandedView && filteredReminders.length > 5 && (
        <button
          onClick={() => setShowAllInline(!showAllInline)}
          className="w-full text-center text-xs text-primary-600 font-semibold pt-3 hover:text-primary-700 transition"
        >
          {showAllInline ? 'Show less' : `View all ${filteredReminders.length} reminders in this category`}
        </button>
      )}

      {/* WhatsApp Send Confirmation Modal */}
      {confirmModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 mx-auto">
              <MessageCircle size={26} />
            </div>

            <h3 className="text-lg font-bold text-gray-900 text-center mb-1">
              Confirm Service Reminder Sent
            </h3>
            <p className="text-xs text-gray-500 text-center mb-5">
              WhatsApp was opened with the service reminder message for:
            </p>

            <div className="bg-gray-50 rounded-xl p-3.5 mb-5 border border-gray-200/80 space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer:</span>
                <span className="font-semibold text-gray-900">{confirmModalItem.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Vehicle Number:</span>
                <span className="font-mono font-bold text-gray-900">{confirmModalItem.vehicleNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mobile Number:</span>
                <span className="font-medium text-gray-900">+91 {confirmModalItem.mobileNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Last Service Date:</span>
                <span className="font-medium text-gray-900">{format(new Date(confirmModalItem.lastServiceDate), 'dd MMM yyyy')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Next Due Date:</span>
                <span className="font-bold text-amber-700">{format(new Date(confirmModalItem.nextServiceDueDate), 'dd MMM yyyy')}</span>
              </div>
            </div>

            <div className="text-xs text-gray-600 mb-6 bg-blue-50 text-blue-800 p-2.5 rounded-lg border border-blue-100">
              <p className="font-medium">
                Did you send the reminder message to the customer?
              </p>
              <p className="text-[11px] text-blue-700/90 mt-0.5">
                Marking as sent records the timestamp and protects against accidental duplicate reminders.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmModalItem(null)}
                disabled={isUpdating}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                No, Keep "Not Sent"
              </button>
              <button
                type="button"
                onClick={handleConfirmSent}
                disabled={isUpdating}
                className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isUpdating ? (
                  <span>Saving status...</span>
                ) : (
                  <>
                    <Check size={14} />
                    <span>Yes, Mark as Sent</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Database Setup Notice Modal */}
      {migrationErrorItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-amber-200 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2.5 text-amber-600">
                <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Database size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">Database Setup Required</h3>
                  <p className="text-xs text-gray-500">Add reminder columns to enable tracking</p>
                </div>
              </div>
              <button
                onClick={() => { setMigrationErrorItem(null); setCopiedSql(false); }}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-3 leading-relaxed">
              The database requires an update to track reminder history. Please execute this one-time SQL setup:
            </p>

            <div className="bg-gray-900 text-emerald-400 font-mono text-xs p-3 rounded-xl mb-4 relative overflow-x-auto select-all">
              <code>
{`ALTER TABLE service_records 
ADD COLUMN IF NOT EXISTS "reminderStatus" TEXT DEFAULT 'Not Sent',
ADD COLUMN IF NOT EXISTS "lastReminderSentDate" TIMESTAMPTZ;`}
              </code>
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => {
                  const sql = `ALTER TABLE service_records \nADD COLUMN IF NOT EXISTS "reminderStatus" TEXT DEFAULT 'Not Sent',\nADD COLUMN IF NOT EXISTS "lastReminderSentDate" TIMESTAMPTZ;`;
                  navigator.clipboard.writeText(sql);
                  setCopiedSql(true);
                  setTimeout(() => setCopiedSql(false), 3000);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition active:scale-95"
              >
                {copiedSql ? (
                  <>
                    <Check size={14} className="text-white" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    <span>Copy Migration SQL</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => { setMigrationErrorItem(null); setCopiedSql(false); }}
                className="py-2.5 px-4 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
