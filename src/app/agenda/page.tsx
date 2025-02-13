"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  FunnelIcon,
  XMarkIcon,
  CalendarIcon,
  ChartBarIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';
import { useTransactions } from '@/hooks/useTransactions';
import { Transaction } from '@/types/transaction';
import toast from 'react-hot-toast';

type FilterType = 'all' | 'income' | 'expense';
type PaymentStatus = 'pending' | 'paid' | 'all';

// Atualizar a interface ExtendedTransaction para corresponder ao tipo Transaction do hook
interface ExtendedTransaction {
  id: string;
  type: 'income' | 'expense' | 'expense-card';
  description?: string;
  value: number;
  category: string;
  subcategory: string;
  date: string;
  cardId?: string;
  installments?: number;
  currentInstallment?: number;
  status: string;
  paid?: boolean;
  received?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Função para calcular dias até o vencimento
const getDaysUntilDue = (date: string) => {
  const today = new Date();
  const dueDate = new Date(date);
  const diffTime = dueDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Função para determinar status de vencimento
const getPaymentStatus = (item: ExtendedTransaction) => {
  const daysUntilDue = getDaysUntilDue(item.date);
  
  if (item.paid || item.received) return 'paid';
  
  if (daysUntilDue < 0) return 'overdue';
  if (daysUntilDue <= 7) return 'near-due';
  
  return 'pending';
};

const renderStatusIcon = (item: ExtendedTransaction) => {
  const status = getPaymentStatus(item);
  
  switch (status) {
    case 'paid':
      return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
    case 'overdue':
      return (
        <div className="flex flex-col items-center">
          <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />
          <span className="text-[0.55rem] text-red-500 font-medium">Vencido</span>
        </div>
      );
    case 'near-due':
      return (
        <div className="flex flex-col items-center">
          <ClockIcon className="w-6 h-6 text-yellow-500" />
          <span className="text-[0.55rem] text-yellow-500 font-medium whitespace-nowrap">A vencer</span>
        </div>
      );
    default:
      return null;
  }
};

export default function SchedulePage() {
  // Definir primeiro dia do mês anterior
  const getFirstDayOfPreviousMonth = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    return firstDay.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  };

  // Definir último dia do mês atual
  const getLastDayOfCurrentMonth = () => {
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return lastDay.toISOString().split('T')[0]; // Formato YYYY-MM-DD
  };

  // Estado inicial com filtro de despesas e data final do mês
  const [filterType, setFilterType] = useState<string>('expense');
  const [endDate, setEndDate] = useState<string>(getLastDayOfCurrentMonth());
  const [startDate, setStartDate] = useState<string>(getFirstDayOfPreviousMonth());
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');

  const { 
    transactions, 
    loading, 
    error,
    updateTransaction,  
    mutate  
  } = useTransactions();

  // Buscar transações quando as datas mudarem
  const fetchTransactionsForPeriod = async () => {
    try {
      const queryParams = new URLSearchParams({
        startDate: startDate,
        endDate: endDate
      });
      
      const response = await fetch(`/api/transactions/history?${queryParams}`);
      if (!response.ok) throw new Error('Erro ao buscar transações');
      
      const data = await response.json();
      mutate(data);
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
    }
  };

  useEffect(() => {
    fetchTransactionsForPeriod();
  }, [startDate, endDate]);

  const clearFilters = () => {
    setFilterType('all');
    setPaymentStatus('pending');
    setStartDate(getFirstDayOfPreviousMonth());
    setEndDate(getLastDayOfCurrentMonth());
  };

  const getPendingsSummary = useMemo(() => {
    const dateFilteredItems = (transactions as ExtendedTransaction[]).filter((item) => {
      const itemDate = new Date(new Date(item.date).getTime() + (4 * 60 * 60 * 1000));
      
      const adjustedStartDate = startDate 
        ? new Date(new Date(startDate).getTime() + (4 * 60 * 60 * 1000)) 
        : null;
      
      const adjustedEndDate = endDate 
        ? new Date(new Date(endDate).getTime() + (24 * 60 * 60 * 1000)) 
        : null;
      
      const matchesStartDate = !adjustedStartDate || itemDate >= adjustedStartDate;
      const matchesEndDate = !adjustedEndDate || itemDate < adjustedEndDate;
      
      return matchesStartDate && matchesEndDate;
    });

    const pendingItems = dateFilteredItems.filter((item) => !item.paid && !item.received);

    const pendingIncomes = pendingItems.filter(item => item.type === 'income');
    const pendingExpenses = pendingItems.filter(item => item.type === 'expense');

    return {
      incomes: {
        count: pendingIncomes.length,
        total: pendingIncomes.reduce((sum, item) => {
          const value = parseFloat(String(item.value));
          return sum + (isNaN(value) ? 0 : value);
        }, 0)
      },
      expenses: {
        count: pendingExpenses.length,
        total: pendingExpenses.reduce((sum, item) => {
          const value = parseFloat(String(item.value));
          return sum + (isNaN(value) ? 0 : value);
        }, 0)
      }
    };
  }, [transactions, startDate, endDate]);

  const filteredItems = useMemo(() => {
    return (transactions as ExtendedTransaction[]).filter((item) => {
      const itemDate = new Date(new Date(item.date).getTime() + (4 * 60 * 60 * 1000));
      
      const adjustedStartDate = startDate 
        ? new Date(new Date(startDate).getTime() + (4 * 60 * 60 * 1000)) 
        : null;
      
      const adjustedEndDate = endDate 
        ? new Date(new Date(endDate).getTime() + (24 * 60 * 60 * 1000)) 
        : null;
      
      const matchesStartDate = !adjustedStartDate || itemDate >= adjustedStartDate;
      const matchesEndDate = !adjustedEndDate || itemDate < adjustedEndDate;
      
      const matchesType = filterType === 'all' || item.type === filterType;
      
      const matchesPaymentStatus = 
        paymentStatus === 'all' || 
        (paymentStatus === 'pending' && 
          ((item.type === 'income' && !item.received) || 
           (item.type === 'expense' && !item.paid))) ||
        (paymentStatus === 'paid' && 
          ((item.type === 'income' && item.received) || 
           (item.type === 'expense' && item.paid)));
      
      return matchesStartDate && matchesEndDate && matchesType && matchesPaymentStatus;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, filterType, paymentStatus, startDate, endDate]);

  const groupedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return dateA.getTime() - dateB.getTime();
    });

    return sorted.reduce<{[key: string]: ExtendedTransaction[]}>((groups, item) => {
      const date = new Date(item.date);
      const monthYear = date.toLocaleDateString('pt-BR', {
        month: 'long',
        year: 'numeric',
      });
      
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      
      groups[monthYear].push(item);
      return groups;
    }, {});
  }, [filteredItems]);

  const handleTogglePaymentStatus = async (item: ExtendedTransaction) => {
    try {
      const updatePayload = item.type === 'income' 
        ? { received: !item.received } 
        : { paid: !item.paid };

      await mutate(
        (transactions as ExtendedTransaction[]).map(t => 
          t.id === item.id 
            ? { ...t, ...updatePayload } 
            : t
        )
      );

      await updateTransaction(item.id, updatePayload as Partial<ExtendedTransaction>);
    } catch (err) {
      await mutate();
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col justify-center items-center min-h-screen text-center">
      <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="text-2xl font-bold text-red-600 mb-2">Erro ao carregar transações</h2>
      <p className="text-text-secondary mb-4">{error.message}</p>
      <button 
        onClick={() => mutate()}
        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
      >
        Tentar Novamente
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header userName="João Silva" notificationCount={2} />
      <main className="relative md:pl-[20px] pt-5 px-4 space-y-6 max-w-screen-xl mx-auto">
        <div className="w-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-primary">Agenda</h1>
              <p className="text-text-secondary mt-1">Próximas receitas e despesas</p>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="w-full max-w-screen-xl mx-auto">
          <div className="bg-card-bg rounded-xl p-6 border border-divider shadow-card mb-8">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
                {/* Botões de Tipo de Transação */}
                <div className="flex items-center gap-2 mr-4 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                  <button
                    onClick={() => setFilterType('all')}
                    className={`text-[0.65rem] px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                      filterType === 'all' 
                        ? 'bg-primary text-white' 
                        : 'bg-background text-text-secondary border border-divider hover:bg-gray-100'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setFilterType('income')}
                    className={`text-[0.65rem] px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                      filterType === 'income' 
                        ? 'bg-success text-white' 
                        : 'bg-background text-text-secondary border border-divider hover:bg-gray-100'
                    }`}
                  >
                    Receitas
                  </button>
                  <button
                    onClick={() => setFilterType('expense')}
                    className={`text-[0.65rem] px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                      filterType === 'expense' 
                        ? 'bg-expense text-white' 
                        : 'bg-background text-text-secondary border border-divider hover:bg-gray-100'
                    }`}
                  >
                    Despesas
                  </button>
                </div>

                {/* Botões de Status de Pagamento */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                  <button
                    onClick={() => setPaymentStatus('all')}
                    className={`text-[0.65rem] px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                      paymentStatus === 'all' 
                        ? 'bg-primary text-white' 
                        : 'bg-background text-text-secondary border border-divider hover:bg-gray-100'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setPaymentStatus('pending')}
                    className={`text-[0.65rem] px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                      paymentStatus === 'pending' 
                        ? 'bg-expense text-white' 
                        : 'bg-background text-text-secondary border border-divider hover:bg-gray-100'
                    }`}
                  >
                    Pendente
                  </button>
                  <button
                    onClick={() => setPaymentStatus('paid')}
                    className={`text-[0.65rem] px-3 py-1.5 rounded-lg transition-colors flex-shrink-0 ${
                      paymentStatus === 'paid' 
                        ? 'bg-success text-white' 
                        : 'bg-background text-text-secondary border border-divider hover:bg-gray-100'
                    }`}
                  >
                    Pago
                  </button>
                </div>
              
                {/* Filtros de Data */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <label htmlFor="start-date" className="text-[0.65rem] text-text-secondary">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full bg-component-bg border border-divider rounded-lg px-3 py-2 text-[0.65rem] text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                  <div className="flex flex-col gap-2 w-full md:w-auto">
                    <label htmlFor="end-date" className="text-[0.65rem] text-text-secondary">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full bg-component-bg border border-divider rounded-lg px-3 py-2 text-[0.65rem] text-text-primary focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Resumo de Pendências */}
        <div className="w-full max-w-screen-xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <div 
              onClick={() => {
                setFilterType('income');
                setPaymentStatus('pending');
              }}
              className="bg-card-bg rounded-xl p-6 border border-divider shadow-card hover:bg-success/5 hover:border-success/30 cursor-pointer transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-success/10 rounded-lg">
                  <BanknotesIcon className="w-5 h-5 text-success" />
                </div>
                <span className="text-[0.65rem] text-text-secondary font-medium">Receitas Pendentes</span>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-[0.8rem] font-semibold text-success">
                  {formatCurrency(getPendingsSummary.incomes.total)}
                </p>
                <span className="text-[0.65rem] text-text-secondary">
                  {getPendingsSummary.incomes.count} pendências
                </span>
              </div>
            </div>
            <div 
              onClick={() => {
                setFilterType('expense');
                setPaymentStatus('pending');
              }}
              className="bg-card-bg rounded-xl p-6 border border-divider shadow-card hover:bg-expense/5 hover:border-expense/30 cursor-pointer transition-all duration-200 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-expense/10 rounded-lg">
                  <ChartBarIcon className="w-5 h-5 text-expense" />
                </div>
                <span className="text-[0.65rem] text-text-secondary font-medium">Despesas Pendentes</span>
              </div>
              <div className="flex justify-between items-end">
                <p className="text-[0.8rem] font-semibold text-expense">
                  {formatCurrency(getPendingsSummary.expenses.total)}
                </p>
                <span className="text-[0.65rem] text-text-secondary">
                  {getPendingsSummary.expenses.count} pendências
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
        <div className="w-full max-w-screen-xl mx-auto">
          <div className="grid gap-8 min-w-[300px]">
            {Object.entries(groupedItems).map(([monthYear, items]) => (
              <div key={monthYear} className="mb-8">
                <h2 className="text-[0.8rem] font-semibold mb-4">{monthYear}</h2>
                <div className="space-y-2 overflow-x-auto">
                  {items.map((item) => {
                    const paymentStatus = getPaymentStatus(item);
                    const isPaidOrReceived = item.type === 'income' ? item.received : item.paid;
                    
                    return (
                      <div 
                        key={item.id} 
                        className={`
                          flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg 
                          ${paymentStatus === 'overdue' ? 'bg-red-50 border-2 border-red-200' : 
                            paymentStatus === 'near-due' ? 'bg-yellow-50 border-2 border-yellow-200' : 
                            'bg-card-bg'}
                        `}
                      >
                        <div className="flex items-center gap-4 w-full sm:w-auto mb-2 sm:mb-0">
                          {renderStatusIcon(item)}
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ 
                              backgroundColor: item.type === 'income' 
                                ? 'rgba(34, 197, 94, 0.6)' 
                                : 'rgba(239, 68, 68, 0.6)' 
                            }}
                          />
                          <div className="overflow-hidden w-full">
                            <h3 className="text-[0.65rem] font-medium truncate">
                              {item.category} {item.subcategory ? `- ${item.subcategory}` : ''}
                            </h3>
                            <p className="text-[0.6rem] text-text-secondary truncate">
                              {formatCurrency(parseFloat(String(item.value)))} | 
                              Data de Vencimento: {formatDate(item.date)}
                            </p>
                            <p className="text-[0.6rem] text-gray-500 mt-1 truncate">
                              {item.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                          <button
                            onClick={() => handleTogglePaymentStatus(item)}
                            className={`
                              text-[0.6rem] px-2 py-1 rounded-lg font-medium transition-colors w-full sm:w-auto
                              ${isPaidOrReceived 
                                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                                : 'bg-red-100 text-red-800 hover:bg-red-200'}
                            `}
                          >
                            {isPaidOrReceived 
                              ? (item.type === 'income' ? 'Recebido' : 'Pago') 
                              : (item.type === 'income' ? 'Não Recebido' : 'Não Pago')}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}