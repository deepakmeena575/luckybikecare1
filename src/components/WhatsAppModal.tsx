import React, { useState } from 'react';
import { ServiceRecord } from '../types';
import { X, MessageCircle, Send, FileText, CalendarClock, CreditCard, CheckCircle2, Heart } from 'lucide-react';
import { WhatsAppTemplate, generateWhatsAppText } from '../whatsappTemplates';

interface WhatsAppModalProps {
  record: ServiceRecord | null;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({ record, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate>('invoice');
  const [customShopName, setCustomShopName] = useState('Lucky Bike Care');
  
  if (!record) return null;

  const currentText = generateWhatsAppText(record, selectedTemplate, customShopName);

  const handleSend = () => {
    const encodedText = encodeURIComponent(currentText);
    const m = record.mobileNumber.replace(/\D/g, '');
    // WhatsApp automatically opens App on mobile, Web on desktop
    const whatsappUrl = `https://wa.me/91${m}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
    onClose();
  };

  const templates: { id: WhatsAppTemplate; label: string; icon: React.ReactNode }[] = [
    { id: 'invoice', label: 'Send Invoice', icon: <FileText size={16} /> },
    { id: 'payment_due', label: 'Payment Reminder', icon: <CreditCard size={16} /> },
    { id: 'ready', label: 'Vehicle Ready', icon: <CheckCircle2 size={16} /> },
    { id: 'reminder', label: 'Next Service Reminder', icon: <CalendarClock size={16} /> },
    { id: 'thank_you', label: 'Thank You Message', icon: <Heart size={16} /> },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative z-10 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2 text-green-600">
            <MessageCircle size={24} className="fill-green-100" />
            <h2 className="text-xl font-bold text-gray-900">Send via WhatsApp</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 md:flex gap-6">
           <div className="md:w-1/3 mb-6 md:mb-0 space-y-2">
             <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Select Template</h3>
             {templates.map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium transition ${
                    selectedTemplate === tpl.id 
                      ? 'border-green-600 bg-green-50 text-green-700' 
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <span className={selectedTemplate === tpl.id ? 'text-green-600' : 'text-gray-400'}>
                    {tpl.icon}
                  </span>
                  {tpl.label}
                </button>
             ))}

             <div className="mt-6 pt-6 border-t border-gray-100">
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Customize Shop Name</label>
                <input 
                  type="text" 
                  value={customShopName}
                  onChange={(e) => setCustomShopName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500"
                />
             </div>
           </div>
           
           <div className="md:w-2/3 flex flex-col">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Message Preview</h3>
              <div className="flex-1 bg-[url('https://cdn.pixabay.com/photo/2021/05/22/10/41/whatsapp-6275841_960_720.png')] bg-cover relative rounded-xl border border-gray-200 overflow-hidden flex flex-col">
                 <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-0"></div>
                 
                 <div className="relative z-10 flex flex-col h-full bg-[#EFEAE2]">
                   {/* WhatsApp Header Mock */}
                   <div className="bg-[#00A884] py-3 px-4 flex justify-between items-center text-white shadow-sm">
                      <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold uppercase">
                           {record.customerName.charAt(0)}
                         </div>
                         <div>
                            <p className="font-semibold text-sm leading-none mb-1">{record.customerName}</p>
                            <p className="text-[10px] text-white/80 leading-none">{record.mobileNumber}</p>
                         </div>
                      </div>
                   </div>
                   
                   <div className="p-4 flex-1 overflow-y-auto">
                     <div className="bg-white rounded-xl rounded-tl-none p-3 shadow-sm max-w-[85%] float-left text-[14px] text-gray-800 whitespace-pre-wrap font-sans">
                        {currentText}
                        <div className="text-[10px] text-gray-400 text-right mt-1 font-medium select-none">
                          12:00 PM
                        </div>
                     </div>
                   </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
           <div className="text-sm text-gray-500 bg-blue-50 border border-blue-100 p-3 rounded-lg text-blue-800 w-full sm:w-auto flex-1">
             <p className="font-medium flex items-center gap-2">
               <span className="text-xl">ℹ️</span> Note on PDFs
             </p>
             <p className="mt-1 text-xs opacity-90">
               WhatsApp doesn't allow automatic file attachments. Please download the Invoice PDF first using the 'View/Print' button, then attach it manually in the chat.
             </p>
           </div>
           <button
             onClick={handleSend}
             className="flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white font-semibold rounded-xl shadow-md transition-colors active:scale-95 w-full sm:w-auto whitespace-nowrap"
           >
             <Send size={18} />
             Open WhatsApp
           </button>
        </div>
      </div>
    </div>
  );
};
