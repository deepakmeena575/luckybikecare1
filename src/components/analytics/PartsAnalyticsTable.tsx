import React, { useState, useMemo } from 'react';
import { PartUsageItem } from '../../businessAnalytics';
import { formatCurrency } from '../../utils';
import { 
  Package, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Wrench,
  Coins
} from 'lucide-react';

interface PartsAnalyticsTableProps {
  parts: {
    totalPartsUsed: number;
    totalPartsValue: number;
    topPartsList: PartUsageItem[];
  };
}

export const PartsAnalyticsTable: React.FC<PartsAnalyticsTableProps> = ({ parts }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return parts.topPartsList;
    return parts.topPartsList.filter(p => p.partName.toLowerCase().includes(q));
  }, [parts.topPartsList, searchQuery]);

  const totalPages = Math.ceil(filteredList.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedList = filteredList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const mostUsedPartName = parts.topPartsList.length > 0 ? parts.topPartsList[0].partName : 'None';
  const mostUsedPartCount = parts.topPartsList.length > 0 ? parts.topPartsList[0].quantityUsed : 0;

  return (
    <div className="glass-card p-3.5 sm:p-5 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0">
            <Package size={16} />
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
            Parts & Inventory Analytics
          </h3>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Spares replacement volume, parts revenue contribution, and high-turnover workshop items
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-2.5">
        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">Total Parts Installed</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
            {parts.totalPartsUsed} Units
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-sky-50/60 border border-sky-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-sky-800 mb-0.5">Total Parts Value</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-sky-900 truncate">
            {formatCurrency(parts.totalPartsValue)}
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-indigo-800 mb-0.5">Top Used Part</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-indigo-900 truncate" title={mostUsedPartName}>
            {mostUsedPartName} ({mostUsedPartCount})
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-0.5">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search spare parts or consumables..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
          />
        </div>

        <span className="text-[11px] text-gray-500 self-center">
          {filteredList.length} unique parts recorded
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
            <tr>
              <th className="py-2.5 px-3">Part Name</th>
              <th className="py-2.5 px-3 text-center">Quantity Used</th>
              <th className="py-2.5 px-3 text-right">Total Value</th>
              <th className="py-2.5 px-3 text-center">Services Involved</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-500">
                  No parts found matching your search.
                </td>
              </tr>
            ) : (
              paginatedList.map((part, idx) => (
                <tr key={`${part.partName}-${idx}`} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-2 px-3 font-bold text-gray-900">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-md bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                        <Wrench size={11} />
                      </div>
                      <span className="truncate max-w-[280px] text-xs sm:text-sm">{part.partName}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-sky-700">
                      {part.quantityUsed}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-primary-700 whitespace-nowrap">
                    {formatCurrency(part.totalValue)}
                  </td>
                  <td className="py-2 px-3 text-center text-gray-600 whitespace-nowrap text-xs">
                    {part.servicesCount} services
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-0.5">
          <p className="text-xs text-gray-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="p-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} />
            </button>
            <span className="text-xs font-bold px-2 py-0.5 bg-primary-50 text-primary-700 rounded">
              {currentPage}
            </span>
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              className="p-1 rounded-md border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
