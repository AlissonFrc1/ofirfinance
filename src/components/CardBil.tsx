import { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CardBillProps {
  cardId: string;
  cardName: string;
  onClose: () => void;
}

interface CardExpense {
  id: string;
  value: number;
  date: string;
  category: string;
  subcategory: string;
  description?: string;
  installments?: number;
  parcela_atual?: number;
  total_parcelas?: number;
  originalExpense?: {
    date: string;
  };
  dueDate?: string;
  recurring?: boolean;
  endRecurrenceDate?: string;
  valorParcela?: number;
}

interface CategoryExpenses {
  total: number;
  expenses: CardExpense[];
}

interface BillDetails {
  card: {
    name: string;
    lastDigits: string;
    dueDay: number;
    closingDay: number;
  };
  period: {
    start: string;
    end: string;
  };
  total: number;
  byCategory: Record<string, CategoryExpenses>;
  expenses: CardExpense[];
}

export function CardBill({ cardId, cardName, onClose }: CardBillProps) {
  const [billDetails, setBillDetails] = useState<BillDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [monthlyExpenses, setMonthlyExpenses] = useState<Record<string, { total: number; expenses: CardExpense[] }>>({});

  // Novo método: Agrupar despesas por mês
  const groupExpensesByMonth = (expenses: CardExpense[]) => {
    return expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = {
          total: 0,
          expenses: []
        };
      }
      
      acc[monthYear].total += calculateInstallmentValue(expense, new Date(), new Date());
      acc[monthYear].expenses.push(expense);
      
      return acc;
    }, {} as Record<string, { total: number; expenses: CardExpense[] }>);
  };

  // Novo método: Calcular valor de parcelas
  const calculateInstallmentValue = (
    expense: CardExpense, 
    startDate: Date, 
    endDate: Date
  ) => {
    const expenseDate = new Date(expense.date);
    const dueDateExpense = expense.dueDate ? new Date(expense.dueDate) : expenseDate;
    const originalExpenseDate = expense.originalExpense?.date 
      ? new Date(expense.originalExpense.date) 
      : expenseDate;
    
    // Verificar se a despesa tem parcelas
    const hasInstallments = expense.installments && expense.installments > 1;
    const currentInstallment = expense.parcela_atual || 1;
    const totalInstallments = expense.total_parcelas || expense.installments || 1;
    
    // Calcular valor total da despesa
    const totalValue = Number(expense.value);
    const installmentValue = totalValue / totalInstallments;
    
    // Critérios para inclusão da parcela
    const isCurrentInstallmentInPeriod = 
      dueDateExpense >= startDate && 
      dueDateExpense <= endDate;
    
    const isOriginalExpenseInPeriod = 
      originalExpenseDate >= startDate && 
      originalExpenseDate <= endDate;
    
    const isRecurringInPeriod = 
      expense.recurring && 
      expense.endRecurrenceDate && 
      new Date(expense.endRecurrenceDate) >= startDate;
    
    console.group('🔍 Cálculo de Parcela');
    console.log('💰 Despesa:', expense.description);
    console.log('📅 Data da Despesa:', expenseDate.toISOString());
    console.log('📆 Data de Vencimento:', dueDateExpense.toISOString());
    console.log('🕰️ Data Original:', originalExpenseDate.toISOString());
    console.log('🔢 Parcela Atual:', currentInstallment);
    console.log('📊 Total de Parcelas:', totalInstallments);
    console.log('💵 Valor Total:', totalValue);
    console.log('💸 Valor da Parcela:', installmentValue);
    console.log('✅ Parcela no Período:', isCurrentInstallmentInPeriod);
    console.log('🕰️ Despesa Original no Período:', isOriginalExpenseInPeriod);
    console.log('🔁 Recorrente no Período:', isRecurringInPeriod);
    console.groupEnd();
    
    // Decidir se inclui a parcela
    if (isCurrentInstallmentInPeriod || isOriginalExpenseInPeriod || isRecurringInPeriod) {
      return installmentValue;
    }
    
    return 0;
  };

  useEffect(() => {
    fetchBillDetails();
  }, [cardId]);

  const fetchBillDetails = async () => {
    try {
      console.log('Iniciando busca de detalhes da fatura para o cartão:', cardId);
      
      // Buscar informações do cartão
      const response = await fetch(`/api/cards/${cardId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar informações do cartão');
      }
      const card = await response.json();
      console.log('Informações do cartão recebidas:', card);

      // Calcular período da fatura atual
      const today = new Date();
      const currentDay = today.getDate();
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      
      let startDate: Date;
      let endDate: Date;
      
      if (currentDay <= card.closingDay) {
        startDate = new Date(currentYear, currentMonth - 1, card.closingDay + 1);
        endDate = new Date(currentYear, currentMonth, card.closingDay);
      } else {
        startDate = new Date(currentYear, currentMonth, card.closingDay + 1);
        endDate = new Date(currentYear, currentMonth + 1, card.closingDay);
      }

      console.group('🔍 DETALHES COMPLETOS DA FATURA');
      console.log('📅 Período:', startDate.toISOString(), 'a', endDate.toISOString());

      // Buscar detalhes da fatura
      const billResponse = await fetch(
        `/api/cards/bills/details?cardId=${cardId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      if (!billResponse.ok) {
        const errorData = await billResponse.json();
        throw new Error(errorData.error || 'Erro ao buscar detalhes da fatura');
      }
      
      const data = await billResponse.json();
      
      // Log detalhado de despesas
      console.log('💰 Número de Despesas:', data.expenses.length);
      
      let calculatedTotal = 0;
      console.group('💸 Despesas Individuais');
      const filteredExpenses = data.expenses.map((expense: CardExpense) => {
        const installmentValue = calculateInstallmentValue(expense, startDate, endDate);
        
        console.log(`🧾 Despesa: ${expense.description || 'Sem descrição'}`, {
          valorTotal: expense.value,
          valorParcela: installmentValue,
          dataDespesa: expense.date,
          dataOriginal: expense.originalExpense?.date,
          parcelas: {
            atual: expense.parcela_atual,
            total: expense.total_parcelas || expense.installments
          },
          incluída: installmentValue > 0
        });

        if (installmentValue > 0) {
          calculatedTotal += installmentValue;
        }

        return {
          ...expense,
          valorParcela: installmentValue
        };
      }).filter((expense: CardExpense) => (expense.valorParcela || 0) > 0);
      
      console.groupEnd();
      
      console.log('💡 Total Calculado:', calculatedTotal);
      console.log('📈 Total da API:', data.total);
      console.log('📉 Diferença:', calculatedTotal - data.total);
      console.groupEnd();
      
      // Agrupar despesas por categoria
      const byCategory = filteredExpenses.reduce((acc: Record<string, CategoryExpenses>, expense: CardExpense) => {
        const category = expense.category;
        const installmentValue = expense.valorParcela || 0;
        
        if (!acc[category]) {
          acc[category] = { total: 0, expenses: [] };
        }
        
        acc[category].total += installmentValue;
        acc[category].expenses.push(expense);
        
        return acc;
      }, {});

      // Atualizar dados da fatura com total calculado
      const updatedBillDetails = {
        ...data,
        total: calculatedTotal,
        byCategory: byCategory,
        expenses: filteredExpenses
      };
      
      console.group('🔍 DETALHES FINAIS DA FATURA');
      console.log('💰 Total Calculado:', calculatedTotal);
      console.log('📊 Total na Fatura:', updatedBillDetails.total);
      console.log('📈 Total Original da API:', data.total);
      console.log('📉 Despesas Filtradas:', filteredExpenses.length);
      console.groupEnd();

      setBillDetails(updatedBillDetails);
      setError(null);
    } catch (error) {
      console.error('Erro ao buscar detalhes da fatura:', error);
      setError(error instanceof Error ? error.message : 'Erro ao carregar fatura');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatPeriod = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    
    return `${startDate.toLocaleDateString('pt-BR')} a ${endDate.toLocaleDateString('pt-BR')}`;
  };

  useEffect(() => {
    if (billDetails) {
      console.log('💵 VALOR RENDERIZADO:', billDetails.total);
    }
  }, [billDetails?.total]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-4xl p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold text-text-primary">
            Fatura do Cartão {cardName}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary focus:outline-none"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {loading && (
          <div className="flex items-center justify-center h-64">
            <p className="text-text-secondary">Carregando detalhes da fatura...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {billDetails && (
          <div className="space-y-4">
            <div className="bg-card-bg p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-sm text-text-secondary">Total da Fatura</span>
                  <span className="text-xl font-bold text-green-500">
                    {formatCurrency(billDetails.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}