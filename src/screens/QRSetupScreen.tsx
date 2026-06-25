import React, { useRef, useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, Settings, Store } from 'lucide-react';
import html2pdf from 'html2pdf.js';

export const QRSetupScreen: React.FC = () => {
  const qrRef = useRef<HTMLDivElement>(null);
  const [shopName, setShopName] = useState('Lucky Bike Care');
  const [contactNumber, setContactNumber] = useState('+91 9414377153');
  const [tagline, setTagline] = useState('Scan for your Service History & Invoices');
  
  const [portalUrl, setPortalUrl] = useState('');

  useEffect(() => {
    // Generate the portal URL based on the current domain
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('portal', 'true');
    setPortalUrl(currentUrl.toString());
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!qrRef.current) return;
    const opt = {
      margin: 10,
      filename: `QR_Code_${shopName.replace(/\s+/g, '_')}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    };
    html2pdf().set(opt).from(qrRef.current).save();
  };

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 max-w-6xl mx-auto w-full animate-fade-in">
      <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4 no-print">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">QR Portal Setup</h1>
          <p className="text-sm text-gray-500 mt-1">Generate and print customer self-service QR code</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Customization Settings */}
        <div className="space-y-6 no-print">
          <div className="glass-card p-6 border border-gray-200 rounded-xl bg-white shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Settings size={20} className="text-gray-500" />
              Customize QR Display
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name</label>
                <input 
                  type="text" 
                  value={shopName}
                  onChange={e => setShopName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
                <input 
                  type="text" 
                  value={contactNumber}
                  onChange={e => setContactNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input 
                  type="text" 
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
                />
              </div>
            </div>
            
            <div className="mt-6 flex flex-wrap gap-3">
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition shadow-sm"
              >
                <Printer size={18} /> Print QR Code
              </button>
              <button 
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-300 rounded-lg font-medium transition shadow-sm"
              >
                <Download size={18} /> Download PDF
              </button>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-sm text-blue-800">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Store size={18} />
              How it works
            </h4>
            <ul className="list-disc pl-5 space-y-1.5 opacity-90">
              <li>Print this page and stick it in your shop waiting area.</li>
              <li>Customers can scan the QR code with their mobile phones.</li>
              <li>They enter their Vehicle Number and Mobile Number to login securely.</li>
              <li>They can view their full service history, download past invoices, and see upcoming reminders.</li>
            </ul>
          </div>
        </div>

        {/* QR Preview */}
        <div className="flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-8 print:p-0 print:border-none print:bg-white print:fixed print:inset-0 print:z-[9999] print:flex print:items-center print:justify-center">
          <div 
            ref={qrRef}
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden flex flex-col mx-auto border border-gray-100 print:shadow-none print:border-none"
          >
            {/* Header */}
            <div className="bg-primary-600 p-6 text-center text-white relative">
              <div className="absolute top-0 left-0 w-full h-full opacity-10 overflow-hidden">
                 <div className="absolute -top-10 -right-10 w-40 h-40 bg-white rounded-full mix-blend-overlay"></div>
                 <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white rounded-full mix-blend-overlay"></div>
              </div>
              <div className="relative z-10 w-16 h-16 bg-white rounded-2xl shadow-md flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl font-black text-primary-700">{shopName.charAt(0)}</span>
              </div>
              <h2 className="text-2xl font-bold relative z-10">{shopName}</h2>
              <p className="text-primary-100 font-medium tracking-wide text-sm relative z-10 mt-1">{contactNumber}</p>
            </div>

            {/* Body */}
            <div className="p-8 pb-10 flex flex-col items-center justify-center bg-white">
              <p className="text-[15px] font-semibold text-gray-800 text-center mb-6 leading-relaxed max-w-[250px]">
                {tagline}
              </p>
              
              <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 inline-block">
                 {portalUrl && (
                  <QRCodeSVG 
                    value={portalUrl} 
                    size={200}
                    level="H"
                    includeMargin={false}
                    fgColor="#111827"
                  />
                 )}
              </div>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 tracking-widest uppercase">
                <span>Scan for Portal</span>
              </div>
            </div>
            
            {/* Footer */}
            <div className="bg-gray-50 py-3 text-center border-t border-gray-100">
               <p className="text-[10px] text-gray-400 font-medium">100% Secure • Powered by Lucky Bike Care</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
