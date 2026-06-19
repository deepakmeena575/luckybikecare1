import React from 'react';
import { ServiceRecord } from '../types';
import { format } from 'date-fns';
import { formatCurrency } from '../utils';
import { BottomSheet } from './BottomSheet';
import { Printer, MapPin, Phone } from 'lucide-react';

interface InvoiceModalProps {
  record: ServiceRecord | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ record, onClose }) => {
  if (!record) return null;

  const [printError, setPrintError] = React.useState<string | null>(null);

  const handlePrint = () => {
    if (window.self !== window.top) {
      setPrintError("Printing is restricted in this preview. Please open the app in a new tab using the button in the top right to print.");
      setTimeout(() => setPrintError(null), 5000);
    } else {
      window.print();
    }
  };

  return (
    <BottomSheet isOpen={!!record} onClose={onClose} title={`Invoice ${record.id}`}>
      <div className="print-area bg-white text-gray-900 border border-gray-200 rounded-xl max-w-2xl mx-auto overflow-hidden shadow-sm selection:bg-primary-100">
        
        {/* Print Only Header (Hidden in UI normally, visible in print) */}
        <div className="hidden print-only text-center py-6 border-b-2 border-gray-900 mb-6 px-8">
           <h1 className="text-3xl font-extrabold tracking-tight">LUCKY BIKE CARE SERVICE</h1>
           <p className="text-sm font-bold mt-2">Rakesh Choursiya</p>
           <p className="text-sm font-medium mt-1 flex justify-center items-center gap-4 text-gray-600">
            <span className="flex items-center gap-1"><Phone size={12}/> +91 9414377153</span>
           </p>
        </div>

        {/* UI Action Buttons (Hidden when printing) */}
        <div className="no-print flex flex-col items-end p-4 border-b border-gray-100 bg-gray-50/50">
          <button 
            onClick={handlePrint}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
          >
            <Printer size={16} />
            <span>Print Invoice</span>
          </button>
          {printError && (
            <p className="text-rose-600 text-xs mt-2 font-medium max-w-sm text-right bg-rose-50 p-2 rounded-lg border border-rose-100">
              {printError}
            </p>
          )}
        </div>

        <div className="p-6 md:p-8">
          
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Billed To</p>
              <h3 className="font-bold text-lg">{record.customerName}</h3>
              <p className="text-gray-600">{record.mobileNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-2">Invoice Details</p>
              <p className="font-semibold text-gray-800">#{record.id}</p>
              <p className="text-gray-600">Date: {format(new Date(record.dateOfService), 'dd MMM yyyy')}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-8 grid grid-cols-3 text-sm border border-gray-200">
             <div>
               <p className="text-gray-500 font-medium">Vehicle</p>
               <p className="font-bold text-gray-900">{record.vehicleNumber}</p>
             </div>
             <div>
               <p className="text-gray-500 font-medium">Model</p>
               <p className="font-bold text-gray-900">{record.vehicleModel}</p>
             </div>
             <div className="text-right">
               <p className="text-gray-500 font-medium">Kilometers</p>
               <p className="font-bold text-gray-900">{record.kilometerReading} KM</p>
             </div>
          </div>

          <table className="w-full text-left text-sm mb-8">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 font-bold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="py-3 text-right font-bold text-gray-500 uppercase tracking-wider">Mtrl. Cost<br/><span className="text-[10px] lowercase font-normal">(Not Billed)</span></th>
                <th className="py-3 text-right font-bold text-gray-500 uppercase tracking-wider">Labour</th>
                <th className="py-3 text-right font-bold text-emerald-600 uppercase tracking-wider">Exch. Val</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {record.serviceDescription.length === 0 && (
                 <tr>
                   <td colSpan={4} className="py-4 text-center text-gray-500 italic">No specific parts recorded.</td>
                 </tr>
              )}
              {record.serviceDescription.map(item => (
                 <tr key={item.id}>
                   <td className="py-3 font-medium text-gray-900">{item.partName}</td>
                   <td className="py-3 text-right text-gray-500">{formatCurrency(item.partCost)}</td>
                   <td className="py-3 text-right text-gray-800">{formatCurrency(item.labourCost)}</td>
                   <td className="py-3 text-right text-emerald-600">{item.exchangeValue > 0 ? `-${formatCurrency(item.exchangeValue)}` : '-'}</td>
                 </tr>
              ))}
            </tbody>
          </table>

          <div className="border-t-2 border-gray-200 pt-6 flex flex-col items-end w-full space-y-2">
             <div className="flex w-full max-w-xs justify-between text-gray-600 border-b border-gray-100 pb-2">
               <span>General Labour:</span>
               <span className="font-medium text-gray-900">{formatCurrency(record.labourCost)}</span>
             </div>
             <div className="flex w-full max-w-xs justify-between text-gray-900 font-bold text-lg pt-2">
               <span>Final Bill:</span>
               <span>{formatCurrency(record.totalCost)}</span>
             </div>
             
             <div className="w-full max-w-xs mt-4 pt-4 border-t border-gray-200">
               <div className="flex justify-between text-sm text-gray-600 mb-1">
                 <span>Paid (Cash + Online):</span>
                 <span>{formatCurrency(record.cashPaid + record.onlinePaid)}</span>
               </div>
               <div className="flex justify-between font-bold text-rose-600">
                 <span>Due Balance:</span>
                 <span>{formatCurrency(record.dueAmount)}</span>
               </div>
             </div>
          </div>
          
          <div className="mt-12 text-center text-xs text-gray-400 no-print">
            Next Service Due: {format(new Date(record.nextServiceDate), 'MMMM dd, yyyy')}
          </div>
          
        </div>
      </div>
    </BottomSheet>
  );
};
