import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Smartphone, X, Share, PlusSquare, ArrowDownToLine } from 'lucide-react';

export const PWAInstallPrompt: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, isDismissed, install, dismiss } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  // If already installed, or user dismissed the prompt, do not display
  if (isInstalled || isDismissed) {
    return null;
  }

  // If browser does not support installation and is not iOS, do NOT show
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {/* Small professional install banner using existing design system */}
      <div 
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-40 bg-white border border-gray-200/90 shadow-xl rounded-2xl p-4 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 no-print"
        role="dialog"
        aria-label="Install Lucky Bike Care"
      >
        <div className="flex items-start gap-3">
          {/* Brand Icon Badge */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-md shrink-0">
            L
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-sm font-bold text-gray-900 leading-snug truncate">
                Install Lucky Bike Care
              </h3>
              <button
                onClick={dismiss}
                className="text-gray-400 hover:text-gray-600 p-1 -mr-1 -mt-1 rounded-lg hover:bg-gray-100 transition"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>
            
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Get quick access to your garage management system from your home screen.
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={handleInstallClick}
                className="flex-1 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-xs font-bold py-2 px-3 rounded-xl shadow-sm hover:shadow transition flex items-center justify-center gap-1.5 active:scale-[0.98]"
              >
                <ArrowDownToLine size={14} />
                <span>Install</span>
              </button>
              <button
                onClick={dismiss}
                className="px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition"
              >
                Not Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* iOS Safari Guided Instructions Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-4 no-print">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                  L
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Install on iPhone / iPad</h4>
                  <p className="text-[11px] text-gray-500">Add to Home Screen</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs text-gray-600 leading-relaxed">
              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <Share size={16} />
                </div>
                <div>
                  <strong className="text-gray-900 block font-semibold">1. Tap Share</strong>
                  <span>Tap the Share icon at the bottom of the Safari toolbar.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-xl bg-gray-50 border border-gray-100">
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg shrink-0">
                  <PlusSquare size={16} />
                </div>
                <div>
                  <strong className="text-gray-900 block font-semibold">2. Add to Home Screen</strong>
                  <span>Scroll down the action sheet and tap <strong>Add to Home Screen</strong>.</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowIOSModal(false);
                dismiss();
              }}
              className="mt-5 w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
