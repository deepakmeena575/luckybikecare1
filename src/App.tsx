import React, { useState } from 'react';
import { Screen, ServiceRecord } from './types';
import { Sidebar } from './components/Navigation';
import { DashboardScreen } from './screens/DashboardScreen';
import { NewServiceScreen } from './screens/NewServiceScreen';
import { SearchScreen } from './screens/SearchScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { InvoiceModal } from './components/InvoiceModal';
import { Menu } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<Screen>('dashboard');
  const [viewRecord, setViewRecord] = useState<ServiceRecord | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const renderScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'new-service':
        return <NewServiceScreen onSuccess={() => setCurrentTab('search')} />;
      case 'search':
        return <SearchScreen onViewRecord={setViewRecord} />;
      case 'history':
        return <HistoryScreen />;
      case 'reports':
        return <ReportsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="mobile-container relative bg-gray-50">
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen relative w-full overflow-hidden">
        {/* Top mobile header */}
        <div className="md:hidden sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-4 py-3 shadow-sm no-print">
          <div className="flex items-center">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 mr-2 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-lg transition"
              aria-label="Open menu"
            >
              <Menu size={24} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold mr-3 shadow-md">L</div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">Lucky Bike</h1>
            </div>
          </div>
        </div>

        {renderScreen()}
      </div>

      <InvoiceModal record={viewRecord} onClose={() => setViewRecord(null)} />
    </div>
  );
}
