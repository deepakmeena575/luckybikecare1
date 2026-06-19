import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({ isOpen, onClose, title, children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (isOpen) setMounted(true);
    else setTimeout(() => setMounted(false), 300); // Wait for exit animation
  }, [isOpen]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 no-print">
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      
      {/* Sheet / Modal Content */}
      <div 
        className={cn(
          "w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl transform transition-transform duration-300 z-10 max-h-[90vh] flex flex-col",
          isOpen ? "translate-y-0" : "translate-y-full sm:translate-y-8 sm:scale-95 sm:opacity-0"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-4 overflow-y-auto overflow-x-hidden hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
