import React, { useState } from 'react';
import { Screen, ServiceRecord } from './types';
import { Sidebar } from './components/Navigation';
import { DashboardScreen } from './screens/DashboardScreen';
import { NewServiceScreen } from './screens/NewServiceScreen';
import { SearchScreen } from './screens/SearchScreen';
import { HistoryScreen } from './screens/HistoryScreen';
import { ReportsScreen } from './screens/ReportsScreen';
import { RemindersScreen } from './screens/RemindersScreen';
import { QRSetupScreen } from './screens/QRSetupScreen';
import { CustomerPortal } from './screens/CustomerPortal';
import { RecentlyDeletedScreen } from './screens/RecentlyDeletedScreen';
import { InvoiceModal } from './components/InvoiceModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { GlobalVehicleSearch } from './components/GlobalVehicleSearch';
import { VehicleQuickSummaryModal } from './components/VehicleQuickSummaryModal';
import { Menu, Trash2, CheckCircle2, RotateCcw, ArrowRight, AlertTriangle } from 'lucide-react';
import { DB } from './db';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  const isPortalView = params.get('portal') === 'true';
  const pathname = window.location.pathname;
  const isInvoiceRoute = pathname.startsWith('/invoice/');
  const initialInvoiceId = isInvoiceRoute ? decodeURIComponent(pathname.replace('/invoice/', '').replace(/\/$/, '')) : undefined;

  if (isPortalView || isInvoiceRoute) {
    return <CustomerPortal initialInvoiceId={initialInvoiceId} />;
  }

  const [currentTab, setCurrentTab] = useState<Screen>('dashboard');
  const [viewRecord, setViewRecord] = useState<ServiceRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<ServiceRecord | null>(null);
  const [whatsappRecord, setWhatsappRecord] = useState<ServiceRecord | null>(null);
  const [isReentry, setIsReentry] = useState<boolean>(false);
  const [historyVehicleQuery, setHistoryVehicleQuery] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [summaryVehicleNumber, setSummaryVehicleNumber] = useState<string | null>(null);
  const [isMobileSearchExpanded, setIsMobileSearchExpanded] = useState(false);
  
  // Soft delete confirmation modal state
  const [recordToSoftDelete, setRecordToSoftDelete] = useState<ServiceRecord | null>(null);
  const [isSoftDeleting, setIsSoftDeleting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // App notification toast
  const [appToast, setAppToast] = useState<{ 
    message: string; 
    actionLabel?: string; 
    onAction?: () => void 
  } | null>(null);

  const showAppToast = (
    message: string, 
    actionLabel?: string, 
    onAction?: () => void
  ) => {
    setAppToast({ message, actionLabel, onAction });
    setTimeout(() => {
      setAppToast(null);
    }, 6000);
  };

  const handleEdit = (record: ServiceRecord) => {
    setEditingRecord(record);
    setIsReentry(false);
    setCurrentTab('new-service');
  };

  const handleReentry = (record: ServiceRecord) => {
    setEditingRecord(record);
    setIsReentry(true);
    setCurrentTab('new-service');
  };

  const handleViewHistory = (vehicleNumber: string) => {
    setHistoryVehicleQuery(vehicleNumber);
    setCurrentTab('history');
  };

  const handleDelete = (record: ServiceRecord) => {
    setRecordToSoftDelete(record);
  };

  const handleConfirmSoftDelete = async () => {
    if (!recordToSoftDelete) return;
    setIsSoftDeleting(true);
    const target = recordToSoftDelete;
    try {
      await DB.softDeleteRecord(target.id);
      setRecordToSoftDelete(null);
      setRefreshKey(k => k + 1);
      showAppToast(
        `Invoice ${target.id} moved to Recently Deleted (Restore available for 90 days).`,
        'View Trash',
        () => setCurrentTab('trash')
      );
    } catch (e: any) {
      console.error(e);
      alert(e.message || 'Failed to delete record.');
    } finally {
      setIsSoftDeleting(false);
    }
  };

  const renderScreen = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardScreen 
            key={refreshKey}
            onViewRecord={setViewRecord} 
            onEditRecord={handleEdit} 
            onDeleteRecord={handleDelete} 
            onWhatsApp={setWhatsappRecord} 
            onNavigate={setCurrentTab}
          />
        );
      case 'new-service':
        return <NewServiceScreen 
                 editingRecord={editingRecord} 
                 isReentry={isReentry}
                 onSuccess={() => {
                   setEditingRecord(null);
                   setIsReentry(false);
                   setCurrentTab('search');
                 }} 
                 onViewInvoice={(r) => setViewRecord(r)}
               />;
      case 'search':
        return <SearchScreen 
                 key={refreshKey}
                 onViewRecord={setViewRecord} 
                 onEditRecord={handleEdit} 
                 onDeleteRecord={handleDelete} 
                 onViewHistory={handleViewHistory}
                 onReentry={handleReentry}
                 onWhatsApp={setWhatsappRecord}
               />;
      case 'history':
        return <HistoryScreen 
                 key={refreshKey}
                 initialVehicleNumber={historyVehicleQuery} 
                 onViewRecord={setViewRecord} 
                 onWhatsApp={setWhatsappRecord}
               />;
      case 'reports':
        return <ReportsScreen key={refreshKey} />;
      case 'reminders':
        return <RemindersScreen key={refreshKey} />;
      case 'qr-setup':
        return <QRSetupScreen />;
      case 'trash':
        return (
          <RecentlyDeletedScreen 
            onViewRecord={setViewRecord} 
            onNavigate={setCurrentTab} 
          />
        );
      default:
        return (
          <DashboardScreen 
            key={refreshKey}
            onViewRecord={setViewRecord} 
            onEditRecord={handleEdit} 
            onDeleteRecord={handleDelete} 
            onNavigate={setCurrentTab} 
          />
        );
    }
  };

  return (
    <div className="mobile-container relative bg-gray-50">
      {/* Global App Toast */}
      {appToast && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 bg-gray-900 text-white rounded-xl shadow-xl border border-gray-800 text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
          <span>{appToast.message}</span>
          {appToast.actionLabel && appToast.onAction && (
            <button
              onClick={() => {
                appToast.onAction?.();
                setAppToast(null);
              }}
              className="flex items-center gap-1 ml-2 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition"
            >
              <span>{appToast.actionLabel}</span>
              <ArrowRight size={12} />
            </button>
          )}
        </div>
      )}

      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={(tab) => {
          if(tab !== 'new-service') {
            setEditingRecord(null);
            setIsReentry(false);
          }
          setCurrentTab(tab);
        }} 
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />
      
      <div className="flex-1 md:ml-72 flex flex-col min-h-screen relative w-full overflow-hidden">
        {/* Top mobile header with search */}
        <div className="md:hidden sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-3.5 py-2.5 shadow-xs no-print">
          {!isMobileSearchExpanded && (
            <div className="flex items-center min-w-0 pr-2">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-1 mr-1.5 text-gray-600 hover:text-gray-900 active:bg-gray-100 rounded-lg transition shrink-0"
                aria-label="Open menu"
              >
                <Menu size={22} />
              </button>
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm mr-2 shadow-xs shrink-0">L</div>
              <div className="truncate">
                <h1 className="text-base font-bold text-gray-900 leading-none truncate">Lucky Bike</h1>
              </div>
            </div>
          )}
          <div className={isMobileSearchExpanded ? 'w-full' : 'shrink-0 flex items-center justify-end'}>
            <GlobalVehicleSearch 
              onSelectVehicle={(veh) => setSummaryVehicleNumber(veh)}
              isMobileCompact={true}
              onMobileExpandChange={setIsMobileSearchExpanded}
            />
          </div>
        </div>

        {/* Desktop Top Header with Global Search */}
        <header className="hidden md:flex sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200/90 items-center justify-between px-8 py-2.5 shadow-2xs no-print">
          <div className="w-full max-w-md">
            <GlobalVehicleSearch 
              onSelectVehicle={(veh) => setSummaryVehicleNumber(veh)}
            />
          </div>
          <div className="flex items-center space-x-3 text-xs font-semibold text-gray-500">
            <div className="flex items-center space-x-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100 shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-gray-600 font-medium">Quick Vehicle Search</span>
            </div>
          </div>
        </header>

        {renderScreen()}
      </div>

      {/* Move to Recently Deleted Confirmation Modal */}
      {recordToSoftDelete && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center">
                <Trash2 size={24} strokeWidth={2.5} />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-gray-900 leading-tight">
                  Move to Recently Deleted?
                </h3>
                <p className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  90-Day Restore Policy
                </p>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 my-4 text-xs space-y-2 text-gray-600">
              <div className="font-mono text-xs bg-white px-2.5 py-1.5 rounded-lg border border-gray-200">
                <span className="font-bold text-gray-900">{recordToSoftDelete.id}</span>
                <span className="text-gray-500"> • {recordToSoftDelete.vehicleNumber} ({recordToSoftDelete.customerName})</span>
              </div>
              <p className="leading-relaxed">
                This record will be moved to <strong className="text-gray-800 font-semibold">Recently Deleted</strong>. You can restore it anytime for up to <strong className="text-gray-800 font-semibold">90 days</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                onClick={() => setRecordToSoftDelete(null)}
                disabled={isSoftDeleting}
                className="px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-xl border border-gray-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSoftDelete}
                disabled={isSoftDeleting}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 active:scale-98 rounded-xl shadow-md transition disabled:opacity-50"
              >
                <Trash2 size={14} strokeWidth={2.5} />
                <span>{isSoftDeleting ? 'Moving to Trash...' : 'Move to Trash'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <InvoiceModal 
        record={viewRecord} 
        onClose={() => setViewRecord(null)} 
        onWhatsApp={() => {
          if (viewRecord) {
             setWhatsappRecord(viewRecord);
             setViewRecord(null);
          }
        }}
      />
      <VehicleQuickSummaryModal
        vehicleNumber={summaryVehicleNumber}
        isOpen={!!summaryVehicleNumber}
        onClose={() => setSummaryVehicleNumber(null)}
        onViewHistory={(veh) => {
          setSummaryVehicleNumber(null);
          handleViewHistory(veh);
        }}
        onViewInvoice={(rec) => {
          setSummaryVehicleNumber(null);
          setViewRecord(rec);
        }}
        onCreateNewService={(rec) => {
          setSummaryVehicleNumber(null);
          handleReentry(rec);
        }}
      />
      <WhatsAppModal 
        record={whatsappRecord}
        onClose={() => setWhatsappRecord(null)}
      />
      <PWAInstallPrompt />
    </div>
  );
}
