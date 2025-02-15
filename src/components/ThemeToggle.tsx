'use client';

import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Placeholder para evitar layout shift
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-card-bg transition-all duration-200 active:scale-95"
      title={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
      aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
    >
      {isDarkMode ? (
        <SunIcon className="w-5 h-5 text-text-secondary" />
      ) : (
        <MoonIcon className="w-5 h-5 text-text-secondary" />
      )}
    </button>
  );
} 