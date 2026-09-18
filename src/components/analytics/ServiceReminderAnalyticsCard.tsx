import React from 'react';
import { FullBusinessAnalytics } from '../../businessAnalytics';
import { 
  BellRing, 
  CalendarClock, 
  AlertTriangle, 
  Clock, 
  CheckCheck, 
  Send,
  CalendarDays
} from 'lucide-react';

interface ServiceReminderAnalyticsCardProps {
  reminders: FullBusinessAnalytics['serviceReminders'];
}

export const ServiceReminderAnalyticsCard: React.FC<ServiceReminderAnalyticsCardProps> = ({ reminders }) => {
  const totalTracked = reminders.dueThisMonth + reminders.overdue + reminders.upcoming;
  const dispatchRate = (reminders.remindersSent + reminders.remindersPending) > 0
    ? Math.round((reminders.remindersSent / (reminders.remindersSent + reminders.remindersPending)) * 100)
    : 0;

  return (
    <div className="glass-card p-3.5 sm:p-5 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <BellRing size={16} />
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
            Service Reminder Analytics
          </h3>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Proactive customer retention schedule, upcoming service milestones, and reminder dispatch coverage
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
        {/* Due This Month */}
        <div className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200/80">
          <div className="flex items-center justify-between text-amber-800 mb-0.5">
            <span className="text-[10px] sm:text-[11px] font-medium">Due This Month</span>
            <CalendarDays size={13} />
          </div>
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-amber-900">
            {reminders.dueThisMonth}
          </h4>
          <p className="text-[10px] text-amber-700 mt-0.5">Current cycle</p>
        </div>

        {/* Due This Week */}
        <div className="p-2.5 rounded-lg bg-orange-50/70 border border-orange-200/80">
          <div className="flex items-center justify-between text-orange-800 mb-0.5">
            <span className="text-[10px] sm:text-[11px] font-medium">Due This Week</span>
            <Clock size={13} />
          </div>
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-orange-900">
            {reminders.dueThisWeek}
          </h4>
          <p className="text-[10px] text-orange-700 mt-0.5">Next 7 days</p>
        </div>

        {/* Overdue */}
        <div className="p-2.5 rounded-lg bg-rose-50/70 border border-rose-200/80">
          <div className="flex items-center justify-between text-rose-800 mb-0.5">
            <span className="text-[10px] sm:text-[11px] font-medium">Overdue</span>
            <AlertTriangle size={13} />
          </div>
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-rose-900">
            {reminders.overdue}
          </h4>
          <p className="text-[10px] text-rose-700 mt-0.5">Past due date</p>
        </div>

        {/* Upcoming */}
        <div className="p-2.5 rounded-lg bg-blue-50/70 border border-blue-200/80">
          <div className="flex items-center justify-between text-blue-800 mb-0.5">
            <span className="text-[10px] sm:text-[11px] font-medium">Scheduled</span>
            <CalendarClock size={13} />
          </div>
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-blue-900">
            {reminders.upcoming}
          </h4>
          <p className="text-[10px] text-blue-700 mt-0.5">Future dates</p>
        </div>

        {/* Reminders Sent */}
        <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200/80">
          <div className="flex items-center justify-between text-emerald-800 mb-0.5">
            <span className="text-[10px] sm:text-[11px] font-medium">Dispatched</span>
            <CheckCheck size={13} />
          </div>
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-emerald-900">
            {reminders.remindersSent}
          </h4>
          <p className="text-[10px] text-emerald-700 mt-0.5">{dispatchRate}% sent</p>
        </div>

        {/* Reminders Pending */}
        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between text-gray-600 mb-0.5">
            <span className="text-[10px] sm:text-[11px] font-medium">Pending</span>
            <Send size={13} />
          </div>
          <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
            {reminders.remindersPending}
          </h4>
          <p className="text-[10px] text-gray-500 mt-0.5">Follow-ups</p>
        </div>
      </div>
    </div>
  );
};
