import React, { useState, useMemo } from 'react';
import { CustomerAnalyticsItem } from '../../businessAnalytics';
import { formatCurrency } from '../../utils';
import { 
  Users, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  Award, 
  UserCheck, 
  UserPlus,
  Phone,
  Bike
} from 'lucide-react';

interface CustomerAnalyticsTableProps {
  customers: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    repeatCustomerRate: number;
    avgRevenuePerCustomer: number;
    topCustomersList: CustomerAnalyticsItem[];
  };
}

type SortField = 'totalSpent' | 'totalVisits' | 'customerName' | 'lastServiceDate';
type SortOrder = 'asc' | 'desc';

export const CustomerAnalyticsTable: React.FC<CustomerAnalyticsTableProps> = ({ customers }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalSpent');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const filteredAndSortedList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = customers.topCustomersList;

    if (q) {
      list = list.filter(c => 
        c.customerName.toLowerCase().includes(q) || 
        c.mobileNumber.includes(q) ||
        c.vehicles.some(v => v.toLowerCase().includes(q))
      );
    }

    list = [...list].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'totalSpent') {
        comparison = a.totalSpent - b.totalSpent;
      } else if (sortField === 'totalVisits') {
        comparison = a.totalVisits - b.totalVisits;
      } else if (sortField === 'customerName') {
        comparison = a.customerName.localeCompare(b.customerName);
      } else if (sortField === 'lastServiceDate') {
        comparison = (a.lastServiceDate || '').localeCompare(b.lastServiceDate || '');
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return list;
  }, [customers.topCustomersList, searchQuery, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedList.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedList = filteredAndSortedList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="glass-card p-3.5 sm:p-5 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
            <Users size={16} />
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
            Customer Analytics & Directory
          </h3>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Client lifetime value, retention rates, visit counts, and registered fleet vehicles
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 sm:gap-2.5">
        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">Total Customers</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
            {customers.totalCustomers}
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-emerald-800 mb-0.5">Repeat Rate</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-emerald-900">
            {customers.repeatCustomerRate}%
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-indigo-50/60 border border-indigo-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-indigo-800 mb-0.5">Returning Clients</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-indigo-900">
            {customers.returningCustomers}
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-blue-800 mb-0.5">First-Time Clients</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-blue-900">
            {customers.newCustomers}
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-amber-50/60 border border-amber-100 col-span-2 sm:col-span-1">
          <p className="text-[10px] sm:text-[11px] font-medium text-amber-800 mb-0.5">Avg Rev / Client</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-amber-900 truncate">
            {formatCurrency(customers.avgRevenuePerCustomer)}
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-0.5">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customer, mobile, or vehicle..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
          />
        </div>

        <span className="text-[11px] text-gray-500 self-center">
          Showing {filteredAndSortedList.length} customer records
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 select-none">
            <tr>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('customerName')}>
                <div className="flex items-center gap-1">
                  <span>Customer Name</span>
                  <ArrowUpDown size={11} className={sortField === 'customerName' ? 'text-primary-600' : 'text-gray-400'} />
                </div>
              </th>
              <th className="py-2.5 px-3">Mobile Number</th>
              <th className="py-2.5 px-3 text-center cursor-pointer" onClick={() => handleSort('totalVisits')}>
                <div className="flex items-center justify-center gap-1">
                  <span>Visits</span>
                  <ArrowUpDown size={11} className={sortField === 'totalVisits' ? 'text-primary-600' : 'text-gray-400'} />
                </div>
              </th>
              <th className="py-2.5 px-3 text-right cursor-pointer" onClick={() => handleSort('totalSpent')}>
                <div className="flex items-center justify-end gap-1">
                  <span>Total Spent</span>
                  <ArrowUpDown size={11} className={sortField === 'totalSpent' ? 'text-primary-600' : 'text-gray-400'} />
                </div>
              </th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('lastServiceDate')}>
                <div className="flex items-center gap-1">
                  <span>Last Service</span>
                  <ArrowUpDown size={11} className={sortField === 'lastServiceDate' ? 'text-primary-600' : 'text-gray-400'} />
                </div>
              </th>
              <th className="py-2.5 px-3 text-center">Vehicles</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-500">
                  No customers found matching your search.
                </td>
              </tr>
            ) : (
              paginatedList.map((customer, idx) => (
                <tr key={`${customer.customerName}-${customer.mobileNumber}-${idx}`} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-2 px-3 font-bold text-gray-900 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-primary-100 text-primary-800 text-[10px] font-extrabold flex items-center justify-center shrink-0">
                        {customer.customerName.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <span className="truncate max-w-[180px]">{customer.customerName}</span>
                    </div>
                  </td>
                  <td className="py-2 px-3 text-gray-600 whitespace-nowrap">
                    <span className="flex items-center gap-1">
                      <Phone size={10} className="text-gray-400" />
                      {customer.mobileNumber || '—'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                      customer.totalVisits >= 3 
                        ? 'bg-emerald-50 text-emerald-700' 
                        : customer.totalVisits === 2 
                        ? 'bg-blue-50 text-blue-700' 
                        : 'bg-gray-100 text-gray-700'
                    }`}>
                      {customer.totalVisits} visit{customer.totalVisits === 1 ? '' : 's'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-primary-700 whitespace-nowrap">
                    {formatCurrency(customer.totalSpent)}
                  </td>
                  <td className="py-2 px-3 text-gray-600 whitespace-nowrap text-xs">
                    {customer.lastServiceDate || '—'}
                  </td>
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-semibold bg-gray-100 text-gray-800" title={customer.vehicles.join(', ')}>
                      <Bike size={11} className="text-gray-500" />
                      {customer.vehicleCount}
                    </span>
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
