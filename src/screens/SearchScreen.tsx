import React, { useState, useEffect } from 'react';
import { Search, ChevronRight, Calculator, IndianRupee, Printer, Edit2, Trash2, History, RefreshCcw } from 'lucide-react';
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
}

export const SearchScreen: React.FC<SearchScreenProps> = ({ onViewRecord, onEditRecord, onDeleteRecord, onViewHistory, onReentry }) => {
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

        {results.map((record) => {
          const parsedParts = parseServiceDescription(record.serviceDescription);
          return (
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
              
              {/* Parts Details Breakdown Section */}
              <div className="mt-3 bg-gray-50 p-3 rounded-lg border border-gray-100 text-xs">
                <div className="font-bold text-gray-500 uppercase tracking-wide text-[10px] mb-2 flex justify-between">
                  <span>Parts & Work Details ({parsedParts.length})</span>
                  <span>Model: <span className="text-gray-700 normal-case">{record.vehicleModel || "N/A"}</span></span>
                </div>
                {parsedParts.length === 0 ? (
                  <p className="text-gray-400 italic">No specific parts recorded for this service.</p>
                ) : (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                    {parsedParts.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center text-gray-700 bg-white p-1.5 rounded border border-gray-50 shadow-sm">
                        <span className="font-semibold text-gray-800 uppercase">{item.partName || "Part name not entered"}</span>
                        <div className="text-right text-[11px] text-gray-500 flex gap-2">
                          {item.partCost > 0 && <span>Part: <strong className="text-gray-700">{formatCurrency(item.partCost)}</strong></span>}
                          {item.labourCost > 0 && <span>Lab: <strong className="text-gray-700">{formatCurrency(item.labourCost)}</strong></span>}
                          {item.exchangeValue > 0 && <span className="text-rose-600 font-medium">Exch: -{formatCurrency(item.exchangeValue)}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {record.labourCost > 0 && (
                  <div className="mt-2 pt-2 border-t border-dashed border-gray-200 flex justify-between text-gray-700">
                    <span className="font-medium text-gray-500">General Labour Charge</span>
                    <span className="font-bold text-gray-800">{formatCurrency(record.labourCost)}</span>
                  </div>
                )}
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
                 <button 
                   onClick={() => onReentry && onReentry(record)} 
                   className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition shadow-sm border border-emerald-100"
                   title="Pre-fill vehicle/customer info to do repeat service"
                 >
                   <RefreshCcw size={16} /> Re-entry (Repeat)
                 </button>
                 <button onClick={() => onEditRecord && onEditRecord(record)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition">
                   <Edit2 size={16} /> Edit
                 </button>
                 <button onClick={() => onDeleteRecord && onDeleteRecord(record)} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-rose-600 bg-rose-50 rounded-lg hover:bg-rose-100 transition">
                   <Trash2 size={16} /> Delete
                 </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
