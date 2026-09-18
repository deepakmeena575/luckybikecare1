import React from 'react';
import { TopHighlights } from '../../businessAnalytics';
import { formatCurrency } from '../../utils';
import { 
  Bike, 
  Award, 
  Package, 
  Wrench, 
  ReceiptText, 
  Trophy 
} from 'lucide-react';

interface TopHighlightsCardsProps {
  highlights: TopHighlights;
}

export const TopHighlightsCards: React.FC<TopHighlightsCardsProps> = ({ highlights }) => {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <h3 className="text-xs sm:text-sm font-bold text-gray-900 uppercase tracking-wider">
          Top Performing Highlights
        </h3>
        <span className="text-[11px] sm:text-xs text-gray-500 font-medium">Workshop Records</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5 lg:gap-3">
        {/* 1. Most Serviced Vehicle */}
        <div className="glass-card p-2.5 sm:p-3 border-l-4 border-l-orange-500 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-orange-700 uppercase tracking-wider block mb-0.5">
                Most Serviced Vehicle
              </span>
              <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                {highlights.mostServicedVehicle ? highlights.mostServicedVehicle.vehicleNumber : 'None'}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                {highlights.mostServicedVehicle?.vehicleModel || 'Motorcycle'}
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10.5px] sm:text-[11.5px] text-gray-500">
                <span>{highlights.mostServicedVehicle?.servicesCount || 0} visits</span>
                <span className="font-bold text-gray-900">
                  {formatCurrency(highlights.mostServicedVehicle?.totalSpent || 0)}
                </span>
              </div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-orange-50 text-orange-600 shrink-0">
              <Bike size={16} />
            </div>
          </div>
        </div>

        {/* 2. Most Valuable Customer */}
        <div className="glass-card p-2.5 sm:p-3 border-l-4 border-l-indigo-500 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-indigo-700 uppercase tracking-wider block mb-0.5">
                Most Valuable Customer
              </span>
              <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                {highlights.mostValuableCustomer ? highlights.mostValuableCustomer.customerName : 'None'}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                {highlights.mostValuableCustomer?.mobileNumber || 'Valued Client'}
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10.5px] sm:text-[11.5px] text-gray-500">
                <span>{highlights.mostValuableCustomer?.visitsCount || 0} visits</span>
                <span className="font-bold text-indigo-700">
                  {formatCurrency(highlights.mostValuableCustomer?.totalSpent || 0)}
                </span>
              </div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <Award size={16} />
            </div>
          </div>
        </div>

        {/* 3. Most Used Part */}
        <div className="glass-card p-2.5 sm:p-3 border-l-4 border-l-sky-500 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-sky-700 uppercase tracking-wider block mb-0.5">
                Most Used Part / Item
              </span>
              <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                {highlights.mostUsedPart ? highlights.mostUsedPart.partName : 'None'}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                Top replacement item
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10.5px] sm:text-[11.5px] text-gray-500">
                <span>{highlights.mostUsedPart?.usageCount || 0} times installed</span>
                <span className="font-bold text-sky-700">
                  {formatCurrency(highlights.mostUsedPart?.totalCost || 0)}
                </span>
              </div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-sky-50 text-sky-600 shrink-0">
              <Package size={16} />
            </div>
          </div>
        </div>

        {/* 4. Most Common Service */}
        <div className="glass-card p-2.5 sm:p-3 border-l-4 border-l-teal-500 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-teal-700 uppercase tracking-wider block mb-0.5">
                Most Common Job / Service
              </span>
              <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                {highlights.mostCommonService ? highlights.mostCommonService.name : 'Routine Checkup'}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                Frequent maintenance job
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10.5px] sm:text-[11.5px] text-gray-500">
                <span>Frequency</span>
                <span className="font-bold text-teal-700">
                  {highlights.mostCommonService?.count || 0} recorded
                </span>
              </div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-teal-50 text-teal-600 shrink-0">
              <Wrench size={16} />
            </div>
          </div>
        </div>

        {/* 5. Highest Single Invoice */}
        <div className="glass-card p-2.5 sm:p-3 border-l-4 border-l-purple-500 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-purple-700 uppercase tracking-wider block mb-0.5">
                Highest Single Invoice
              </span>
              <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                {highlights.highestInvoice ? formatCurrency(highlights.highestInvoice.amount) : '₹0'}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                {highlights.highestInvoice ? `${highlights.highestInvoice.customerName} (${highlights.highestInvoice.vehicleNumber})` : 'None'}
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10.5px] sm:text-[11.5px] text-gray-500">
                <span>Invoice #{highlights.highestInvoice?.id || '—'}</span>
                <span className="font-semibold text-gray-700">
                  {highlights.highestInvoice?.date || ''}
                </span>
              </div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-purple-50 text-purple-600 shrink-0">
              <ReceiptText size={16} />
            </div>
          </div>
        </div>

        {/* 6. Best Revenue Month */}
        <div className="glass-card p-2.5 sm:p-3 border-l-4 border-l-amber-500 transition-all hover:shadow-sm">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-amber-700 uppercase tracking-wider block mb-0.5">
                Best Revenue Month
              </span>
              <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                {highlights.bestRevenueMonth ? highlights.bestRevenueMonth.monthName : 'None'}
              </h4>
              <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5 truncate">
                Highest historical earnings
              </p>
              <div className="mt-1.5 pt-1.5 border-t border-gray-100 flex items-center justify-between text-[10.5px] sm:text-[11.5px] text-gray-500">
                <span>{highlights.bestRevenueMonth?.servicesCount || 0} services</span>
                <span className="font-bold text-amber-700">
                  {formatCurrency(highlights.bestRevenueMonth?.revenue || 0)}
                </span>
              </div>
            </div>
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-50 text-amber-600 shrink-0">
              <Trophy size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
