import React, { useState, useMemo } from 'react';
import { VehicleAnalyticsItem } from '../../businessAnalytics';
import { formatCurrency } from '../../utils';
import { 
  Bike, 
  Search, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight, 
  CalendarClock, 
  AlertTriangle,
  CheckCircle,
  Phone
} from 'lucide-react';

interface VehicleAnalyticsTableProps {
  vehicles: {
    totalVehicles: number;
    mostServicedVehiclesCount: number;
    vehiclesServicedThisMonth: number;
    vehiclesDueForService: number;
    recentlyServicedVehiclesList: VehicleAnalyticsItem[];
  };
}

type SortField = 'totalVisits' | 'totalSpent' | 'vehicleNumber' | 'lastServiceDate';
type SortOrder = 'asc' | 'desc';

export const VehicleAnalyticsTable: React.FC<VehicleAnalyticsTableProps> = ({ vehicles }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('totalVisits');
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
    let list = vehicles.recentlyServicedVehiclesList;

    if (q) {
      list = list.filter(v => 
        v.vehicleNumber.toLowerCase().includes(q) || 
        v.vehicleModel.toLowerCase().includes(q) ||
        v.customerName.toLowerCase().includes(q) ||
        v.mobileNumber.includes(q)
      );
    }

    list = [...list].sort((a, b) => {
      let comparison = 0;
      if (sortField === 'totalVisits') {
        comparison = a.totalVisits - b.totalVisits;
      } else if (sortField === 'totalSpent') {
        comparison = a.totalSpent - b.totalSpent;
      } else if (sortField === 'vehicleNumber') {
        comparison = a.vehicleNumber.localeCompare(b.vehicleNumber);
      } else if (sortField === 'lastServiceDate') {
        comparison = (a.lastServiceDate || '').localeCompare(b.lastServiceDate || '');
      }

      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return list;
  }, [vehicles.recentlyServicedVehiclesList, searchQuery, sortField, sortOrder]);

  const totalPages = Math.ceil(filteredAndSortedList.length / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const paginatedList = filteredAndSortedList.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="glass-card p-3.5 sm:p-5 space-y-4">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
            <Bike size={16} />
          </div>
          <h3 className="text-sm sm:text-base md:text-lg font-bold text-gray-900">
            Vehicle Fleet Analytics
          </h3>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Vehicle service frequency, maintenance spending, and upcoming inspection due dates
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
        <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-gray-500 mb-0.5">Total Fleet</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-gray-900">
            {vehicles.totalVehicles} Vehicles
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-orange-50/60 border border-orange-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-orange-800 mb-0.5">Top Vehicle Visits</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-orange-900">
            {vehicles.mostServicedVehiclesCount} Services
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-teal-50/60 border border-teal-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-teal-800 mb-0.5">Serviced This Month</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-teal-900">
            {vehicles.vehiclesServicedThisMonth}
          </p>
        </div>

        <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100">
          <p className="text-[10px] sm:text-[11px] font-medium text-rose-800 mb-0.5">Due / Overdue</p>
          <p className="text-xs sm:text-sm md:text-base font-bold text-rose-900">
            {vehicles.vehiclesDueForService} Vehicles
          </p>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-0.5">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search vehicle number, model, customer..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs sm:text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
          />
        </div>

        <span className="text-[11px] text-gray-500 self-center">
          Showing {filteredAndSortedList.length} vehicle records
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200 select-none">
            <tr>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('vehicleNumber')}>
                <div className="flex items-center gap-1">
                  <span>Vehicle Number</span>
                  <ArrowUpDown size={11} className={sortField === 'vehicleNumber' ? 'text-primary-600' : 'text-gray-400'} />
                </div>
              </th>
              <th className="py-2.5 px-3">Model</th>
              <th className="py-2.5 px-3">Owner / Contact</th>
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
              <th className="py-2.5 px-3">Next Due</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedList.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-6 text-center text-gray-500">
                  No vehicles found matching your search.
                </td>
              </tr>
            ) : (
              paginatedList.map((vehicle) => (
                <tr key={vehicle.vehicleNumber} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-2 px-3 font-bold text-gray-900 whitespace-nowrap">
                    <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 text-xs">
                      {vehicle.vehicleNumber}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-gray-700 font-medium whitespace-nowrap text-xs">
                    {vehicle.vehicleModel}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    <div>
                      <p className="font-bold text-gray-900 truncate max-w-[150px] text-xs sm:text-sm">{vehicle.customerName || 'Valued Owner'}</p>
                      {vehicle.mobileNumber && (
                        <p className="text-[10px] sm:text-[11px] text-gray-500 flex items-center gap-1">
                          <Phone size={9} />
                          {vehicle.mobileNumber}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-50 text-orange-700">
                      {vehicle.totalVisits} visit{vehicle.totalVisits === 1 ? '' : 's'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right font-bold text-primary-700 whitespace-nowrap">
                    {formatCurrency(vehicle.totalSpent)}
                  </td>
                  <td className="py-2 px-3 text-gray-600 whitespace-nowrap text-xs">
                    {vehicle.lastServiceDate || '—'}
                  </td>
                  <td className="py-2 px-3 whitespace-nowrap">
                    {vehicle.nextServiceDueDate ? (
                      <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] font-medium ${
                        vehicle.isOverdue 
                          ? 'bg-rose-50 text-rose-700 font-bold' 
                          : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {vehicle.isOverdue ? <AlertTriangle size={10} /> : <CheckCircle size={10} />}
                        {vehicle.nextServiceDueDate}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
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
