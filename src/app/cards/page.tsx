"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { CardForm, CardFormData } from '@/components/CardForm';
import { CardHistory } from '@/components/CardHistory';
import { CardBillPaymentForm } from '@/components/CardBillPaymentForm';
import { ExpensePieChart } from '@/components/ExpensePieChart';
import {
  PlusIcon,
  EllipsisHorizontalIcon,
  CreditCardIcon,
  CalendarIcon,
  BanknotesIcon,
  ArrowPathIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import { MonthFilterProvider, useMonthFilter } from '@/contexts/MonthFilterContext';

interface CardExpense {
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

interface CreditCard {
  id: string;
  name: string;
  brand: string;
  lastDigits: string;
  limit: number;
  dueDay: number;
  closingDay: number;
  color: string;
  bank: string;  // Adicionado campo bank
  currentBill?: number;
  expenses?: CardExpense[];
}

function CardsPageContent() {
  const { selectedMonth, setSelectedMonth, monthOptions } = useMonthFilter();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddCard, setShowAddCard] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [showHistory, setShowHistory] = useState<string | null>(null);
  const [showBill, setShowBill] = useState<string | null>(null);
  const [showBillPayment, setShowBillPayment] = useState<CreditCard | null>(null);
  const [selectedCard, setSelectedCard] = useState<CreditCard | null>(null);

  // Converter selectedMonth para número de mês e ano
  const [currentMonth, setCurrentMonth] = useState(parseInt(selectedMonth.split('-')[1]) - 1);
  const [currentYear, setCurrentYear] = useState(parseInt(selectedMonth.split('-')[0]));

  const handleMonthChange = (month: number, year: number) => {
    const formattedMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
    setSelectedMonth(formattedMonth);
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  // Adicionar estado para controle de múltiplos meses
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [isMultipleMonths, setIsMultipleMonths] = useState(false);

  // Inicializar a data atual apenas no cliente
  useEffect(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    setCurrentMonth(currentMonth);
    setCurrentYear(now.getFullYear());
    setSelectedMonths([currentMonth]);
  }, []);

  useEffect(() => {
    console.log('Atualizando dados dos cartões...', {
      currentMonth,
      currentYear,
      selectedMonths,
      isMultipleMonths
    });
    setLoading(true);
    fetchCards().then(() => {
      console.log('Dados dos cartões atualizados com sucesso');
    }).catch((error) => {
      console.error('Erro ao atualizar dados dos cartões:', error);
    }).finally(() => {
      setLoading(false);
    });
  }, [currentMonth, currentYear, selectedMonths, isMultipleMonths]);

  useEffect(() => {
    console.log('Estado showHistory alterado:', showHistory);
  }, [showHistory]);

  const fetchCardExpenses = async (card: CreditCard, month: number, year: number) => {
    try {
      // Calcular o primeiro e último dia do período selecionado
      let startDate: Date;
      let endDate: Date;

      if (isMultipleMonths && selectedMonths.length > 0) {
        // Para múltiplos meses, usar o menor e maior mês selecionado
        const minMonth = Math.min(...selectedMonths);
        const maxMonth = Math.max(...selectedMonths);
        startDate = new Date(year, minMonth, 1);
        endDate = new Date(year, maxMonth + 1, 0);
      } else {
        // Para um único mês
        startDate = new Date(year, month, 1);
        endDate = new Date(year, month + 1, 0);
      }

      // Ajustar para UTC para evitar problemas com fuso horário
      startDate.setUTCHours(0, 0, 0, 0);
      endDate.setUTCHours(23, 59, 59, 999);

      console.log('Buscando despesas para:', {
        cardId: card.id,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        selectedMonths: selectedMonths
      });

      const response = await fetch(
        `/api/cards/history?cardId=${card.id}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar despesas do cartão');
      }

      const data = await response.json();
      console.log('Despesas encontradas:', data);

      // Calcular o total das despesas do mês
      const total = data.reduce((acc: number, month: any) => {
        return acc + month.expenses.reduce((monthTotal: number, expense: any) => {
          if (expense.installments && expense.installments > 1) {
            return monthTotal + (Number(expense.value) / expense.installments);
          }
          return monthTotal + Number(expense.value);
        }, 0);
      }, 0);

      return {
        ...card,
        currentBill: total || 0,
        expenses: data.flatMap((month: any) => month.expenses) || []
      };
    } catch (error) {
      console.error('Erro ao buscar despesas do cartão:', error);
      return { ...card, currentBill: 0, expenses: [] };
    }
  };

  const updateCardsExpenses = async () => {
    setLoading(true);
    try {
      const updatedCards = await Promise.all(
        cards.map(card => fetchCardExpenses(card, currentMonth, currentYear))
      );
      setCards(updatedCards);
    } catch (error) {
      console.error('Erro ao atualizar despesas dos cartões:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cards.length > 0) {
      updateCardsExpenses();
    }
  }, [currentMonth, currentYear]);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards');
      if (!response.ok) throw new Error('Erro ao buscar cartões');
      const data = await response.json();
      
      // Buscar as despesas iniciais dos cartões
      const cardsWithExpenses = await Promise.all(
        data.map((card: CreditCard) => fetchCardExpenses(card, currentMonth, currentYear))
      );

      setCards(cardsWithExpenses);
    } catch (error) {
      console.error('Erro ao buscar cartões:', error);
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

  const getTotalLimit = () => {
    return cards.reduce((acc, card) => acc + Number(card.limit), 0);
  };

  const formatInstallmentValue = (expense: CardExpense) => {
    if (expense.installments && expense.installments > 1) {
      return Number(expense.value) / expense.installments;
    }
    return Number(expense.value);
  };

  const getCardBill = (card: CreditCard) => {
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 1, 0);

    let totalMes = 0;
    card.expenses?.forEach((expense) => {
      const installmentValue = formatInstallmentValue(expense);
      totalMes += installmentValue;
    });

    return totalMes;
  };

  const getTotalBills = () => {
    return cards.reduce((total, card) => total + getCardBill(card), 0);
  };

  const getNextDueDate = () => {
    if (cards.length === 0) return '-';
    
    const nextDueDates = cards.map(card => {
      // Usar o mês e ano selecionados como base
      const dueDate = new Date(currentYear, currentMonth, card.dueDay);
      
      // Se a data já passou, avançar para o próximo mês
      if (dueDate < new Date()) {
        return new Date(currentYear, currentMonth + 1, card.dueDay);
      }
      
      return dueDate;
    }).filter(date => date !== null && !isNaN(date.getTime()));

    if (nextDueDates.length === 0) return '-';

    const nextDueDate = new Date(Math.min(...nextDueDates.map(date => date.getTime())));
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short'
    }).format(nextDueDate);
  };

  const handleAddCard = async (data: CardFormData) => {
    try {
      const response = await fetch('/api/cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Erro ao criar cartão');

      const newCard = await response.json();
      setCards([...cards, newCard]);
      setShowAddCard(false);
    } catch (error) {
      console.error('Erro ao criar cartão:', error);
    }
  };

  const handleEditCard = async (data: CardFormData) => {
    if (!editingCard) return;

    try {
      const response = await fetch('/api/cards', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, id: editingCard.id }),
      });

      if (!response.ok) throw new Error('Erro ao atualizar cartão');

      const updatedCard = await response.json();
      setCards(cards.map((card) => 
        card.id === editingCard.id ? updatedCard : card
      ));
      setEditingCard(null);
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
    }
  };

  const handleDeleteCard = async (id: string) => {
    try {
      const response = await fetch(`/api/cards?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Erro ao deletar cartão');

      setCards(cards.filter((card) => card.id !== id));
    } catch (error) {
      console.error('Erro ao deletar cartão:', error);
    }
  };

  const handlePayBill = async (billData: {
    value: number;
    dueDate: string;
    paid: boolean;
    description?: string;
    paymentMethod?: string;
    alreadySubmitted?: boolean;
  }) => {
    try {
      console.log('🔍 handlePayBill - Início', { billData, showBillPayment });

      // Se já foi enviado, não fazer nada
      if (billData.alreadySubmitted) {
        console.log('🔍 handlePayBill - Já enviado, pulando');
        return;
      }

      if (!showBillPayment) {
        throw new Error('Nenhum cartão selecionado');
      }

      console.log('Dados da fatura recebidos:', JSON.stringify(billData, null, 2));
      console.log('Cartão selecionado:', JSON.stringify(showBillPayment, null, 2));

      const expenseData = {
        value: billData.value,
        date: billData.dueDate,
        category: showBillPayment.brand,  // Usar brand como banco
        subcategory: `${showBillPayment.name} - Final ${showBillPayment.lastDigits}`,
        type: 'expense',
        paid: billData.paid,
        description: billData.description || `Fatura do cartão ${showBillPayment.name}`,
        paymentMethod: billData.paymentMethod || 'Cartão de Crédito',
        recurring: false,
        fixed: false,
        installments: null
      };

      console.log('🔍 handlePayBill - Dados da despesa', expenseData);

      const response = await fetch('/api/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expenseData)
      });

      const responseBody = await response.text();
      console.log('🔍 handlePayBill - Resposta do servidor', {
        status: response.status,
        body: responseBody
      });

      if (!response.ok) {
        throw new Error(`Erro ao registrar fatura: ${responseBody}`);
      }

      // Atualizar lista de cartões após registrar fatura
      await updateCardsExpenses();
      
      // Fechar modal de pagamento
      setShowBillPayment(null);
    } catch (error) {
      console.error('🚨 Erro completo ao pagar fatura:', error);
      // TODO: Adicionar tratamento de erro para o usuário
    }
  };

  const calculateExpensesByCategory = useCallback(() => {
    const transactions = cards.flatMap(card => {
      // Usar a mesma lógica de período do calculateCurrentBill
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

    const categoriesMap: { [key: string]: number } = {};
    let totalExpenses = 0;

    transactions.forEach(expense => {
      let value = Number(expense.value);
      
      // Calcular valor da parcela se aplicável
      if (expense.installments && expense.installments > 1) {
        value = value / expense.installments;
      }

      const category = expense.category || 'Outros';
      categoriesMap[category] = (categoriesMap[category] || 0) + value;
      totalExpenses += value;
    });

    const categories = Object.entries(categoriesMap)
      .filter(([_, value]) => value > 0)
      .map(([category, total]) => ({
        category,
        total,
        percentage: (total / totalExpenses) * 100
      }))
      .sort((a, b) => b.total - a.total);

    return categories;
  }, [cards, currentMonth, currentYear]);

  useEffect(() => {
    if (cards && cards.length > 0) {
      const totalByCard = cards.map(card => ({
        name: card.name,
        totalExpenses: card.expenses?.reduce((sum, exp) => sum + exp.value, 0) || 0
      }));
      console.log('Total de Despesas por Cartão:', totalByCard);
      
      calculateExpensesByCategory();
    }
  }, [cards]);

  const calculateCurrentBill = (card: CreditCard) => {
    if (!card.expenses) return 0;

    const currentClosingDate = new Date(currentYear, currentMonth, card.closingDay);
    const lastClosingDate = new Date(currentYear, currentMonth - 1, card.closingDay);
    
    console.group('🔍 Cálculo da Fatura Atual');
    console.log('📅 Período:', {
      cardId: card.id,
      cardName: card.name,
      lastClosingDate: lastClosingDate.toISOString(),
      currentClosingDate: currentClosingDate.toISOString(),
      totalDespesas: card.expenses.length
    });

    const total = card.expenses.reduce((total, expense) => {
      const expenseDate = new Date(expense.dueDate || expense.date);
      
      console.group(`💰 Analisando Despesa: ${expense.description || expense.category}`);
      console.log('Detalhes:', {
        id: expense.id,
        valor: expense.value,
        data: expenseDate.toISOString(),
        fixed: expense.fixed,
        endRecurrenceDate: expense.endRecurrenceDate,
        installments: expense.installments,
        dentroDoPeríodo: expenseDate > lastClosingDate && expenseDate <= currentClosingDate
      });

      // Para despesas fixas, só considerar a partir do dueDate
      if (expense.fixed && !expense.endRecurrenceDate) {
        // Se o dueDate for maior que o mês atual, não incluir na fatura
        if (expenseDate > currentClosingDate) {
          console.log('❌ Despesa fixa futura, não incluída');
          console.groupEnd();
          return total;
        }
      }
      
      // Verifica se a despesa está dentro do período da fatura atual
      if (expenseDate > lastClosingDate && expenseDate <= currentClosingDate) {
        // Calcular valor da parcela
        let installmentValue = Number(expense.value);
        if (expense.installments && expense.installments > 1) {
          installmentValue = installmentValue / expense.installments;
        }
        
        console.log('✅ Valor calculado:', {
          valorOriginal: expense.value,
          valorParcela: installmentValue,
          totalAcumulado: total + installmentValue
        });
        console.groupEnd();
        return total + installmentValue;
      }

      console.log('❌ Fora do período');
      console.groupEnd();
      return total;
    }, 0);

    console.log('💵 Total Final:', total);
    console.groupEnd();
    return total;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <Header userName="João Silva" notificationCount={2} />
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center h-64">
              <p className="text-text-secondary">Carregando cartões...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary">
      <Sidebar />
      <Header userName="João Silva" notificationCount={2} />
      <main className="container mx-auto px-4 py-8">
        {/* Cabeçalho */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 mb-8">
          <div className="w-full lg:w-1/3 text-center lg:text-left">
            <h1 className="text-3xl font-semibold text-primary">Cartões</h1>
            <p className="text-text-secondary mt-1">Gerencie seus cartões e faturas</p>
          </div>

          <div className="w-full lg:w-1/3 flex justify-center mb-4 lg:mb-0">
            <MonthYearPicker
              selectedMonth={currentMonth}
              selectedYear={currentYear}
              onChange={(month, year) => handleMonthChange(month, year)}
              className="bg-white shadow-lg rounded-xl p-4 w-full max-w-md text-primary"
            />
          </div>

          <div className="w-full lg:w-1/3 flex justify-center lg:justify-end items-center gap-2 lg:gap-4">
            <button
              onClick={() => {
                setLoading(true);
                fetchCards().then(() => {
                  console.log('Dados atualizados com sucesso');
                }).catch((error) => {
                  console.error('Erro ao atualizar dados:', error);
                });
              }}
              className="flex items-center gap-2 px-4 py-2 bg-card-bg text-text-primary rounded-lg hover:bg-card-bg/80 transition-colors text-[0.75rem] justify-center"
              disabled={loading}
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Atualizar</span>
            </button>

            <a
              href="/cards/transactions"
              className="flex items-center gap-2 px-4 py-2 bg-card-bg text-text-primary rounded-lg hover:bg-card-bg/80 transition-colors text-[0.75rem] justify-center"
            >
              <BanknotesIcon className="w-4 h-4" />
              <span>Transações</span>
            </a>

            <button
              onClick={() => setShowAddCard(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-[0.75rem] whitespace-nowrap"
            >
              <PlusIcon className="w-4 h-4" />
              <span>Novo Cartão</span>
            </button>
          </div>
        </div>

        {/* Gráfico de Despesas */}
        <div className="w-full px-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-md w-full">
            <ExpensePieChart 
              cards={cards} 
              currentMonth={currentMonth}
              currentYear={currentYear}
            />
          </div>
        </div>

        {/* Lista de Cartões */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <div 
              key={card.id} 
              className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-2 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
              style={{ 
                backgroundColor: card.color, 
                borderColor: `${card.color}80`,
                backgroundImage: `linear-gradient(135deg, ${card.color}aa, ${card.color}dd)`,
                color: 'white'
              }}
            >
              {/* Chip de cartão */}
              <div className="absolute top-6 right-6 w-16 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-md transform rotate-12">
                <div className="w-full h-2 bg-white/30 absolute top-1/2 transform -translate-y-1/2"></div>
              </div>

              {/* Conteúdo do cartão */}
              <div className="p-6 relative z-10 space-y-6">
                {/* Cabeçalho do Cartão */}
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-md font-bold tracking-wider mb-1">
                      {card.brand} {card.name}
                    </h3>
                    <p className="text-[0.65rem] opacity-80 tracking-widest">
                      **** **** **** {card.lastDigits}
                    </p>
                  </div>
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-md font-bold"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.2)', 
                      color: 'white' 
                    }}
                  >
                    {card.name.charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* Informações Financeiras */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[0.65rem] uppercase tracking-wider opacity-70 mb-1">
                      Fatura Atual
                    </p>
                    <p className="text-md font-bold">
                      {formatCurrency(calculateCurrentBill(card))}
                    </p>
                    <p className="text-[0.6rem] opacity-70">
                      Fecha dia {card.closingDay}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[0.65rem] uppercase tracking-wider opacity-70 mb-1">
                      Limite Disponível
                    </p>
                    <p className="text-sm font-bold">
                      {formatCurrency(card.limit - calculateCurrentBill(card))}
                    </p>
                    <p className="text-[0.6rem] opacity-70">
                      de {formatCurrency(card.limit)}
                    </p>
                  </div>
                </div>

                {/* Rodapé do Cartão */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <CreditCardIcon className="w-3.5 h-3.5 opacity-70" />
                    <span className="text-[0.65rem] opacity-80">
                      Venc. {card.dueDay} | Fecha. {card.closingDay}
                    </span>
                  </div>
                  <div className="flex space-x-1.5">
                    <button 
                      onClick={() => {
                        setSelectedCard(card);
                        setShowHistory(card.id);
                      }}
                      className="px-3 py-1.5 text-[0.65rem] bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      Histórico
                    </button>
                    <button 
                      onClick={() => setShowBillPayment(card)}
                      className="px-3 py-1.5 text-[0.65rem] bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      Pagar
                    </button>
                    <button 
                      onClick={() => setEditingCard(card)}
                      className="px-3 py-1.5 text-[0.65rem] bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                    >
                      <PencilIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Efeito de gradiente */}
              <div 
                className="absolute inset-0 opacity-20 pointer-events-none" 
                style={{
                  backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.1), transparent 70%)'
                }}
              ></div>
            </div>
          ))}
        </div>

      </main>
      {showAddCard && (
        <CardForm
          onSubmit={handleAddCard}
          onClose={() => setShowAddCard(false)}
        />
      )}

      {editingCard && (
        <CardForm
          initialData={{
            name: editingCard.name,
            lastDigits: editingCard.lastDigits,
            limit: Number(editingCard.limit),
            dueDate: Number(editingCard.dueDay),
            closingDate: Number(editingCard.closingDay),
            color: editingCard.color,
            bank: editingCard.brand
          }}
          onSubmit={handleEditCard}
          onClose={() => setEditingCard(null)}
        />
      )}

      {/* Modal de Histórico */}
      {showHistory && (
        <CardHistory
          cardId={showHistory}
          cardName={cards.find(card => card.id === showHistory)?.name || ''}
          onClose={() => {
            console.log('Fechando histórico');
            setShowHistory(null);
          }}
        />
      )}

      {/* Modal de Pagamento de Fatura */}
      {showBillPayment && (
        <CardBillPaymentForm 
          card={showBillPayment}
          onClose={() => setShowBillPayment(null)}
          onSubmit={handlePayBill}
        />
      )}
    </div>
  );
}

export default function CardsPage() {
  return (
    <MonthFilterProvider>
      <CardsPageContent />
    </MonthFilterProvider>
  );
}