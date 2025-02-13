import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend 
} from 'chart.js';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

ChartJS.register(ArcElement, Tooltip, Legend);

const categoryIcons = {
  'Alimentação': '',
  'Transporte': '',
  'Moradia': '',
  'Educação': '',
  'Lazer': '',
  'Saúde': '',
  'Outros': ''
};

interface Expense {
  id: string;
  value: number;
  date: string;
  category: string;
  subcategory: string;
  description?: string;
  installments?: number;
  fixed: boolean;
  recurring: boolean;
  currentInstallment?: number;
  dueDate?: string;
  endRecurrenceDate?: string;
}

interface Card {
  id: string;
  name: string;
  brand: string;
  lastDigits: string;
  color: string;
  closingDay: number;
  expenses?: Expense[];
}

interface ExpensePieChartProps {
  cards: Card[];
  currentMonth: number;
  currentYear: number;
}

const CardFilter = ({ 
  cards, 
  selectedCardIds, 
  onSelectionChange 
}: { 
  cards: Card[], 
  selectedCardIds: string[], 
  onSelectionChange: (ids: string[]) => void 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Renderiza texto de seleção com tooltip para nomes longos
  const renderSelectedText = () => {
    if (selectedCardIds.length === cards.length) return "Todos os Cartões";
    
    const selectedCards = cards.filter(card => selectedCardIds.includes(card.id));
    return selectedCards.map(card => 
      `${card.brand} ${card.name} - Final(${card.lastDigits})`
    ).join(", ");
  };

  return (
    <div 
      ref={dropdownRef} 
      className="relative w-full max-w-xs"
    >
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center justify-between 
          bg-white border border-gray-300 
          rounded-lg px-3 py-2 
          cursor-pointer hover:bg-gray-50
          text-[0.75rem] text-gray-700
          transition-all duration-200
          shadow-sm hover:shadow-md
          active:scale-[0.98]
        "
      >
        <span 
          className="truncate max-w-[150px]"
          title={renderSelectedText()}
        >
          {renderSelectedText()}
        </span>
        <ChevronDownIcon 
          className={`
            w-4 h-4 ml-2 
            transform transition-transform 
            ${isOpen ? 'rotate-180' : ''}
          `}
        />
      </div>

      {isOpen && (
        <div 
          className="
            absolute z-50 mt-1 w-full 
            bg-white border border-gray-300 
            rounded-lg shadow-lg max-h-60 
            overflow-y-auto
            scrollbar-thin scrollbar-track-gray-100 
            scrollbar-thumb-gray-300
            animate-fade-in-down
          "
        >
          <div className="divide-y divide-gray-200">
            {/* Opção de Selecionar Todos */}
            <div 
              onClick={() => 
                onSelectionChange(
                  selectedCardIds.length === cards.length 
                    ? [] 
                    : cards.map(card => card.id)
                )
              }
              className="
                flex items-center justify-between
                px-4 py-2.5 
                hover:bg-[#FFF7E6] 
                cursor-pointer
                transition-colors
                group
                active:scale-[0.98]
                relative
              "
            >
              <span className="
                text-[0.75rem] 
                text-gray-700 
                group-hover:text-[#D4A017] 
                transition-colors
              ">
                Todos os Cartões
              </span>
              {selectedCardIds.length === cards.length && (
                <CheckIcon 
                  className="
                    w-4 h-4 
                    text-[#D4A017] 
                    absolute 
                    right-4 
                    top-1/2 
                    transform -translate-y-1/2
                  "
                />
              )}
            </div>

            {/* Lista de Cartões Individuais */}
            {cards.map(card => (
              <div 
                key={card.id}
                onClick={() => {
                  const newSelection = selectedCardIds.includes(card.id)
                    ? selectedCardIds.filter(id => id !== card.id)
                    : [...selectedCardIds, card.id];
                  onSelectionChange(newSelection);
                }}
                className={`
                  flex items-center justify-between
                  px-4 py-2.5 
                  cursor-pointer
                  transition-colors
                  group
                  active:scale-[0.98]
                  relative
                  ${selectedCardIds.includes(card.id) 
                    ? 'bg-[#FFF7E6] hover:bg-[#FFF2D1]' 
                    : 'hover:bg-gray-100'}
                `}
              >
                <div 
                  className="flex items-center text-[0.65rem]"
                >
                  <div 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: card.color }}
                  />
                  {card.brand} {card.name} - Final {card.lastDigits}
                </div>
                {selectedCardIds.includes(card.id) && (
                  <CheckIcon 
                    className="
                      w-4 h-4 
                      text-[#D4A017] 
                      absolute 
                      right-4 
                      top-1/2 
                      transform -translate-y-1/2
                    "
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export const ExpensePieChart = ({ cards, currentMonth, currentYear }: ExpensePieChartProps) => {
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>(
    cards.map(card => card.id)  // Todos selecionados por padrão
  );

  // Lógica de cálculo de despesas
  const calculateExpenses = () => {
    const filteredExpenses = cards
      .filter(card => selectedCardIds.includes(card.id))
      .flatMap(card => {
        const currentClosingDate = new Date(currentYear, currentMonth, card.closingDay);
        const lastClosingDate = new Date(currentYear, currentMonth - 1, card.closingDay);
        
        return (card.expenses || []).filter(expense => {
          const expenseDate = new Date(expense.dueDate || expense.date);
          
          // Para despesas fixas, verificar data futura
          if (expense.fixed && !expense.endRecurrenceDate) {
            if (expenseDate > currentClosingDate) return false;
          }
          
          // Verificar se está no período da fatura
          return expenseDate > lastClosingDate && expenseDate <= currentClosingDate;
        });
      });

    interface CategoryTotals {
      [key: string]: number;
    }

    const categoryTotals: CategoryTotals = filteredExpenses.reduce((acc, expense) => {
      const category = expense.category || 'Outros';
      let value = Number(expense.value);
      
      // Calcular valor da parcela se aplicável
      if (expense.installments && expense.installments > 1) {
        value = value / expense.installments;
      }
      
      acc[category] = (acc[category] || 0) + value;
      return acc;
    }, {} as CategoryTotals);

    const sortedCategories = Object.entries(categoryTotals)
      .filter(([_, value]) => value > 0)
      .sort(([_, a], [__, b]) => b - a);

    const totalExpense = sortedCategories.reduce((sum, [_, value]) => sum + value, 0);

    return {
      categories: sortedCategories.map(([category]) => category),
      values: sortedCategories.map(([_, value]) => value),
      percentages: sortedCategories.map(([_, value]) => 
        ((value / totalExpense) * 100).toFixed(1)
      ),
      total: totalExpense
    };
  };

  const expenseData = calculateExpenses();

  const chartData = {
    labels: expenseData.categories,
    datasets: [{
      data: expenseData.values,
      backgroundColor: [
        '#2563EB', '#10B981', '#F43F5E', 
        '#8B5CF6', '#F59E0B', '#6366F1', 
        '#EC4899'
      ],
      borderWidth: 0
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        titleFont: { size: 12 },
        bodyFont: { size: 12 }
      }
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800">Distribuição de Despesas</h2>
        <CardFilter 
          cards={cards} 
          selectedCardIds={selectedCardIds}
          onSelectionChange={setSelectedCardIds}
        />
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 md:col-span-8 flex items-center justify-center order-1 md:order-2 relative h-48">
          <div 
            className="absolute z-0 flex flex-col items-center justify-center w-full h-full pointer-events-none opacity-100 hover:opacity-0 transition-opacity duration-200"
            style={{ pointerEvents: 'none' }}
          >
            <div className="text-center">
              <div className="text-sm font-bold text-red-600">
                {formatCurrency(expenseData.total)}
              </div>
            </div>
          </div>
          <div className="relative z-10 w-48 h-48">
            <Doughnut 
              data={chartData} 
              options={{
                ...chartOptions,
                cutout: '75%',
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    ...chartOptions.plugins.tooltip,
                    position: 'nearest',
                    callbacks: {
                      label: (context) => {
                        const value = context.parsed;
                        const total = context.dataset.data.reduce((a, b) => a + b, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return [
                          `Valor: ${formatCurrency(value)}`,
                          `Percentual: ${percentage}%`
                        ];
                      }
                    }
                  }
                }
              }} 
            />
          </div>
        </div>
        <div className="col-span-12 md:col-span-4 space-y-2 order-2 md:order-1">
          {expenseData.categories.map((category, index) => (
            <div 
              key={category}
              className="flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ 
                    backgroundColor: chartData.datasets[0].backgroundColor[index] 
                  }}
                />
                <span className="text-[0.75rem] text-gray-700">
                  {category}
                </span>
              </div>
              <span className="text-[0.75rem] font-semibold text-gray-800">
                {formatCurrency(expenseData.values[index])}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
