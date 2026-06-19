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
import { DB } from './db';

export default function App() {
  const [currentTab, setCurrentTab] = useState<Screen>('dashboard');
  const [viewRecord, setViewRecord] = useState<ServiceRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const [historyVehicleQuery, setHistoryVehicleQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleEdit = (record: ServiceRecord) => {
    setEditingRecord(record);
    setCurrentTab('new-service');
  };

  const handleViewHistory = (vehicleNumber: string) => {
    setHistoryVehicleQuery(vehicleNumber);
    setCurrentTab('history');
  };

  const handleDelete = async (record: ServiceRecord) => {
    if (window.confirm(`Are you sure you want to delete invoice ${record.id}?`)) {
      try {
        await DB.deleteRecord(record.id);
        alert('Record deleted successfully.');
        // Hack to refresh current view if needed
        const prev = currentTab;
        setCurrentTab('reports'); // force re-render
        setTimeout(() => setCurrentTab(prev), 10);
      } catch(e) {
        alert('Failed to delete record.');
      }
    }
  };

  const renderScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return <DashboardScreen onViewRecord={setViewRecord} onEditRecord={handleEdit} onDeleteRecord={handleDelete} />;
      case 'new-service':
        return <NewServiceScreen 
                 editingRecord={editingRecord} 
                 onSuccess={() => {
                   setEditingRecord(null);
                   setCurrentTab('search');
                 }} 
                 onViewInvoice={(r) => setViewRecord(r)}
               />;
      case 'search':
        return <SearchScreen onViewRecord={setViewRecord} onEditRecord={handleEdit} onDeleteRecord={handleDelete} onViewHistory={handleViewHistory}/>;
      case 'history':
        return <HistoryScreen initialVehicleNumber={historyVehicleQuery} onViewRecord={setViewRecord} />;
      case 'reports':
        return <ReportsScreen />;
      default:
        return <DashboardScreen onViewRecord={setViewRecord} onEditRecord={handleEdit} onDeleteRecord={handleDelete} />;
    }
  };

  return (
    <div className="mobile-container relative bg-gray-50">
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          if(tab !== 'new-service') setEditingRecord(null);
          setCurrentTab(tab);
        }} 
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
