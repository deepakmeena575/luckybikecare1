import React, { useState, useEffect } from 'react';
import { DB } from '../db';
import { ServiceRecord } from '../types';
import { Search, Clock, FileText, CheckCircle2, ChevronDown, ChevronUp, Phone } from 'lucide-react';
import { format } from 'date-fns';
import { formatCurrency, parseServiceDescription } from '../utils';

export const HistoryScreen: React.FC<{ initialVehicleNumber?: string, onViewRecord?: (record: ServiceRecord) => void }> = ({ initialVehicleNumber, onViewRecord }) => {
  const [vehicleNumber, setVehicleNumber] = useState(initialVehicleNumber || '');
  const [history, setHistory] = useState<ServiceRecord[] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialVehicleNumber) {
      setVehicleNumber(initialVehicleNumber);
      handleSearchDirect(initialVehicleNumber);
    }
  }, [initialVehicleNumber]);

  const handleSearchDirect = async (vNumber: string) => {
    if (!vNumber.trim()) return;
    try {
      const records = await DB.getHistoryByVehicle(vNumber);
      setHistory(records);
      if(records.length > 0) {
        setExpandedId(records[0].id); // Expand most recent by default
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    handleSearchDirect(vehicleNumber);
  };

  return (
    <div className="flex-1 p-4 md:p-8 overflow-y-auto pb-24 md:pb-8">
      <div className="mb-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Vehicle History</h1>
        <p className="text-sm text-gray-500 mt-1">View complete service lifecycle timeline.</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex shadow-sm rounded-xl overflow-hidden glass-card">
            <input
              type="text"
              placeholder="Enter Vehicle Number (e.g. MH 12 AB 1234)"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              className="flex-1 px-4 py-3 outline-none text-sm bg-transparent"
              required
            />
            <button 
              type="submit"
              className="bg-primary-600 text-white px-6 py-3 font-medium text-sm hover:bg-primary-700 transition"
            >
              Search Timeline
            </button>
          </div>
        </form>

        {history !== null && history.length === 0 && (
          <div className="text-center py-12 glass-card">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="text-gray-400" size={24} />
            </div>
            <p className="text-gray-900 font-medium">No service history found</p>
            <p className="text-sm text-gray-500 mt-1">This vehicle hasn't been serviced here yet.</p>
          </div>
        )}

        {history && history.length > 0 && (
          <div className="mb-8 p-6 glass-card border flex flex-col gap-4 rounded-2xl bg-white shadow-sm border-gray-100">
            <div>
              <p className="text-xs font-bold text-primary-500 uppercase tracking-widest mb-1">Vehicle Match</p>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900">{history[0].vehicleNumber}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Customer Name</p>
                <p className="font-semibold text-gray-900">{history[0].customerName}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Mobile Number</p>
                <p className="font-semibold text-gray-900 flex items-center gap-1"><Phone size={12} className="text-gray-400" /> {history[0].mobileNumber}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Vehicle Model</p>
                <p className="font-semibold text-gray-900">{history[0].vehicleModel}</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Total Visits</p>
                <p className="font-semibold text-primary-600 bg-primary-50 inline-flex px-2 py-0.5 rounded text-xs">{history.length} services</p>
              </div>
            </div>
          </div>
        )}

        {history && history.length > 0 && (
          <div className="relative border-l-2 border-gray-200 ml-4 md:ml-6 space-y-6">
            {history.map((record, index) => {
              const isExpanded = expandedId === record.id;
              
              return (
                <div key={record.id} className="relative pl-6 md:pl-8">
                  {/* Timeline Dot */}
                  <div className="absolute -left-[9px] top-4 w-4 h-4 rounded-full bg-gray-50 border-4 border-primary-500 shadow-sm" />
                  
                  <div 
                    className={`glass-card overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-primary-500/20' : 'hover:border-primary-300 cursor-pointer'}`}
                    onClick={() => !isExpanded && setExpandedId(record.id)}
                  >
                    {/* Header */}
                    <div className="p-4 flex flex-wrap justify-between items-center gap-4 bg-gray-50/50">
                      <div>
                        <div className="flex items-center space-x-2">
                           <span className="text-sm font-bold text-primary-700 bg-primary-50 px-2 py-0.5 rounded-md">Service #{record.serviceCounter}</span>
                           <span className="text-xs font-semibold text-gray-500">{record.dateOfService ? format(new Date(record.dateOfService), 'MMMM dd, yyyy') : 'N/A'}</span>
                        </div>
                        <h3 className="text-gray-900 font-semibold mt-1 flex items-center gap-2">
                           {record.vehicleModel} 
                           <span className="text-xs font-normal text-gray-500">({record.kilometerReading} KM)</span>
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4">
                         <div className="text-right">
                            <p className="text-[10px] text-gray-500 uppercase font-medium">Total Billed</p>
                            <p className="font-bold text-gray-900">{formatCurrency(record.totalCost)}</p>
                         </div>
                         <button 
                           className="p-1 text-gray-400 hover:text-gray-600 transition"
                           onClick={(e) => { e.stopPropagation(); setExpandedId(isExpanded ? null : record.id); }}
                         >
                           {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                         </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                         {/* Services List */}
                         <div className="mb-4">
                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Service Details</h4>
                            {parseServiceDescription(record.serviceDescription).length === 0 ? (
                               <p className="text-sm text-gray-500 italic">No specific parts listed.</p>
                            ) : (
                              <ul className="space-y-2">
                                {parseServiceDescription(record.serviceDescription).map((item: any) => (
                                  <li key={item.id} className="text-sm flex flex-wrap justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <span className="font-medium text-gray-800">{item.partName}</span>
                                    <div className="text-xs text-gray-500 flex gap-3 text-right">
                                       <span className={item.exchangeValue > 0 ? 'text-emerald-600' : ''}>Exp: {item.exchangeValue > 0 ? `-${formatCurrency(item.exchangeValue)}` : '0'}</span>
                                       <span>Lab: {formatCurrency(item.labourCost)}</span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            )}
                         </div>

                         {/* Payments Summary */}
                         <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm bg-gray-50 p-3 rounded-xl border border-gray-100">
                            <div>
                               <p className="text-[10px] text-gray-500 uppercase">Status</p>
                               <span className={`inline-flex items-center mt-0.5 gap-1 font-medium ${record.dueAmount === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                 {record.dueAmount === 0 ? <><CheckCircle2 size={14}/> Paid</> : 'Due Balance'}
                               </span>
                            </div>
                            <div>
                               <p className="text-[10px] text-gray-500 uppercase">Paid (Cash)</p>
                               <p className="font-medium">{formatCurrency(record.cashPaid)}</p>
                            </div>
                            <div>
                               <p className="text-[10px] text-gray-500 uppercase">Paid (Online)</p>
                               <p className="font-medium">{formatCurrency(record.onlinePaid)}</p>
                            </div>
                            <div>
                               <p className="text-[10px] text-gray-500 uppercase">Due Amount</p>
                               <p className={`font-semibold ${record.dueAmount > 0 ? 'text-rose-600' : 'text-gray-900'}`}>
                                  {formatCurrency(record.dueAmount)}
                               </p>
                            </div>
                         </div>

                         <div className="mt-4 flex justify-end">
                           <button onClick={(e) => { e.stopPropagation(); if(onViewRecord) onViewRecord(record); }} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition shadow-sm border border-primary-100">
                             <FileText size={16} /> View/Print Bill
                           </button>
                         </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
