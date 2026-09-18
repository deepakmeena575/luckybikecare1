import React, { useState, useEffect, useCallback } from 'react';
import { DB } from '../db';
import { ServiceReminderItem, ReminderCategory } from '../types';
import { SmartReminderCenter } from '../components/SmartReminderCenter';
import { BellRing, RefreshCw, Loader2, CalendarClock, ShieldCheck } from 'lucide-react';

export const RemindersScreen: React.FC = () => {
  const [reminders, setReminders] = useState<ServiceReminderItem[]>([]);
  const [counts, setCounts] = useState<Record<ReminderCategory, number>>({
    this_month: 0,
    this_week: 0,
    next_7_days: 0,
    overdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReminders = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const data = await DB.getServiceReminders();
      setReminders(data.reminders);
      setCounts(data.counts);
    } catch (err) {
      console.error('Failed to load service reminders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shadow-xs">
              <BellRing size={22} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">Service Reminders</h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                Automated 3-month periodic service tracking & WhatsApp reminder dispatch
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => fetchReminders(true)}
            disabled={loading || refreshing}
            className="btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5 shadow-2xs active:scale-95"
            title="Refresh reminder records from database"
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin text-primary-600" : "text-gray-500"} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-amber-50/80 via-white to-amber-50/40 border border-amber-200/70 rounded-2xl p-4 mb-6 shadow-xs flex items-start gap-3 text-xs text-amber-900">
        <CalendarClock size={20} className="text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-amber-950">
            Smart Service Cycle Rule: Latest Completed Service Date + 3 Months
          </p>
          <p className="text-amber-800/90 mt-0.5">
            Only the latest completed service per vehicle is evaluated. Sending WhatsApp updates records to <span className="font-semibold">Sent</span> and records the timestamp to avoid accidental duplicate reminders.
          </p>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 glass-card">
          <Loader2 className="animate-spin text-primary-500 mb-3" size={32} />
          <p className="text-sm font-medium text-gray-500">Calculating upcoming service dates...</p>
        </div>
      ) : (
        <div className="w-full">
          <SmartReminderCenter
            reminders={reminders}
            counts={counts}
            onReminderUpdated={() => fetchReminders(true)}
            isExpandedView={true}
          />
        </div>
      )}
    </div>
  );
};
