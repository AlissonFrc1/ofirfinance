import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { MonthYearPicker } from './MonthYearPicker';

interface CardExpense {
  id: string;
  value: number;
  date: string;
  dueDate: string;
  category: string;
  subcategory: string;
  description?: string;
  installments?: number;
  fixed: boolean;
  recurring: boolean;
}

interface Props {
  cardId: string;
  cardName: string;
  onClose: () => void;
}

export function CardHistory({ cardId, cardName, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<CardExpense[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [groupedExpenses, setGroupedExpenses] = useState<Record<string, CardExpense[]>>({});

  useEffect(() => {
    console.log('Histórico recebido:', history);
    if (!history) return;

    // Agrupar despesas por mês
    const grouped = history.reduce((acc: Record<string, CardExpense[]>, monthData: any) => {
      try {
        if (!monthData.month || !monthData.expenses) {
          console.error('Dados inválidos:', monthData);
          return acc;
        }

        const date = new Date(monthData.month);
        if (isNaN(date.getTime())) {
          console.error('Data inválida:', monthData.month);
          return acc;
        }

        const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!acc[monthYear]) {
          acc[monthYear] = [];
        }

        // Adicionar todas as despesas do mês
        acc[monthYear].push(...monthData.expenses);
        return acc;
      } catch (error) {
        console.error('Erro ao processar mês:', error, monthData);
        return acc;
      }
    }, {});

    console.log('Despesas agrupadas:', grouped);
    setGroupedExpenses(grouped);
  }, [history]);

  useEffect(() => {
    fetchHistory();
  }, [selectedMonth, selectedYear]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);

      const response = await fetch(
        `/api/cards/history?cardId=${cardId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) throw new Error('Erro ao buscar histórico');

      const data = await response.json();
      console.group('🔍 DETALHES COMPLETOS DO HISTÓRICO');
      console.log('📅 Período:', startDate.toISOString(), 'a', endDate.toISOString());
      console.log('💰 Número de Meses:', data.length);
      
      // Log detalhado de cada mês e despesa
      let totalGeral = 0;
      data.forEach((monthData: any, monthIndex: number) => {
        console.group(`📆 Mês ${monthIndex + 1}`);
        console.log('Mês:', monthData.month);
        console.log('Total do Mês:', monthData.total);
        
        let totalMes = 0;
        monthData.expenses.forEach((expense: CardExpense, expenseIndex: number) => {
          const installmentValue = formatInstallmentValue(expense);
          totalMes += installmentValue;
          
          console.log(`Despesa ${expenseIndex + 1}:`, {
            id: expense.id,
            valor: expense.value,
            valorParcela: installmentValue,
            data: expense.date,
            categoria: expense.category,
            parcelas: expense.installments || 1
          });
        });
        
        console.log('💡 Total Calculado do Mês:', totalMes);
        console.log('📈 Total Informado do Mês:', monthData.total);
        console.log('📉 Diferença:', totalMes - monthData.total);
        totalGeral += totalMes;
        console.groupEnd();
      });
      
      console.log('💰 Total Geral Calculado:', totalGeral);
      console.groupEnd();
      
      setHistory(data);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatInstallmentValue = (expense: CardExpense) => {
    if (expense.installments && expense.installments > 1) {
      return Number(expense.value) / expense.installments;
    }
    return Number(expense.value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    
    try {
      // Forçar UTC para evitar ajustes de fuso horário
      const [year, month, day] = date.split('T')[0].split('-');
      return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(
        new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)))
      );
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return '-';
    }
  };

  // Ordenar meses em ordem decrescente
  const sortedMonths = Object.keys(groupedExpenses).sort((a, b) => b.localeCompare(a));

  // Log para debug
  console.log('Despesas agrupadas:', {
    total: history.length,
    grupos: Object.entries(groupedExpenses).map(([mes, despesas]) => ({
      mes,
      total: despesas.length,
      despesas: despesas.map(d => ({
        id: d.id,
        data: d.date,
        dataVencimento: d.dueDate,
        dataFormatada: formatDate(d.date),
        valor: d.value,
        parcelas: d.installments,
        descricao: d.description
      }))
    }))
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-background rounded-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium">Histórico do Cartão</h2>
              <p className="text-text-secondary">{cardName}</p>
            </div>
            <div className="flex items-center gap-4">
              <MonthYearPicker
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onChange={(month, year) => {
                  console.log('Filtro alterado:', { month, year });
                  setSelectedMonth(month);
                  setSelectedYear(year);
                }}
              />
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-text-secondary">Carregando histórico...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex items-center justify-center h-32">
              <p className="text-text-secondary">Nenhuma despesa encontrada</p>
            </div>
          ) : (
            <div className="space-y-8">
              {sortedMonths.map(monthYear => {
                // Extrair ano e mês da string YYYY-MM
                const [year, month] = monthYear.split('-');
                // Criar data para formatar o nome do mês
                const monthName = new Date(Number(year), Number(month) - 1).toLocaleString('pt-BR', { 
                  month: 'long' 
                });

                const total = groupedExpenses[monthYear].reduce((sum, expense) => {
                  const value = formatInstallmentValue(expense);
                  return sum + value;
                }, 0);

                return (
                  <div key={monthYear}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium capitalize">
                        {monthName} de {year}
                      </h3>
                      <p className="text-lg font-medium text-expense">
                        {formatCurrency(total)}
                      </p>
                    </div>

                    <div className="space-y-4">
                      {groupedExpenses[monthYear]
                        .sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime())
                        .map((expense, index) => (
                          <div 
                            key={expense.id} 
                            className="flex items-center justify-between py-2 border-b border-border last:border-b-0"
                          >
                            <div className="flex flex-col">
                              <span className="text-text-primary">
                                {expense.category}
                                {expense.subcategory && ` - ${expense.subcategory}`}
                              </span>
                              <span className="text-text-secondary text-sm">
                                {formatDate(expense.date)}
                              </span>
                            </div>
                            <div className="flex flex-col items-end">
                              <span className="text-text-primary">
                                {formatCurrency(formatInstallmentValue(expense))}
                                {expense.installments && expense.installments > 1 && (
                                  <span className="text-text-secondary text-xs ml-1">
                                    ({expense.parcela_atual}/{expense.total_parcelas})
                                  </span>
                                )}
                              </span>
                              {expense.installments && expense.installments > 1 && (
                                <span className="text-text-secondary text-xs">
                                  Total: {formatCurrency(Number(expense.value))}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 