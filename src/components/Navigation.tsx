import React from 'react';
import { Home, PlusCircle, Search, Clock, FileBarChart2, Phone, X, User, QrCode } from 'lucide-react';
import { Screen } from '../types';
import { cn } from '../utils';

interface NavProps {
  currentTab: Screen;
  setCurrentTab: (tab: Screen) => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<NavProps> = ({ currentTab, setCurrentTab, isOpen, onClose }) => {
  const tabs = [
    { id: 'dashboard' as Screen, label: 'Dashboard', icon: Home },
    { id: 'new-service' as Screen, label: 'New Service', icon: PlusCircle },
    { id: 'search' as Screen, label: 'Search', icon: Search },
    { id: 'history' as Screen, label: 'Vehicle History', icon: Clock },
    { id: 'reports' as Screen, label: 'Reports & Analytics', icon: FileBarChart2 },
    { id: 'qr-setup' as Screen, label: 'QR Portal Setup', icon: QrCode },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && onClose && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl md:shadow-[4px_0_24px_rgba(0,0,0,0.02)] md:border-r border-gray-200 flex flex-col p-4 transition-transform duration-300 ease-in-out md:translate-x-0 no-print",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between px-2 pb-6 pt-2 mb-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-md">L</div>
            <div>
              <h2 className="text-lg font-extrabold text-gray-900 leading-tight">Lucky Bike</h2>
              <p className="text-[10px] font-bold tracking-widest text-primary-600 uppercase mt-0.5">Care Center</p>
            </div>
          </div>
          {onClose && (
            <button 
              onClick={onClose} 
              className="md:hidden p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="space-y-1.5 flex-1 mt-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setCurrentTab(tab.id);
                  if (onClose) onClose();
                }}
                className={cn(
                  "flex items-center w-full px-4 py-3.5 rounded-xl transition-all duration-200 text-sm font-semibold space-x-3",
                  isActive 
                    ? "bg-primary-50 text-primary-700 shadow-sm border border-primary-100" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <Icon size={20} className={isActive ? "text-primary-600" : "text-gray-400"} strokeWidth={isActive ? 2.5 : 2} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto pt-4">
          <div className="bg-gradient-to-b from-gray-50 to-gray-100/50 p-4 rounded-2xl border border-gray-200 text-sm md:text-center text-left shadow-sm">
            <p className="font-bold text-gray-900 mb-1.5 flex items-center md:justify-center">
              <User size={14} className="mr-1.5 text-gray-500" strokeWidth={2.5}/> 
              Rakesh Choursiya
            </p>
            <p className="flex items-center md:justify-center font-bold text-primary-600">
              <Phone size={14} className="mr-1.5" strokeWidth={2.5} /> 
              +91 9414377153
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
