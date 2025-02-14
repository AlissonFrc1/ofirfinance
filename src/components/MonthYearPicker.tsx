import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface MonthYearPickerProps {
  selectedMonth: number;
  selectedYear: number;
  onChange: (month: number, year: number) => void;
  multipleMonths?: boolean;
  selectedMonths?: number[];
  onMonthChange?: (month: number) => void;
  onYearChange?: (year: number) => void;
  className?: string;
}

export function MonthYearPicker({
  selectedMonth,
  selectedYear,
  onChange,
  multipleMonths = false,
  selectedMonths = [],
  onMonthChange,
  onYearChange,
  className = ''
}: MonthYearPickerProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedMonth);
  const [currentYear, setCurrentYear] = useState(selectedYear);

  const handlePreviousMonth = () => {
    const newDate = new Date(currentYear, currentMonth - 1);
    const newMonth = newDate.getMonth();
    const newYear = newDate.getFullYear();
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    onChange(newMonth, newYear);
    
    onMonthChange?.(newMonth);
    onYearChange?.(newYear);
  };

  const handleNextMonth = () => {
    const newDate = new Date(currentYear, currentMonth + 1);
    const newMonth = newDate.getMonth();
    const newYear = newDate.getFullYear();
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
    
    onChange(newMonth, newYear);
    
    onMonthChange?.(newMonth);
    onYearChange?.(newYear);
  };

  const monthName = new Date(currentYear, currentMonth).toLocaleString('pt-BR', {
    month: 'long'
  });

  return (
    <div className={`inline-flex items-center gap-1 bg-primary rounded-lg px-2 py-1 relative md:static z-0 text-xs md:text-sm ${className}`}>
      <button
        onClick={handlePreviousMonth}
        className="p-0.5 md:p-1 text-white hover:opacity-80 transition-opacity"
      >
        <ChevronLeftIcon className="w-3 h-3 md:w-4 md:h-4" />
      </button>

      <div className="flex items-center gap-1">
        <span className="text-white capitalize">
          {monthName}
        </span>
        <span className="text-white">
          {currentYear}
        </span>
      </div>

      <button
        onClick={handleNextMonth}
        className="p-0.5 md:p-1 text-white hover:opacity-80 transition-opacity"
      >
        <ChevronRightIcon className="w-3 h-3 md:w-4 md:h-4" />
      </button>
    </div>
  );
} 