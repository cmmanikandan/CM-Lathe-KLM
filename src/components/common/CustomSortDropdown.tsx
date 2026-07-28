import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, ChevronDown, Check } from 'lucide-react';

export interface SortOptionItem {
  id: string;
  label: string;
}

interface CustomSortDropdownProps {
  options?: SortOptionItem[];
  selectedId: string;
  onSelect: (id: string) => void;
}

const DEFAULT_SORT_OPTIONS: SortOptionItem[] = [
  { id: 'default', label: 'Recommended' },
  { id: 'newest', label: 'Newest Arrivals' },
  { id: 'price-low', label: 'Price: Low → High' },
  { id: 'price-high', label: 'Price: High → Low' },
  { id: 'best-selling', label: 'Best Selling' },
  { id: 'rating', label: 'Highest Rated' }
];

export const CustomSortDropdown: React.FC<CustomSortDropdownProps> = ({
  options = DEFAULT_SORT_OPTIONS,
  selectedId,
  onSelect
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => o.id === selectedId) || options[0];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative inline-block text-left select-none z-30">
      
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white hover:bg-gray-50 text-[#111111] font-heading font-extrabold text-xs px-3.5 py-2.5 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-2 transition-all active:scale-95 shrink-0"
      >
        <ArrowUpDown size={14} className="text-[#F97316]" />
        <span className="line-clamp-1">{selectedOption.label}</span>
        <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Animated Dropdown Menu Card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.96 }}
            animate={{ opacity: 1, y: 4, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="absolute right-0 mt-1 w-52 bg-white/95 backdrop-blur-2xl rounded-2xl border border-gray-200 shadow-2xl p-1.5 space-y-0.5 overflow-hidden z-50"
          >
            {options.map((opt) => {
              const isSelected = opt.id === selectedId;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSelect(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-heading font-extrabold flex items-center justify-between transition-colors ${
                    isSelected
                      ? 'bg-orange-50 text-[#F97316]'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-[#111111]'
                  }`}
                >
                  <span>{opt.label}</span>
                  {isSelected && <Check size={14} className="text-[#F97316]" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
