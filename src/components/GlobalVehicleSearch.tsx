import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2, Calendar, Clock, User, ChevronRight } from 'lucide-react';
import { DB } from '../db';
import { VehicleQuickSearchResult, ServiceRecord } from '../types';
import { format } from 'date-fns';

interface GlobalVehicleSearchProps {
  onSelectVehicle: (vehicleNumber: string, latestRecord: ServiceRecord) => void;
  className?: string;
  isMobileCompact?: boolean;
  onMobileExpandChange?: (expanded: boolean) => void;
}

export const GlobalVehicleSearch: React.FC<GlobalVehicleSearchProps> = ({
  onSelectVehicle,
  className = '',
  isMobileCompact = false,
  onMobileExpandChange,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<VehicleQuickSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const handleMobileExpand = (expanded: boolean) => {
    setIsMobileExpanded(expanded);
    onMobileExpandChange?.(expanded);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search effect
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    setHighlightedIndex(-1);

    const timer = setTimeout(async () => {
      try {
        const data = await DB.globalVehicleQuickSearch(trimmed);
        setResults(data);
      } catch (err) {
        console.error('Quick search error:', err);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        if (isMobileCompact) {
          handleMobileExpand(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileCompact]);

  // Global keyboard shortcut (Ctrl+K or Cmd+K or /)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle keyboard navigation in dropdown
  const handleKeyDownInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || results.length === 0) {
      if (e.key === 'ArrowDown' && query.trim().length >= 2) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        handleSelectItem(results[highlightedIndex]);
      } else if (results.length > 0) {
        handleSelectItem(results[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelectItem = (item: VehicleQuickSearchResult) => {
    onSelectVehicle(item.vehicleNumber, item.latestRecord);
    setIsOpen(false);
    setQuery('');
    if (isMobileCompact) {
      handleMobileExpand(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Mobile Icon Button when collapsed */}
      {isMobileCompact && !isMobileExpanded && (
        <button
          onClick={() => {
            handleMobileExpand(true);
            setTimeout(() => inputRef.current?.focus(), 50);
          }}
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition flex items-center gap-1.5 text-xs font-semibold"
          aria-label="Open search vehicle"
        >
          <Search size={18} className="text-gray-500" />
          <span className="hidden xs:inline text-gray-500">Search</span>
        </button>
      )}

      {/* Input container */}
      {(!isMobileCompact || isMobileExpanded) && (
        <div className={`relative flex items-center ${isMobileExpanded ? 'w-full' : ''}`}>
          <div className="absolute left-3 pointer-events-none text-gray-400">
            {isLoading ? (
              <Loader2 size={16} className="animate-spin text-primary-500" />
            ) : (
              <Search size={16} />
            )}
          </div>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => {
              if (query.trim().length >= 2) setIsOpen(true);
            }}
            onKeyDown={handleKeyDownInput}
            placeholder="Search vehicle..."
            className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm bg-gray-100/90 hover:bg-gray-100 focus:bg-white text-gray-900 placeholder:text-gray-400 rounded-xl border border-gray-200/80 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all outline-hidden shadow-2xs"
            autoComplete="off"
            spellCheck="false"
          />

          <div className="absolute right-2.5 flex items-center space-x-1">
            {query && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-md transition"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}

            {isMobileExpanded ? (
              <button
                type="button"
                onClick={() => handleMobileExpand(false)}
                className="text-[11px] font-bold text-gray-500 hover:text-gray-800 px-1.5 py-0.5"
              >
                Cancel
              </button>
            ) : (
              <kbd className="hidden md:inline-flex items-center text-[10px] font-medium text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200 shadow-2xs pointer-events-none">
                ⌘K
              </kbd>
            )}
          </div>
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && query.trim().length >= 2 && (
        <div className="fixed sm:absolute left-3 right-3 sm:left-0 sm:right-0 top-14 sm:top-full mt-1.5 bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-[72vh] sm:max-h-96 flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3.5 py-2 bg-gray-50/90 border-b border-gray-100 text-[11px] font-bold uppercase tracking-wider text-gray-500 flex justify-between items-center">
            <span>Vehicles</span>
            {results.length > 0 && <span>{results.length} found</span>}
          </div>

          <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
            {isLoading && results.length === 0 ? (
              <div className="py-8 text-center text-gray-500 flex flex-col items-center justify-center space-y-2">
                <Loader2 size={20} className="animate-spin text-primary-500" />
                <p className="text-xs">Searching records...</p>
              </div>
            ) : results.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <p className="text-sm font-semibold text-gray-800">No vehicle found</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                  Try searching by vehicle registration, customer name, or 10-digit mobile number.
                </p>
              </div>
            ) : (
              results.map((item, index) => {
                const isHighlighted = index === highlightedIndex;
                let formattedLastDate = '—';
                let formattedNextDate = '—';
                try {
                  if (item.lastServiceDate) {
                    formattedLastDate = format(new Date(item.lastServiceDate), 'dd MMM yyyy');
                  }
                  if (item.nextServiceDate) {
                    formattedNextDate = format(new Date(item.nextServiceDate), 'dd MMM yyyy');
                  }
                } catch {
                  // fallback
                }

                return (
                  <button
                    key={`${item.vehicleNumber}-${index}`}
                    type="button"
                    onClick={() => handleSelectItem(item)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full text-left px-3.5 py-3 transition-colors flex items-center justify-between group ${
                      isHighlighted ? 'bg-primary-50/70' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0 pr-2">
                      {/* Vehicle Number Title */}
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-extrabold text-sm text-gray-900 tracking-wide group-hover:text-primary-600 transition-colors">
                          {item.vehicleNumber}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs font-medium text-gray-600 truncate">
                          {item.vehicleModel}
                        </span>
                      </div>

                      {/* Customer Name */}
                      <div className="flex items-center space-x-1.5 text-xs text-gray-600">
                        <span className="text-gray-400 font-medium">Customer:</span>
                        <span className="font-semibold text-gray-800 truncate">{item.customerName}</span>
                        {item.mobileNumber && (
                          <span className="text-gray-400 text-[11px]">({item.mobileNumber})</span>
                        )}
                      </div>

                      {/* Last & Next Service Dates */}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-gray-500 pt-0.5">
                        <span className="inline-flex items-center gap-1">
                          <span className="text-gray-400">Last Service:</span>
                          <span className="font-medium text-gray-700">{formattedLastDate}</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <span className="text-gray-400">Next Service:</span>
                          <span className="font-semibold text-primary-600">{formattedNextDate}</span>
                        </span>
                      </div>
                    </div>

                    <ChevronRight 
                      size={16} 
                      className={`text-gray-300 transition-transform ${
                        isHighlighted ? 'text-primary-500 translate-x-0.5' : 'group-hover:text-gray-400'
                      }`} 
                    />
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
