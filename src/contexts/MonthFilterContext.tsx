import React, { createContext, useState, useContext, ReactNode, useMemo } from 'react';

interface MonthFilterContextType {
  selectedMonth: string;
  setSelectedMonth: (month: string) => void;
  monthOptions: { value: string; label: string }[];
}

const MonthFilterContext = createContext<MonthFilterContextType | undefined>(undefined);

export const MonthFilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Inicializar com o mês atual
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const currentDate = new Date();
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  });

  // Gerar lista de meses para o seletor
  const monthOptions = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    // Gerar os últimos 12 meses
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const value = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const label = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(date);
      months.push({ value, label });
    }
    
    return months;
  }, []);

  return (
    <MonthFilterContext.Provider value={{ 
      selectedMonth, 
      setSelectedMonth, 
      monthOptions 
    }}>
      {children}
    </MonthFilterContext.Provider>
  );
};

export const useMonthFilter = () => {
  const context = useContext(MonthFilterContext);
  if (context === undefined) {
    throw new Error('useMonthFilter must be used within a MonthFilterProvider');
  }
  return context;
};
