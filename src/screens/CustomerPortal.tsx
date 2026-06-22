import React, { useState, useEffect } from 'react';
import { Search, MapPin, Phone, Calendar, ArrowRight, X, Clock, FileText, CheckCircle, CarFront } from 'lucide-react';
import { DB } from '../db';
import { ServiceRecord } from '../types';
import { formatCurrency, parseServiceDescription } from '../utils';
import { format } from 'date-fns';
import { InvoiceModal } from '../components/InvoiceModal';
import { WhatsAppModal } from '../components/WhatsAppModal';

export const CustomerPortal: React.FC<{ initialInvoiceId?: string }> = ({ initialInvoiceId }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [records, setRecords] = useState<ServiceRecord[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [viewRecord, setViewRecord] = useState<ServiceRecord | null>(null);
  const [whatsAppRecord, setWhatsAppRecord] = useState<ServiceRecord | null>(null);

  // Parse query params and auto-login if they exist
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('m');
    const v = params.get('v');

    const autoLogin = async (vn: string, mn: string, openInvoiceId?: string) => {
      setIsLoading(true);
      try {
        const data = await DB.getCustomerPortalData(vn, mn);
        if (data.length > 0) {
          setRecords(data);
          setIsAuthenticated(true);
          if (openInvoiceId) {
             const preOpenRecord = data.find(r => r.id === openInvoiceId);
             if (preOpenRecord) setViewRecord(preOpenRecord);
          }
        } else {
           setError('Invalid or expired link. Please enter details manually.');
        }
      } catch(err) {
         setError('Failed to authenticate link.');
      } finally {
        setIsLoading(false);
      }
    };

    if (initialInvoiceId) {
      setIsLoading(true);
      DB.getPublicInvoiceById(initialInvoiceId).then(record => {
        if (record) {
          setVehicleNumber(record.vehicleNumber);
          setMobileNumber(record.mobileNumber);
          setRecords([record]);
          setIsAuthenticated(true);
          setViewRecord(record);
        } else {
          setError('Invoice not found.');
        }
        setIsLoading(false);
      });
    } else if (v && m) {
      setVehicleNumber(decodeURIComponent(v));
      setMobileNumber(decodeURIComponent(m));
      autoLogin(decodeURIComponent(v), decodeURIComponent(m));
    }
  }, [initialInvoiceId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicleNumber.trim() || !mobileNumber.trim()) {
      setError('Please enter both details');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const data = await DB.getCustomerPortalData(vehicleNumber, mobileNumber);
      if (data.length === 0) {
        setError('No records found for the given details. Please check and try again.');
      } else {
        setRecords(data);
        setIsAuthenticated(true);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setRecords([]);
    setVehicleNumber('');
    setMobileNumber('');
    setError('');
  };

  if (!isAuthenticated) {
    if (initialInvoiceId && error) {
      return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-6 shadow-sm">
            <span className="text-4xl font-bold">!</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Invoice Not Found</h1>
          <p className="text-gray-500 text-center max-w-sm mb-8">{error}</p>
          <a href="/" className="px-6 py-3 bg-gray-900 hover:bg-black text-white font-semibold rounded-xl shadow-md transition-colors">
            Go to Homepage
          </a>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl mix-blend-overlay"></div>
            <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4 relative z-10">
              <span className="text-3xl font-black text-gray-900">L</span>
            </div>
            <h1 className="text-2xl font-bold mb-1 relative z-10">Customer Portal</h1>
            <p className="text-gray-300 text-sm relative z-10">Access your complete service history</p>
          </div>
          
          <div className="p-8">
            {error && (
              <div className="bg-rose-50 text-rose-600 text-sm p-3 rounded-lg border border-rose-100 mb-6 font-medium text-center">
                {error}
              </div>
            )}
            
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <CarFront size={16} /> Vehicle Number
                </label>
                <input 
                  type="text" 
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  placeholder="e.g. MH 12 AB 1234"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition outline-none text-gray-800 font-medium tracking-wide placeholder-gray-400 uppercase"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Phone size={16} /> Registered Mobile Number
                </label>
                <input 
                  type="tel" 
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="10-digit number"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition outline-none text-gray-800 font-medium placeholder-gray-400"
                />
              </div>
              
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full mt-4 bg-gray-900 hover:bg-black text-white font-semibold py-3.5 px-4 rounded-xl shadow-md transition disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoading ? 'Verifying...' : 'Access History'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                <CheckCircle size={12} /> Secure Portal
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const latestRecord = records[0];
  const totalAmountSpent = records.reduce((sum, r) => sum + r.totalCost, 0);

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center text-white font-bold shadow-md">L</div>
          <div>
            <h1 className="text-base font-bold text-gray-900 leading-tight">Lucky Bike</h1>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold">Service History</p>
          </div>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
        >
          <X size={20} />
        </button>
      </div>

      <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
         {/* Vehicle Profile Card */}
         <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-lg p-5 text-white overflow-hidden relative">
            <div className="absolute -right-8 -top-8 text-gray-700 opacity-20">
              <CarFront size={120} />
            </div>
            <div className="relative z-10 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full bg-white/20 text-white/90 text-xs font-semibold tracking-wider uppercase mb-2">
                  {latestRecord.vehicleModel || "Vehicle"}
                </span>
                <h2 className="text-3xl font-black tracking-tight">{latestRecord.vehicleNumber}</h2>
                <p className="text-gray-300 text-sm mt-1 flex items-center gap-1.5"><UserAvatar name={latestRecord.customerName} /> {latestRecord.customerName}</p>
              </div>
            </div>
         </div>

         {/* Stats Row */}
         <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <Calendar size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Visits</p>
                <p className="text-xl font-bold text-gray-900">{records.length}</p>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="font-bold">₹</span>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Total Spent</p>
                <p className="text-xl font-bold text-gray-900">{formatCurrency(totalAmountSpent)}</p>
              </div>
            </div>
         </div>

         {/* Upcoming Reminder Alert */}
         {new Date() < new Date(latestRecord.nextServiceDate) && (
           <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-900 relative overflow-hidden shadow-sm">
             <div className="absolute top-0 right-0 w-2 h-full bg-amber-400 rounded-r-2xl"></div>
             <Clock className="min-w-[24px] text-amber-600" />
             <div>
               <h4 className="font-bold text-sm">Upcoming Service Recommended</h4>
               <p className="text-sm mt-1 opacity-90 text-amber-800">
                 Due on <strong className="text-amber-900">{format(new Date(latestRecord.nextServiceDate), 'MMMM dd, yyyy')}</strong> or at <strong className="text-amber-900">{latestRecord.kilometerReading + 2500} km</strong>.
               </p>
             </div>
           </div>
         )}
         
         <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2 mt-8 mb-2">
           <FileText size={20} /> Service Timeline
         </h3>

         {/* Timeline */}
         <div className="space-y-4">
           {records.map((record, index) => (
             <ServiceEventCard 
               key={record.id} 
               record={record} 
               isLatest={index === 0} 
               onViewInvoice={() => setViewRecord(record)}
             />
           ))}
         </div>
      </div>
      
      {/* Invoice Modal Overlay */}
      <InvoiceModal 
        record={viewRecord} 
        onClose={() => setViewRecord(null)} 
        onWhatsApp={() => setWhatsAppRecord(viewRecord)}
      />

      {/* WhatsApp Modal Overlay */}
      <WhatsAppModal 
        record={whatsAppRecord} 
        onClose={() => setWhatsAppRecord(null)} 
      />
    </div>
  );
};

const UserAvatar = ({ name }: { name: string }) => (
  <span className="w-4 h-4 rounded-full bg-gray-700 flex items-center justify-center text-[8px] font-bold text-white border border-gray-500 font-sans">
    {name.charAt(0).toUpperCase()}
  </span>
);

const ServiceEventCard: React.FC<{ record: ServiceRecord, isLatest: boolean, onViewInvoice: () => void }> = ({ record, isLatest, onViewInvoice }) => {
  const parts = parseServiceDescription(record.serviceDescription);
  
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 relative group transition hover:border-gray-300">
      {isLatest && (
        <span className="absolute -top-2.5 right-4 bg-primary-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wide">
          Latest
        </span>
      )}
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-xs font-bold text-primary-600 mb-1">{format(new Date(record.dateOfService), 'MMMM dd, yyyy')}</p>
          <div className="flex items-center gap-3 text-sm font-medium text-gray-800">
             <span>Service #{record.serviceCounter}</span>
             <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
             <span className="text-gray-500">{record.kilometerReading} km</span>
          </div>
        </div>
      </div>
      
      <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex flex-col gap-2 mb-4">
         <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest px-1">Work Details</p>
         {parts.length === 0 ? (
           <p className="text-sm text-gray-400 italic px-1">General service & checkup.</p>
         ) : (
           <ul className="space-y-1.5 px-1 max-h-32 overflow-y-auto">
             {parts.map((p: any) => (
                <li key={p.id} className="text-sm text-gray-700 flex justify-between items-center bg-white p-2 border border-gray-100 rounded shadow-sm">
                  <span className="font-medium">{p.partName || 'Service Check'}</span>
                </li>
             ))}
           </ul>
         )}
      </div>
      
      <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
         <div>
           <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Total Cost</p>
           <p className="font-black text-gray-900">{formatCurrency(record.totalCost)}</p>
         </div>
         <button 
           onClick={onViewInvoice}
           className="text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 px-4 py-2 rounded-lg transition shadow-sm active:scale-95"
         >
           View Invoice
         </button>
      </div>
    </div>
  );
};
