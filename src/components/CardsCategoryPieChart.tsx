import React, { useMemo, useState } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  ArcElement, 
  Tooltip, 
  Legend, 
  ChartOptions 
} from 'chart.js';
import { useMonthFilter } from '@/contexts/MonthFilterContext';

ChartJS.register(
  ArcElement, 
  Tooltip, 
  Legend
);

interface CardExpense {
  id: string;
  value: number;
  date: string;
  category: string;
  subcategory: string;
  description?: string;
  fixed: boolean;
  recurring: boolean;
  dueDate?: string;
  endRecurrenceDate?: string;
  installments?: number;
}

interface CreditCard {
  id: string;
  name: string;
  lastDigits: string;
  expenses?: CardExpense[];
}

interface CardsCategoryPieChartProps {
  cards: CreditCard[];
}

export const CardsCategoryPieChart: React.FC<CardsCategoryPieChartProps> = ({ 
  cards
}) => {
  const { selectedMonth } = useMonthFilter();
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Filtrar cartões por cartão selecionado
  const filteredCards = useMemo(() => {
    return selectedCardId 
      ? cards.filter(card => card.id === selectedCardId)
      : cards;
  }, [cards, selectedCardId]);

  // Agrupar despesas por categoria
  const categoryTotals = useMemo(() => {
    // Verificar se cards existe e é um array
    if (!Array.isArray(cards)) {
      console.warn('Nenhum cartão encontrado para processamento');
      return {};
    }

    return cards.reduce((categories, card) => {
      // Verificação de segurança para o cartão
      if (!card || typeof card !== 'object') {
        console.warn('Cartão inválido encontrado:', card);
        return categories;
      }

      // Verificar se expenses existe e é um array
      if (Array.isArray(card.expenses)) {
        card.expenses.forEach(expense => {
          // Verificação de segurança para a despesa
          if (!expense || typeof expense !== 'object') {
            console.warn('Despesa inválida encontrada:', expense);
            return;
          }

          // Verificar se a data da despesa é válida
          const expenseDate = expense.date ? new Date(expense.date) : null;
          if (!expenseDate || isNaN(expenseDate.getTime())) {
            console.warn('Data de despesa inválida:', expense.date);
            return;
          }

          // Verificar se o mês selecionado é válido
          const [year, month] = (selectedMonth || '').split('-');
          const yearNum = Number(year);
          const monthNum = Number(month);

          if (
            expenseDate.getFullYear() === yearNum && 
            expenseDate.getMonth() + 1 === monthNum
          ) {
            const category = expense.category || 'Outras';
            const value = Number(expense.value) || 0;
            
            categories[category] = (categories[category] || 0) + value;
          }
        });
      } else {
        console.warn(`Cartão ${card.id || 'sem ID'} não possui despesas válidas`);
      }
      return categories;
    }, {} as Record<string, number>);
  }, [cards, selectedMonth]);

  // Calcular valor total
  const totalExpenses = useMemo(() => {
    return Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
  }, [categoryTotals]);

  // Preparar dados para o gráfico
  const chartData = {
    labels: Object.keys(categoryTotals),
    datasets: [{
      data: Object.values(categoryTotals),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
      ],
      hoverBackgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
      ]
    }]
  };

  const chartOptions: ChartOptions = {
    responsive: true,
    cutout: '70%',
    layout: {
      padding: 20
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: function(context) {
            const value = context.parsed;
            const percentage = ((value / totalExpenses) * 100).toFixed(2);
            return `${formatCurrency(value)} (${percentage}%)`;
          }
        }
      },
      legend: {
        position: 'right',
        labels: {
          boxWidth: 20
        }
      }
    }
  };

  return (
    <div className="bg-card p-6 rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-text-primary">
          Despesas por Categoria
        </h2>
        <div className="flex items-center gap-2">
          <select 
            value={selectedCardId || 'all'}
            onChange={(e) => setSelectedCardId(e.target.value === 'all' ? null : e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="all">Todos os Cartões</option>
            {Array.isArray(cards) ? (
              cards.filter(card => card && typeof card === 'object').map(card => {
                // Gerar ID único se não existir
                const safeId = card.id || `card-${Math.random().toString(36).substr(2, 9)}`;
                const safeName = card.name || 'Cartão sem nome';
                const safeLastDigits = card.lastDigits || '****';

                return (
                  <option key={safeId} value={safeId}>
                    {safeName} (*{safeLastDigits})
                  </option>
                );
              })
            ) : (
              <option disabled>Nenhum cartão disponível</option>
            )}
          </select>
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3 aspect-square relative md:-mt-6">
          {totalExpenses > 0 ? (
            <div className="w-full max-w-xs sm:max-w-sm">
              <Doughnut 
                data={chartData} 
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        boxWidth: 20,
                        usePointStyle: true,
                      }
                    },
                    tooltip: {
                      callbacks: {
                        label: (context) => {
                          const value = context.parsed;
                          return ` ${context.label}: ${formatCurrency(value)}`;
                        }
                      }
                    }
                  }
                }} 
              />
            </div>
          ) : (
            <div className="text-center text-gray-500">
              <p>Nenhuma despesa encontrada para o mês selecionado</p>
              <p className="text-sm mt-2">Verifique o filtro de mês ou adicione despesas</p>
            </div>
          )}
        </div>
        <div className="w-full md:w-2/3 md:pl-4 md:mt-16">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-md font-semibold">Detalhamento por Categoria</h3>
            <span className="text-lg font-bold text-text-primary">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(categoryTotals)
              .sort((a, b) => b[1] - a[1])
              .map(([category, value]) => (
                <div 
                  key={category} 
                  className="flex justify-between items-center bg-background-secondary p-2 rounded-md"
                >
                  <span className="text-sm text-text-secondary">{category}</span>
                  <span className="text-sm font-bold text-text-primary">
                    {formatCurrency(value)}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  );
};
