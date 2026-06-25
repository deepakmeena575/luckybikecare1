import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Calculator, IndianRupee, Printer, Edit2, Trash2, History, RefreshCcw, MessageCircle, Filter, ChevronLeft, Loader2, Eye } from 'lucide-react';
import { DB } from '../db';
import { ServiceRecord } from '../types';
import { formatCurrency, parseServiceDescription } from '../utils';
import { format } from 'date-fns';

interface SearchScreenProps {
  onViewRecord?: (record: ServiceRecord) => void;
  onEditRecord?: (record: ServiceRecord) => void;
  onDeleteRecord?: (record: ServiceRecord) => void;
  onViewHistory?: (vehicleNumber: string) => void;
  onReentry?: (record: ServiceRecord) => void;
  onWhatsApp?: (record: ServiceRecord) => void;
}

type FilterType = 'all' | 'today' | 'last7' | 'last30' | 'thisMonth';

export const SearchScreen: React.FC<SearchScreenProps> = ({ onViewRecord, onEditRecord, onDeleteRecord, onViewHistory, onReentry, onWhatsApp }) => {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');
  const [page, setPage] = useState(1);
  const [results, setResults] = useState<ServiceRecord[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    let mounted = true;
    const fetchRecords = async () => {
      setIsLoading(true);
      try {
        const { data, count } = await DB.getPaginatedRecords(query, filter, page, limit);
        if (mounted) {
          setResults(data);
          setTotalCount(count);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchRecords();
    }, 300);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [query, filter, page]);

  const totalPages = Math.ceil(totalCount / limit) || 1;

  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setPage(1);
  };

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setPage(1);
  };

  return (
    <div className="flex-1 p-4 md:p-6 overflow-y-auto pb-24 md:pb-6 flex flex-col min-h-screen bg-gray-50/50">
      <div className="mb-6 max-w-7xl mx-auto w-full space-y-4 sticky top-0 z-10 bg-gray-50/95 backdrop-blur-sm pt-2 pb-4 border-b border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Service Records</h1>
            <p className="text-sm text-gray-500 mt-1">Manage and search your recent vehicle services</p>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-1 w-full md:w-auto hide-scrollbar">
            {[
              { id: 'all', label: 'All' },
              { id: 'today', label: 'Today' },
              { id: 'last7', label: 'Last 7 Days' },
              { id: 'thisMonth', label: 'This Month' }
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => handleFilterChange(f.id as FilterType)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === f.id
                    ? 'bg-gray-900 text-white shadow-sm'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-gray-900 focus:border-gray-900 sm:text-sm shadow-sm transition"
            placeholder="Search by Vehicle Number, Customer Name, Mobile, or Invoice No..."
            value={query}
            onChange={handleQueryChange}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
            <p className="font-medium text-sm">Loading records...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
             <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
               <Search className="h-6 w-6" />
             </div>
             <h3 className="text-lg font-bold text-gray-900">No records found</h3>
             <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">We couldn't find any service records matching your search or filter criteria.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Vehicle</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Customer</th>
                    <th className="px-6 py-4 text-left font-semibold text-gray-900">Odometer</th>
                    <th className="px-6 py-4 text-right font-semibold text-gray-900">Total</th>
                    <th className="px-6 py-4 text-center font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {results.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 font-medium">
                        {format(new Date(record.dateOfService), 'dd MMM yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-bold text-gray-900">{record.vehicleNumber}</div>
                        <div className="text-xs text-gray-500">{record.vehicleModel || "N/A"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900 font-medium">{record.customerName}</div>
                        <div className="text-xs text-gray-500">{record.mobileNumber}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {record.kilometerReading} km
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="font-bold text-gray-900">{formatCurrency(record.totalCost)}</div>
                        {record.dueAmount > 0 && <div className="text-[10px] uppercase font-bold text-rose-500">Due: {formatCurrency(record.dueAmount)}</div>}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => onViewRecord && onViewRecord(record)} className="p-2 text-gray-700 bg-gray-100 rounded-lg shadow-sm hover:bg-gray-200 hover:shadow transition" title="View Details">
                            <Eye size={18} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => onViewHistory && onViewHistory(record.vehicleNumber)} className="p-2 text-indigo-700 bg-indigo-50 rounded-lg shadow-sm hover:bg-indigo-100 hover:shadow transition" title="View History">
                            <History size={18} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => onReentry && onReentry(record)} className="p-2 text-emerald-700 bg-emerald-50 rounded-lg shadow-sm hover:bg-emerald-100 hover:shadow transition" title="Repeat Service">
                            <RefreshCcw size={18} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => onWhatsApp && onWhatsApp(record)} className="p-2 text-teal-700 bg-teal-50 rounded-lg shadow-sm hover:bg-teal-100 hover:shadow transition" title="WhatsApp">
                            <MessageCircle size={18} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => onEditRecord && onEditRecord(record)} className="p-2 text-amber-700 bg-amber-50 rounded-lg shadow-sm hover:bg-amber-100 hover:shadow transition" title="Edit">
                            <Edit2 size={18} strokeWidth={2.5} />
                          </button>
                          <button onClick={() => onDeleteRecord && onDeleteRecord(record)} className="p-2 text-rose-700 bg-rose-50 rounded-lg shadow-sm hover:bg-rose-100 hover:shadow transition" title="Delete">
                            <Trash2 size={18} strokeWidth={2.5} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {results.map((record) => (
                <div key={record.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{record.vehicleNumber}</h3>
                      <p className="text-sm text-gray-500">{record.customerName} • {record.mobileNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-gray-900 text-lg">{formatCurrency(record.totalCost)}</p>
                      {record.dueAmount > 0 && <p className="text-[10px] text-rose-500 font-bold uppercase">Due: {formatCurrency(record.dueAmount)}</p>}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs font-medium text-gray-500 mb-4 bg-gray-50 p-2 rounded-lg">
                    <span>{format(new Date(record.dateOfService), 'dd MMM yy')}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span>{record.kilometerReading} km</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="uppercase">{record.vehicleModel || "N/A"}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100">
                    <button 
                      onClick={() => onViewRecord && onViewRecord(record)} 
                      className="flex items-center justify-center gap-1.5 py-2 px-1.5 text-xs sm:text-sm font-extrabold text-gray-950 bg-gray-100 hover:bg-gray-200 active:scale-[0.98] rounded-xl shadow-sm border-2 border-gray-300 transition-all w-full h-10 whitespace-nowrap"
                    >
                      <Eye size={15} strokeWidth={3} className="text-gray-800 flex-shrink-0" />
                      <span>View</span>
                    </button>
                    
                    <button 
                      onClick={() => onWhatsApp && onWhatsApp(record)} 
                      className="flex items-center justify-center gap-1.5 py-2 px-1.5 text-xs sm:text-sm font-extrabold text-teal-950 bg-teal-50 hover:bg-teal-100 active:scale-[0.98] rounded-xl shadow-sm border-2 border-teal-300 transition-all w-full h-10 whitespace-nowrap"
                    >
                      <MessageCircle size={15} strokeWidth={3} className="text-teal-800 flex-shrink-0" />
                      <span>Send</span>
                    </button>
                    
                    <button 
                      onClick={() => onReentry && onReentry(record)} 
                      className="flex items-center justify-center gap-1.5 py-2 px-1.5 text-xs sm:text-sm font-extrabold text-emerald-950 bg-emerald-50 hover:bg-emerald-100 active:scale-[0.98] rounded-xl shadow-sm border-2 border-emerald-300 transition-all w-full h-10 whitespace-nowrap"
                    >
                      <RefreshCcw size={15} strokeWidth={3} className="text-emerald-800 flex-shrink-0" />
                      <span>Repeat</span>
                    </button>

                    <button 
                      onClick={() => onViewHistory && onViewHistory(record.vehicleNumber)} 
                      className="flex items-center justify-center gap-1.5 py-2 px-1.5 text-xs sm:text-sm font-extrabold text-indigo-950 bg-indigo-50 hover:bg-indigo-100 active:scale-[0.98] rounded-xl shadow-sm border-2 border-indigo-300 transition-all w-full h-10 whitespace-nowrap"
                    >
                      <History size={15} strokeWidth={3} className="text-indigo-800 flex-shrink-0" />
                      <span>History</span>
                    </button>
                    
                    <button 
                      onClick={() => onEditRecord && onEditRecord(record)} 
                      className="flex items-center justify-center gap-1.5 py-2 px-1.5 text-xs sm:text-sm font-extrabold text-amber-950 bg-amber-50 hover:bg-amber-100 active:scale-[0.98] rounded-xl shadow-sm border-2 border-amber-300 transition-all w-full h-10 whitespace-nowrap"
                    >
                      <Edit2 size={15} strokeWidth={3} className="text-amber-800 flex-shrink-0" />
                      <span>Edit</span>
                    </button>
                    
                    <button 
                      onClick={() => onDeleteRecord && onDeleteRecord(record)} 
                      className="flex items-center justify-center gap-1.5 py-2 px-1.5 text-xs sm:text-sm font-extrabold text-rose-950 bg-rose-50 hover:bg-rose-100 active:scale-[0.98] rounded-xl shadow-sm border-2 border-rose-300 transition-all w-full h-10 whitespace-nowrap"
                    >
                      <Trash2 size={15} strokeWidth={3} className="text-rose-800 flex-shrink-0" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 0 && (
              <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-2xl shadow-sm mt-4">
                <div className="flex flex-1 justify-between sm:hidden">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="flex items-center text-sm text-gray-500 font-medium">Page {page} of {totalPages}</span>
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{(page - 1) * limit + 1}</span> to <span className="font-medium">{Math.min(page * limit, totalCount)}</span> of{' '}
                      <span className="font-medium">{totalCount}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      
                      {[...Array(totalPages)].map((_, i) => {
                        const pageNum = i + 1;
                        const isCurrent = pageNum === page;
                        // Simple pagination display: Show first, last, and a few around current
                        if (totalPages > 7 && pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - page) > 1) {
                           if (pageNum === 2 || pageNum === totalPages - 1) {
                             return <span key={pageNum} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 focus:outline-offset-0">...</span>;
                           }
                           return null;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                              isCurrent
                                ? 'z-10 bg-gray-900 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900'
                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

