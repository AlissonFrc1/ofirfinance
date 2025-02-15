import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { formatCurrency } from '@/utils/formatters';
import { MonthYearPicker } from '@/components/MonthYearPicker';

interface CardBillPaymentFormProps {
  card: {
    id: string;
    name: string;
    brand: string;
    lastDigits: string;
    currentBill?: number;
    dueDay: number;
  };
  onClose: () => void;
  onSubmit: (billData: {
    value: number;
    dueDate: string;
    paid: boolean;
    description?: string;
    paymentMethod?: string;
  }) => Promise<void>;
}

const PAYMENT_METHODS = [
  "Dinheiro",
  "Débito",
  "Transferência Bancária",
  "Pix"
];

// Função para obter o nome do mês
const getMonthName = (monthIndex: number) => {
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 
    'Maio', 'Junho', 'Julho', 'Agosto', 
    'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return months[monthIndex];
};

export function CardBillPaymentForm({ 
  card, 
  onClose, 
  onSubmit 
}: CardBillPaymentFormProps) {
  const [billValue, setBillValue] = useState(card.currentBill || 0);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const currentDate = new Date();
    return currentDate.getMonth();
  });
  const [selectedYear, setSelectedYear] = useState(() => {
    const currentDate = new Date();
    return currentDate.getFullYear();
  });
  const [dueDate, setDueDate] = useState(() => {
    const currentDate = new Date(selectedYear, selectedMonth, card.dueDay);
    return currentDate.toISOString().split('T')[0];
  });
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending'>('pending');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Débito');
  const [loading, setLoading] = useState(false);

  // Buscar valor da fatura quando mês/ano mudam
  useEffect(() => {
    const fetchBillValue = async () => {
      try {
        const startDate = new Date(selectedYear, selectedMonth, 1);
        const endDate = new Date(selectedYear, selectedMonth + 1, 0);

        console.log('Contexto completo da busca:', {
          card: {
            id: card.id,
            name: card.name
          },
          selectedMonth,
          selectedYear,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          currentDate: new Date().toISOString()
        });

        console.log(' Detalhes da Busca de Valor da Fatura:', {
          cardId: card.id,
          cardName: card.name,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          selectedMonth,
          selectedYear
        });

        console.log('Buscando valor da fatura:', {
          selectedMonth,
          selectedYear
        });

        const response = await fetch(
          `/api/cards/bill-value?cardId=${card.id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );

        console.log('Resposta da API:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.warn('Não foi possível buscar valor da fatura', errorText);
          return;
        }

        const data = await response.json();
        
        console.log('Dados recebidos:', data);

        // Forçar atualização do valor
        const newBillValue = Number(data.totalBillValue) || 0;
        console.log('Novo valor da fatura:', newBillValue);
        
        // Usar função de atualização para garantir re-render
        setBillValue(prevValue => {
          console.log('Valor anterior:', prevValue);
          return newBillValue;
        });
      } catch (error) {
        console.error('Erro completo ao buscar valor da fatura:', {
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          stack: error instanceof Error ? error.stack : 'Sem stack trace'
        });
      }
    };

    fetchBillValue();
  }, [selectedMonth, selectedYear, card.id]);

  // Atualizar data de vencimento quando mês ou ano mudam
  useEffect(() => {
    const updatedDueDate = new Date(selectedYear, selectedMonth, card.dueDay);
    setDueDate(updatedDueDate.toISOString().split('T')[0]);
  }, [selectedMonth, selectedYear, card.dueDay]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log(' CardBillPaymentForm - Início handleSubmit', {
        billValue,
        dueDate,
        paymentStatus,
        paymentMethod,
        description
      });

      // Preparar dados da despesa
      const expenseData = {
        value: billValue,
        paid: paymentStatus === 'paid',
        date: new Date(dueDate + 'T00:00:00Z'), // Converter para DateTime completo
        paymentMethod,
        category: `${card.brand} - ${card.name}`,
        subcategory: `Fatura de ${getMonthName(selectedMonth)}`,
        description: description || `Fatura ${card.brand} - ${getMonthName(selectedMonth)} ${selectedYear}`,
        recurring: false,
        fixed: false,
        installments: null
      };

      console.log(' CardBillPaymentForm - Dados da despesa', expenseData);

      // Enviar dados para o backend
      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData),
      });

      console.log(' CardBillPaymentForm - Resposta do backend', {
        status: response.status,
        body: await response.clone().text()
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao registrar fatura');
      }

      // Chamar onSubmit com os dados, mas sem enviar novamente para o backend
      await onSubmit({
        value: billValue,
        dueDate,
        paid: paymentStatus === 'paid',
        description,
        paymentMethod
      });

      // Fechar o formulário
      onClose();
    } catch (error) {
      console.error(' Erro ao registrar fatura:', error);
      // Tratar erro (mostrar mensagem ao usuário, etc.)
    } finally {
      setLoading(false);
    }
  };

  const formatCurrencyInput = (value: string) => {
    // Implementar formatação de moeda
    return value;
  };

  return (
    <div className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card-bg rounded-xl w-full max-w-sm p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Pagamento de Fatura
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary focus:outline-none"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Seletor de Mês e Ano */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Mês da Fatura
            </label>
            <div className="flex items-center justify-between">
              <span className="text-[0.72rem] text-text-primary capitalize">
                {getMonthName(selectedMonth)}
              </span>
              <MonthYearPicker
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onChange={(month, year) => {
                  // Prevenir propagação e fechamento
                  const event = window.event as Event;
                  if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                  }
                  setSelectedMonth(month);
                  setSelectedYear(year);
                }}
                onMonthChange={(month) => {
                  // Adicional: Prevenir fechamento
                  const event = window.event as Event;
                  if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                  }
                }}
                onYearChange={(year) => {
                  // Adicional: Prevenir fechamento
                  const event = window.event as Event;
                  if (event) {
                    event.preventDefault();
                    event.stopPropagation();
                  }
                }}
              />
            </div>
          </div>

          {/* Status da Fatura com dois botões */}
          <div className="flex justify-between items-center mb-2">
            <span className="text-[0.72rem] text-text-primary">
              Status da Fatura
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentStatus('pending')}
                className={`
                  px-2 py-1 rounded-lg transition-colors flex items-center gap-2
                  ${paymentStatus === 'pending' 
                    ? 'bg-expense text-white hover:bg-expense-dark' 
                    : 'bg-background text-text-secondary border border-divider hover:bg-gray-100'}
                `}
              >
                Pendente
                {paymentStatus === 'pending' && <span className="text-xs">✗</span>}
              </button>
              <button
                type="button"
                onClick={() => setPaymentStatus('paid')}
                className={`
                  px-2 py-1 rounded-lg transition-colors flex items-center gap-2
                  ${paymentStatus === 'paid' 
                    ? 'bg-success text-white hover:bg-success-dark' 
                    : 'bg-background text-text-secondary border border-divider hover:bg-gray-100'}
                `}
              >
                Pago
                {paymentStatus === 'paid' && <span className="text-xs">✓</span>}
              </button>
            </div>
          </div>

          {/* Valor da Fatura */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Valor da Fatura
            </label>
            <input
              type="number"
              value={billValue}
              onChange={(e) => setBillValue(Number(e.target.value))}
              className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
              placeholder="Digite o valor da fatura"
              required
            />
          </div>

          {/* Data de Vencimento */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Data de Vencimento
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Método de Pagamento */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Método de Pagamento
            </label>
            <select 
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
            >
              <option value="">Selecione uma forma de pagamento</option>
              {PAYMENT_METHODS.map((method, index) => (
                <option key={index} value={method}>{method}</option>
              ))}
            </select>
          </div>

          {/* Cartão */}
          <div>
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Cartão
            </label>
            <input 
              type="text" 
              value={`${card.brand} - ${card.name} (Final ${card.lastDigits})`}
              disabled
              className="w-full bg-background text-text-secondary rounded-lg px-2 py-1.5 cursor-not-allowed opacity-70"
            />
          </div>

          {/* Subcategoria */}
          <div>
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Subcategoria
            </label>
            <input 
              type="text" 
              value={`Fatura de ${getMonthName(selectedMonth)} ${selectedYear}`}
              disabled
              className="w-full bg-background text-text-secondary rounded-lg px-2 py-1.5 cursor-not-allowed opacity-70"
            />
          </div>

          {/* Descrição */}
          {description !== undefined && (
            <div>
              <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
                Descrição (Opcional)
              </label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary resize-none h-20"
              />
            </div>
          )}

          <div className="flex justify-end space-x-4 mt-6">
            <button 
              type="button"
              onClick={onClose}
              className="px-2 py-1 bg-background text-text-secondary rounded-lg hover:bg-background/80 transition-colors"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={loading}
              className={`
                px-2 py-1 rounded-lg transition-colors
                ${loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-primary/90'}
              `}
            >
              {loading ? 'Registrando...' : 'Registrar Fatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
