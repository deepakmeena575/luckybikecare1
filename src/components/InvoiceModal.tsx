import React, { useRef } from 'react';
import { ServiceRecord } from '../types';
import { format } from 'date-fns';
import { formatCurrency, parseServiceDescription } from '../utils';
import { BottomSheet } from './BottomSheet';
import { Printer, Phone, Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

interface InvoiceModalProps {
  record: ServiceRecord | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ record, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [printError, setPrintError] = React.useState<string | null>(null);

  const handlePrint = () => {
    if (window.self !== window.top) {
      setPrintError("Printing is restricted in this preview. Please open the app in a new tab using the button in the top right to print.");
      setTimeout(() => setPrintError(null), 5000);
    } else {
      window.print();
    }
  };

  const handleDownloadPDF = () => {
    const element = invoiceRef.current;
    if (!element || !record) return;
    
    // Quick clone to hide non-print elements only for PDF
    const opt = {
      margin: [10, 10, 10, 10] as [number, number, number, number], // top, left, bottom, right in mm
      filename: `Invoice_${record.id}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const parsedDescription = record ? (typeof record.serviceDescription === 'string' ? parseServiceDescription(record.serviceDescription) : (record.serviceDescription || [])) : [];

  const calculateSubtotal = () => {
    return parsedDescription.reduce((acc: number, curr: any) => acc + (curr.partCost || 0) + (curr.labourCost || 0) - (curr.exchangeValue || 0), 0) + (record?.labourCost || 0);
  };
  
  const total = calculateSubtotal();

  return (
    <BottomSheet isOpen={!!record} onClose={onClose} title={record ? `Invoice ${record.id}` : ''} className="sm:max-w-4xl">
      {record && (
      <div className="print-area bg-white text-gray-900 border border-gray-200 rounded-xl max-w-4xl mx-auto overflow-hidden shadow-sm selection:bg-primary-100 font-sans w-full relative">
        
        {/* UI Action Buttons (Hidden when printing) */}
        <div className="no-print flex flex-col md:flex-row justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50 gap-4">
          <button 
            onClick={handleDownloadPDF}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition"
          >
            <Download size={16} />
            <span>Download PDF</span>
          </button>
          
          <div className="flex flex-col items-end w-full md:w-auto">
            <button 
              onClick={handlePrint}
              className="w-full md:w-auto flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition"
            >
              <Printer size={16} />
              <span>Print Invoice</span>
            </button>
            {printError && (
              <p className="text-rose-600 text-xs mt-2 font-medium w-full md:max-w-sm text-center md:text-right bg-rose-50 p-2 rounded-lg border border-rose-100">
                {printError}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 xl:p-12 w-full mx-auto relative z-10 min-h-full" ref={invoiceRef}>
          
          {/* Header Block */}
          <div className="bg-[#2b88fb] text-white text-center py-6 rounded-xl mb-8">
             <h1 className="text-3xl font-extrabold mb-3 tracking-wide">TAX INVOICE</h1>
             <p className="text-sm border-t border-white/20 pt-3 inline-block px-4">Invoice #{record.id}</p>
          </div>

          <div className="text-center mb-6 text-gray-800">
            <h2 className="text-2xl font-bold text-[#2b88fb] mb-1 flex justify-center items-center gap-2">🏍️ Lucky Bike Care</h2>
            <p className="text-[13px]">Professional Motorcycle Service & Repair Center</p>
            <p className="text-[13px] flex justify-center items-center gap-1.5 mt-1">
              <span className="text-rose-600 text-base">📍</span> Kota, Rajasthan <span className="text-gray-300 mx-1">|</span> <Phone size={13} className="text-gray-600"/> +91 9414377153
            </p>
            <p className="text-[13px] mt-1 text-gray-600 flex justify-center gap-4">
              <span>Owned by: Rakesh Choursiya</span>
            </p>
          </div>

          <hr className="border-gray-100 mb-6" />

          {/* Customer & Invoice Details */}
          <div className="flex flex-col sm:flex-row justify-between items-start mb-8 text-[13px] leading-relaxed gap-6">
             <div className="flex-1">
               <h3 className="text-[#2b88fb] font-bold uppercase tracking-widest text-[11px] mb-3">BILL TO</h3>
               <p className="font-bold text-gray-900 uppercase text-sm mb-1.5">{record.customerName}</p>
               <p className="flex items-center gap-2 mb-1">📱 {record.mobileNumber}</p>
               <p className="flex items-center gap-2 mb-1">🏍️ {record.vehicleModel} ({record.vehicleNumber})</p>
               <p className="flex items-center gap-2 text-gray-500">🔢 Service Counter: {record.serviceCounter || 'LBC'}</p>
             </div>
             
             <div className="sm:text-right flex-1 w-full sm:w-auto">
               <h3 className="text-[#2b88fb] font-bold uppercase tracking-widest text-[11px] mb-3 sm:block hidden">INVOICE DETAILS</h3>
               <h3 className="text-[#2b88fb] font-bold uppercase tracking-widest text-[11px] mb-3 sm:hidden block">INVOICE DETAILS</h3>
               <div className="grid grid-cols-[100px_auto] sm:grid-cols-[auto_auto] gap-x-2 gap-y-1.5 sm:justify-end text-left sm:text-right w-full">
                 <span className="font-bold text-gray-900">Date:</span>
                 <span className="text-gray-700">{record.dateOfService ? format(new Date(record.dateOfService), 'dd MMMM yyyy') : 'N/A'}</span>
                 
                 <span className="font-bold text-gray-900">KM Reading:</span>
                 <span className="text-gray-700">{record.kilometerReading} km</span>
                 
                 <span className="font-bold text-gray-900">Next Service:</span>
                 <span className="text-gray-700">{record.nextServiceDate ? format(new Date(record.nextServiceDate), 'dd MMMM yyyy') : 'N/A'}</span>
               </div>
             </div>
          </div>

          {/* Service Details Table */}
          <div className="mb-6 z-10 relative">
             <h3 className="font-bold text-gray-900 text-sm mb-0 bg-[#f4fbff] py-3 px-4 rounded-t-xl border-x border-t border-[#e2f1fc] items-center gap-2 flex">
               📋 Service Details
             </h3>
             <div className="overflow-x-auto">
             <table className="w-full text-sm min-w-[500px]">
                <thead>
                   <tr className="bg-[#2b88fb] text-white">
                     <th className="py-2.5 px-3 text-left font-bold text-[11px] tracking-wider uppercase border-r border-white/20 whitespace-pre">#</th>
                     <th className="py-2.5 px-3 text-left font-bold text-[11px] tracking-wider uppercase">ITEM DESCRIPTION</th>
                     <th className="py-2.5 px-3 text-right font-bold text-[11px] tracking-wider uppercase">PART COST</th>
                     <th className="py-2.5 px-3 text-right font-bold text-[11px] tracking-wider uppercase">LABOUR</th>
                     <th className="py-2.5 px-3 text-right font-bold text-[11px] tracking-wider uppercase">EXCHANGE</th>
                     <th className="py-2.5 px-3 text-right font-bold text-[11px] tracking-wider uppercase">TOTAL</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-[13px] border-b border-gray-100">
                  {parsedDescription.length === 0 ? (
                     <tr><td colSpan={6} className="py-4 text-center italic text-gray-400">No parts billed.</td></tr>
                  ) : (
                     parsedDescription.map((item: any, i: number) => (
                       <tr key={item.id} className="hover:bg-gray-50/50">
                         <td className="py-2.5 px-3 text-gray-500">{i + 1}</td>
                         <td className="py-2.5 px-3 font-medium text-gray-900 uppercase">{item.partName}</td>
                         <td className="py-2.5 px-3 text-right text-gray-700">{formatCurrency(item.partCost)}</td>
                         <td className="py-2.5 px-3 text-right text-gray-700">{formatCurrency(item.labourCost)}</td>
                         <td className="py-2.5 px-3 text-right text-rose-600">{item.exchangeValue > 0 ? `-${formatCurrency(item.exchangeValue)}` : '-'}</td>
                         <td className="py-2.5 px-3 text-right font-bold text-gray-900">{formatCurrency((item.partCost + item.labourCost) - item.exchangeValue)}</td>
                       </tr>
                     ))
                  )}
                  {/* General Labour Row */}
                  <tr className="font-semibold text-gray-900 bg-gray-50/30 print:bg-gray-100">
                    <td className="py-3 px-3"></td>
                    <td className="py-3 px-3">General Service Labour</td>
                    <td className="py-3 px-3 text-right text-gray-500 font-normal">-</td>
                    <td className="py-3 px-3 text-right">{formatCurrency(record.labourCost)}</td>
                    <td className="py-3 px-3 text-right text-gray-500 font-normal">-</td>
                    <td className="py-3 px-3 text-right font-bold">{formatCurrency(record.labourCost)}</td>
                  </tr>
                </tbody>
             </table>
             </div>
          </div>

          {/* Payment Summary */}
          <div className="z-10 relative bg-white flex flex-col md:flex-row gap-6">
             <div className="flex-1 md:block hidden">
               {/* Spacer or extra info can go here for wider screens */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-500 mt-10">
                   <p className="font-bold text-gray-700 mb-2">Terms & Conditions:</p>
                   <ul className="list-disc pl-4 space-y-1">
                     <li>Parts once sold will not be returned.</li>
                     <li>Vehicles parked at owner's risk.</li>
                     <li>Subjet to Kota Jurisdiction.</li>
                   </ul>
                </div>
             </div>
             <div className="flex-1 min-w-[280px]">
               <h3 className="font-bold text-gray-900 text-sm mb-0 bg-[#f4fbff] py-3 px-4 rounded-t-xl border-x border-t border-[#e2f1fc] items-center gap-2 flex">
                 💰 Payment Summary
               </h3>
               <div className="border border-gray-100 rounded-b-xl px-4 py-4 space-y-3 text-[13px] text-gray-700">
                  <div className="flex justify-between font-bold text-sm text-gray-900 border-b border-gray-200 pb-3 mb-3">
                    <span className="uppercase">SERVICE BILL TOTAL</span>
                    <span>{formatCurrency(record.totalCost)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span>Cash Paid</span>
                    <span>{formatCurrency(record.cashPaid)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Online Paid</span>
                    <span>{formatCurrency(record.onlinePaid)}</span>
                  </div>
                  
                  <div className="flex justify-between items-center pt-2 pb-2 bg-[#f4fbff] -mx-4 px-4 mt-2 border-t border-[#e2f1fc]">
                    <span className="font-bold text-gray-900 uppercase">BALANCE DUE</span>
                    <div className="text-right flex items-center justify-end gap-3 flex-row-reverse">
                      <span className={`font-bold text-lg leading-none ${record.dueAmount > 0 ? "text-rose-600" : "text-emerald-600"}`}>{formatCurrency(record.dueAmount)}</span>
                      {record.dueAmount === 0 && (
                        <span className="inline-flex bg-[#d1fae5] text-[#065f46] text-[10px] items-center font-bold px-1.5 py-0.5 rounded gap-1 leading-none h-fit">✅ PAID</span>
                      )}
                    </div>
                  </div>
               </div>
             </div>
          </div>

          <div className="mt-8 text-center text-[11px] text-gray-500 bg-[#f8fbfe] py-6 px-4 rounded-xl border border-[#eef5fa] print:block relative z-10 w-full overflow-hidden">
            <p className="font-bold text-gray-700 mb-1 leading-relaxed">Next Service Due: {record.nextServiceDate ? format(new Date(record.nextServiceDate), 'dd MMMM yyyy') : 'N/A'}</p>
            <p className="mb-2 leading-relaxed">Thank you for choosing Lucky Bike Care! 🏍️</p>
            <p className="text-gray-400 mt-2">&copy; {new Date().getFullYear()} Lucky Bike Care. All Rights Reserved.</p>
          </div>
          
          {/* Watermark Logo */}
          <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.02] pointer-events-none overflow-hidden pb-32 mix-blend-multiply">
             <h1 className="text-[12rem] xl:text-[20rem] font-black rotate-[-30deg] tracking-widest text-[#2b88fb] leading-[0.8] block mx-auto whitespace-nowrap text-center select-none">LUCKY<br/>BIKE<br/>CARE</h1>
          </div>

        </div>
      </div>
      )}
    </BottomSheet>
  );
};

