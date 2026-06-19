import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Calculator, IndianRupee, Printer, Edit2, Trash2, History } from 'lucide-react';
import { DB } from '../db';
import { ServiceRecord } from '../types';
import { formatCurrency } from '../utils';
import { format } from 'date-fns';

interface SearchScreenProps {
  onViewRecord?: (record: ServiceRecord) => void;
  onEditRecord?: (record: ServiceRecord) => void;
  onDeleteRecord?: (record: ServiceRecord) => void;
  onViewHistory?: (vehicleNumber: string) => void;
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onViewRecord, onEditRecord, onDeleteRecord, onViewHistory }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ServiceRecord[]>([]);

  useEffect(() => {
    let mounted = true;
    if (query.length > 1) {
      const runSearch = async () => {
        try {
          const res = await DB.searchRecords(query);
          if (mounted) setResults(res);
        } catch (e) {
          console.error(e);
        }
      };
      runSearch();
    } else {
      setResults([]);
    }
    return () => { mounted = false; };
  }, [query]);

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8 flex flex-col max-h-screen">
      <div className="mb-6 max-w-3xl mx-auto w-full flex justify-between items-end">
        <div className="w-full">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight mb-4">Search Records</h1>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm shadow-sm transition"
              placeholder="Search by Vehicle Number, Name or Mobile..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto w-full flex-1 overflow-y-auto hide-scrollbar space-y-3">
        {query.length > 0 && query.length < 2 && (
          <p className="text-center text-sm text-gray-500 mt-8">Type at least 2 characters to search...</p>
        )}
        
        {query.length > 1 && results.length === 0 && (
          <div className="text-center py-12">
             <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Search className="h-6 w-6 text-gray-400" />
             </div>
             <h3 className="text-lg font-medium text-gray-900">No results found</h3>
             <p className="text-sm text-gray-500 mt-1">Try adjusting your search terms</p>
          </div>
        )}

        {results.map((record) => (
          <div 
            key={record.id} 
            className="glass-card p-4 group"
          >
            <div className="flex justify-between items-start mb-2">
               <div>
                  <h3 className="font-bold text-gray-900">{record.vehicleNumber}</h3>
                  <p className="text-sm text-gray-600">{record.customerName} • {record.mobileNumber}</p>
               </div>
               <div className="text-right flex flex-col items-end gap-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    Service #{record.serviceCounter}
                  </span>
               </div>
            </div>
            
            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-4 items-center justify-between">
               <div className="flex space-x-4">
                 <div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase">Date</p>
                    <p className="text-sm text-gray-900 font-medium">{format(new Date(record.dateOfService), 'dd MMM yyyy')}</p>
                 </div>
                 <div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase">Bill Amount</p>
                    <p className="text-sm text-gray-900 font-bold">{formatCurrency(record.totalCost)}</p>
                 </div>
                 {record.dueAmount > 0 && (
                   <div>
                      <p className="text-[10px] text-rose-500 font-medium uppercase">Due Amount</p>
                      <p className="text-sm text-rose-600 font-bold">{formatCurrency(record.dueAmount)}</p>
                   </div>
                 )}
               </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap gap-2 items-center justify-end">
               <button onClick={() => onViewHistory && onViewHistory(record.vehicleNumber)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition">
                 <History size={16} /> View History
               </button>
               <button onClick={() => onViewRecord && onViewRecord(record)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition">
                 <Printer size={16} /> Bill
               </button>
               <button onClick={() => onEditRecord && onEditRecord(record)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition">
                 <Edit2 size={16} /> Edit
               </button>
               <button onClick={() => onDeleteRecord && onDeleteRecord(record)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition">
                 <Trash2 size={16} /> Delete
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
