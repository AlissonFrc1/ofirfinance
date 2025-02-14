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
    <div className={`inline-flex items-center gap-2 bg-primary rounded-lg px-3 py-1 z-[9999] ${className}`}>
      <button
        onClick={handlePreviousMonth}
        className="p-1 text-white hover:opacity-80 transition-opacity"
      >
        <ChevronLeftIcon className="w-4 h-4" />
      </button>

      <div className="flex items-center gap-1">
        <span className="text-white capitalize text-sm">
          {monthName}
        </span>
        <span className="text-white ml-1 text-sm">
          {currentYear}
        </span>
      </div>

      <button
        onClick={handleNextMonth}
        className="p-1 text-white hover:opacity-80 transition-opacity"
      >
        <ChevronRightIcon className="w-4 h-4" />
      </button>
    </div>
  );
} 