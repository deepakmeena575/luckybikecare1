import React from 'react';
import { FullBusinessAnalytics } from '../../businessAnalytics';
import { formatCurrency } from '../../utils';
import { 
  IndianRupee, 
  TrendingUp, 
  History, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Receipt, 
  Users, 
  Bike, 
  UserCheck,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface AnalyticsKpiCardsProps {
  kpis: FullBusinessAnalytics['kpis'];
}

export const AnalyticsKpiCards: React.FC<AnalyticsKpiCardsProps> = ({ kpis }) => {
  return (
    <div className="space-y-2 sm:space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
          Executive KPI Summary
        </h3>
        <span className="text-[11px] sm:text-xs text-gray-500 font-medium">12 Live Metrics</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3">
        {/* 1. Today's Revenue */}
        <div className="glass-card p-2.5 sm:p-3.5 flex flex-col justify-between transition-all hover:shadow-sm aspect-square sm:aspect-[1.1/1] lg:aspect-[1.2/1] min-h-[140px] sm:min-h-[160px] lg:min-h-[175px]">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center shrink-0">
              <IndianRupee size={16} />
            </div>
          </div>
          <div className="my-auto py-0.5 sm:py-1">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 leading-tight line-clamp-2">
              Today's Revenue
            </p>
            <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 truncate">
              {formatCurrency(kpis.todaysRevenue)}
            </h4>
          </div>
          <div className="pt-1 sm:pt-1.5 border-t border-gray-100/80">
            <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 truncate">
              {kpis.todaysServicesCount === 0 
                ? 'No services today' 
                : `${kpis.todaysServicesCount} service${kpis.todaysServicesCount === 1 ? '' : 's'} today`}
            </p>
          </div>
        </div>

        {/* 2. This Month's Revenue */}
        <div className="glass-card p-2.5 sm:p-3.5 flex flex-col justify-between transition-all hover:shadow-sm aspect-square sm:aspect-[1.1/1] lg:aspect-[1.2/1] min-h-[140px] sm:min-h-[160px] lg:min-h-[175px]">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <TrendingUp size={16} />
            </div>
            {kpis.monthOverMonthGrowth !== null && (
              <span className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded ${
                kpis.monthOverMonthGrowth >= 0 
                  ? 'bg-emerald-50 text-emerald-700' 
                  : 'bg-rose-50 text-rose-700'
              }`}>
                {kpis.monthOverMonthGrowth >= 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
                {Math.abs(kpis.monthOverMonthGrowth)}%
              </span>
            )}
          </div>
          <div className="my-auto py-0.5 sm:py-1">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 leading-tight line-clamp-2">
              This Month's Revenue
            </p>
            <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 truncate">
              {formatCurrency(kpis.thisMonthRevenue)}
            </h4>
          </div>
          <div className="pt-1 sm:pt-1.5 border-t border-gray-100/80">
            <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 truncate">
              {kpis.thisMonthLabel} • {kpis.thisMonthServicesCount} services
            </p>
          </div>
        </div>

        {/* 3. Previous Month's Revenue */}
        <div className="glass-card p-2.5 sm:p-3.5 flex flex-col justify-between transition-all hover:shadow-sm aspect-square sm:aspect-[1.1/1] lg:aspect-[1.2/1] min-h-[140px] sm:min-h-[160px] lg:min-h-[175px]">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <History size={16} />
            </div>
          </div>
          <div className="my-auto py-0.5 sm:py-1">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 leading-tight line-clamp-2">
              Previous Month's Revenue
            </p>
            <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 truncate">
              {formatCurrency(kpis.previousMonthRevenue)}
            </h4>
          </div>
          <div className="pt-1 sm:pt-1.5 border-t border-gray-100/80">
            <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 truncate">
              {kpis.previousMonthLabel} • {kpis.previousMonthServicesCount} services
            </p>
          </div>
        </div>

        {/* 4. Total Revenue */}
        <div className="glass-card p-2.5 sm:p-3.5 flex flex-col justify-between transition-all hover:shadow-sm aspect-square sm:aspect-[1.1/1] lg:aspect-[1.2/1] min-h-[140px] sm:min-h-[160px] lg:min-h-[175px]">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Receipt size={16} />
            </div>
          </div>
          <div className="my-auto py-0.5 sm:py-1">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 leading-tight line-clamp-2">
              Total Revenue
            </p>
            <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 truncate">
              {formatCurrency(kpis.totalRevenue)}
            </h4>
          </div>
          <div className="pt-1 sm:pt-1.5 border-t border-gray-100/80">
            <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 truncate">
              Lifetime: {formatCurrency(kpis.lifetimeRevenue)}
            </p>
          </div>
        </div>

        {/* 5. Total Services */}
        <div className="glass-card p-2.5 sm:p-3.5 flex flex-col justify-between transition-all hover:shadow-sm aspect-square sm:aspect-[1.1/1] lg:aspect-[1.2/1] min-h-[140px] sm:min-h-[160px] lg:min-h-[175px]">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
          </div>
          <div className="my-auto py-0.5 sm:py-1">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 leading-tight line-clamp-2">
              Total Services
            </p>
            <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 truncate">
              {kpis.totalServices}
            </h4>
          </div>
          <div className="pt-1 sm:pt-1.5 border-t border-gray-100/80">
            <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 truncate">
              All-time: {kpis.lifetimeServices} services
            </p>
          </div>
        </div>

        {/* 6. Completed Services */}
        <div className="glass-card p-2.5 sm:p-3.5 flex flex-col justify-between transition-all hover:shadow-sm aspect-square sm:aspect-[1.1/1] lg:aspect-[1.2/1] min-h-[140px] sm:min-h-[160px] lg:min-h-[175px]">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="my-auto py-0.5 sm:py-1">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 leading-tight line-clamp-2">
              Completed Services
            </p>
            <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 truncate">
              {kpis.completedServices}
            </h4>
          </div>
          <div className="pt-1 sm:pt-1.5 border-t border-gray-100/80">
            <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 truncate">
              {kpis.completionRate}% fully settled
            </p>
          </div>
        </div>

        {/* 7. Pending Services */}
        <div className="glass-card p-2.5 sm:p-3.5 flex flex-col justify-between transition-all hover:shadow-sm aspect-square sm:aspect-[1.1/1] lg:aspect-[1.2/1] min-h-[140px] sm:min-h-[160px] lg:min-h-[175px]">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock size={16} />
            </div>
          </div>
          <div className="my-auto py-0.5 sm:py-1">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 leading-tight line-clamp-2">
              Pending Services
            </p>
            <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 truncate">
              {kpis.pendingServices}
            </h4>
          </div>
          <div className="pt-1 sm:pt-1.5 border-t border-gray-100/80">
            <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 truncate">
              {kpis.pendingServices === 0 ? 'Zero pending dues' : 'Invoices with unpaid balance'}
            </p>
          </div>
        </div>

        {/* 8. Pending Payments */}
        <div className={`glass-card p-2.5 sm:p-3.5 flex flex-col justify-between transition-all hover:shadow-sm aspect-square sm:aspect-[1.1/1] lg:aspect-[1.2/1] min-h-[140px] sm:min-h-[160px] lg:min-h-[175px] ${
          kpis.pendingPayments > 0 ? 'border-l-4 border-l-rose-500' : ''
        }`}>
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="my-auto py-0.5 sm:py-1">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 leading-tight line-clamp-2">
              Pending Payments
            </p>
            <h4 className={`text-sm sm:text-base md:text-lg lg:text-xl font-bold tracking-tight mt-0.5 sm:mt-1 truncate ${
              kpis.pendingPayments > 0 ? 'text-rose-600' : 'text-gray-900'
            }`}>
              {formatCurrency(kpis.pendingPayments)}
            </h4>
          </div>
          <div className="pt-1 sm:pt-1.5 border-t border-gray-100/80">
            <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 truncate">
              {kpis.pendingServices === 0 ? 'All settled' : `${kpis.pendingServices} invoice(s) due`}
            </p>
          </div>
        </div>

        {/* 9. Average Invoice Value */}
        <div className="glass-card p-2.5 sm:p-3.5 flex flex-col justify-between transition-all hover:shadow-sm aspect-square sm:aspect-[1.1/1] lg:aspect-[1.2/1] min-h-[140px] sm:min-h-[160px] lg:min-h-[175px]">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Receipt size={16} />
            </div>
          </div>
          <div className="my-auto py-0.5 sm:py-1">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 leading-tight line-clamp-2">
              Average Invoice Value
            </p>
            <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 truncate">
              {formatCurrency(kpis.avgInvoiceValue)}
            </h4>
          </div>
          <div className="pt-1 sm:pt-1.5 border-t border-gray-100/80">
            <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 truncate">
              Per service ticket
            </p>
          </div>
        </div>

        {/* 10. Total Customers */}
        <div className="glass-card p-2.5 sm:p-3.5 flex flex-col justify-between transition-all hover:shadow-sm aspect-square sm:aspect-[1.1/1] lg:aspect-[1.2/1] min-h-[140px] sm:min-h-[160px] lg:min-h-[175px]">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Users size={16} />
            </div>
          </div>
          <div className="my-auto py-0.5 sm:py-1">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 leading-tight line-clamp-2">
              Total Customers
            </p>
            <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 truncate">
              {kpis.totalCustomers}
            </h4>
          </div>
          <div className="pt-1 sm:pt-1.5 border-t border-gray-100/80">
            <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 truncate">
              Unique workshop clients
            </p>
          </div>
        </div>

        {/* 11. Total Vehicles */}
        <div className="glass-card p-2.5 sm:p-3.5 flex flex-col justify-between transition-all hover:shadow-sm aspect-square sm:aspect-[1.1/1] lg:aspect-[1.2/1] min-h-[140px] sm:min-h-[160px] lg:min-h-[175px]">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0">
              <Bike size={16} />
            </div>
          </div>
          <div className="my-auto py-0.5 sm:py-1">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 leading-tight line-clamp-2">
              Total Vehicles
            </p>
            <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 truncate">
              {kpis.totalVehicles}
            </h4>
          </div>
          <div className="pt-1 sm:pt-1.5 border-t border-gray-100/80">
            <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 truncate">
              Bikes & scooters serviced
            </p>
          </div>
        </div>

        {/* 12. Repeat Customers */}
        <div className="glass-card p-2.5 sm:p-3.5 flex flex-col justify-between transition-all hover:shadow-sm aspect-square sm:aspect-[1.1/1] lg:aspect-[1.2/1] min-h-[140px] sm:min-h-[160px] lg:min-h-[175px]">
          <div className="flex items-center justify-between">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <UserCheck size={16} />
            </div>
          </div>
          <div className="my-auto py-0.5 sm:py-1">
            <p className="text-[11px] sm:text-xs font-semibold text-gray-500 leading-tight line-clamp-2">
              Repeat Customers
            </p>
            <h4 className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 tracking-tight mt-0.5 sm:mt-1 truncate">
              {kpis.repeatCustomers}
            </h4>
          </div>
          <div className="pt-1 sm:pt-1.5 border-t border-gray-100/80">
            <p className="text-[9.5px] sm:text-[10.5px] text-gray-400 truncate">
              {kpis.repeatCustomerRate}% retention rate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
