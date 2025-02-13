"use client";

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import { 
  ArrowPathIcon,
  FunnelIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

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
  cardId: string;
  cardName?: string;
  endRecurrenceDate?: string | null;
  currentInstallment?: number;
}

interface Card {
  id: string;
  name: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<CardExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [cards, setCards] = useState<Card[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<CardExpense | null>(null);
  const [deletingTransaction, setDeletingTransaction] = useState<CardExpense | null>(null);
  const [endFixedTransaction, setEndFixedTransaction] = useState<CardExpense | null>(null);
  const [filters, setFilters] = useState({
    cardId: '',
    category: '',
    minValue: '',
    maxValue: '',
    fixed: false,
    recurring: false,
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
  });

  // Estado para controlar o modal de recorrência
  const [recurrenceModalTransaction, setRecurrenceModalTransaction] = useState<CardExpense | null>(null);
  const [endRecurrenceDate, setEndRecurrenceDate] = useState<string>(filters.endDate);
  const [recurrenceDateOptions, setRecurrenceDateOptions] = useState<string[]>([]);
  const [currentRecurrenceMonth, setCurrentRecurrenceMonth] = useState(0);

  // Buscar cartões
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await fetch('/api/cards');
        if (!response.ok) throw new Error('Erro ao buscar cartões');
        const data = await response.json();
        setCards(data);
      } catch (error) {
        console.error('Erro ao buscar cartões:', error);
      }
    };

    fetchCards();
  }, []);

  // Buscar transações
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        startDate: new Date(filters.startDate).toISOString(),
        endDate: new Date(filters.endDate).toISOString(),
        ...(filters.cardId && { cardId: filters.cardId }),
        ...(filters.category && { category: filters.category }),
        ...(filters.minValue && { minValue: filters.minValue }),
        ...(filters.maxValue && { maxValue: filters.maxValue }),
        ...(filters.fixed && { fixed: 'true' }),
        ...(filters.recurring && { recurring: 'true' })
      });

      const response = await fetch(`/api/cards/transactions?${queryParams}`);
      if (!response.ok) throw new Error('Erro ao buscar transações');
      
      const data = await response.json();
      setTransactions(data);

      // Extrair categorias únicas
      const uniqueCategories = Array.from(new Set(data.map((t: CardExpense) => t.category)))
        .filter((category): category is string => typeof category === 'string')
        .sort();
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  useEffect(() => {
    if (recurrenceModalTransaction) {
      const options = generateRecurrenceDateOptions(
        recurrenceModalTransaction.date
      );
      setRecurrenceDateOptions(options);
      // Definir a primeira opção como padrão
      if (options.length > 0) {
        setEndRecurrenceDate(options[0]);
      }
    }
  }, [recurrenceModalTransaction, currentRecurrenceMonth]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/cards/transactions?id=${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Erro ao excluir transação');
      
      await fetchTransactions();
      setDeletingTransaction(null);
    } catch (error) {
      console.error('Erro ao excluir transação:', error);
    }
  };

  const handleEndRecurrence = async (id: string, endDate: string) => {
    try {
      const response = await fetch(`/api/cards/transactions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id,
          endRecurrenceDate: endDate,
          recurring: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error('Erro ao atualizar data de recorrência');
      }
      
      await fetchTransactions();
    } catch (error) {
      console.error('Erro ao atualizar data de recorrência:', error);
    }
  };

  const handleEdit = (transaction: CardExpense) => {
    setEditingTransaction(transaction);
  };

  const handleUpdateTransaction = async (updatedData: Partial<CardExpense>) => {
    if (!editingTransaction) return;

    try {
      const response = await fetch(`/api/cards/transactions`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          id: editingTransaction.id,
          ...updatedData,
          // Garantir que fixed seja enviado como boolean
          fixed: 'fixed' in updatedData ? Boolean(updatedData.fixed) : editingTransaction.fixed
        })
      });

      if (!response.ok) throw new Error('Erro ao atualizar transação');
      
      await fetchTransactions();
      setEditingTransaction(null);
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
    }
  };

  const handleToggleFixed = async (transaction: CardExpense) => {
    try {
      // Se já tem endRecurrenceDate, significa que está desativando a recorrência
      if (!transaction.endRecurrenceDate) {
        // Se não tem endRecurrenceDate, significa que está ativando a recorrência
        // Então apenas remove o endRecurrenceDate
        const response = await fetch(`/api/cards/transactions`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: transaction.id,
            endRecurrenceDate: null
          })
        });

        if (!response.ok) {
          throw new Error('Erro ao atualizar transação');
        }

        // Atualiza a lista de transações
        fetchTransactions();
      } else {
        // Se tem endRecurrenceDate, abre o modal para definir a data fim
        setRecurrenceModalTransaction(transaction);
      }

    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
    }
  };

  const handleToggleRecurring = async (transaction: CardExpense) => {
    try {
      // Se a transação for fixa e NÃO tiver data final de recorrência, abrir modal
      if (transaction.fixed && !transaction.endRecurrenceDate) {
        setRecurrenceModalTransaction(transaction);
        return;
      }

      // Se a transação for fixa e já tiver uma data final de recorrência:
      if (transaction.fixed && transaction.endRecurrenceDate) {
        const response = await fetch(`/api/cards/transactions`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            id: transaction.id,
            endRecurrenceDate: null
          })
        });

        if (!response.ok) throw new Error('Erro ao atualizar recorrência');
        
        await fetchTransactions();
      }
    } catch (error) {
      console.error('Erro ao processar recorrência:', error);
    }
  };

  const generateRecurrenceDateOptions = (date: string): string[] => {
    const originalDate = new Date(filters.endDate);
    const originalDay = originalDate.getDate();
    const options: string[] = [];

    // Calcular o primeiro mês após a data original
    const startDate = new Date(originalDate);
    startDate.setMonth(originalDate.getMonth() + currentRecurrenceMonth + 1);
    
    // Gerar 4 opções de datas no mesmo dia do mês
    for (let i = 0; i < 4; i++) {
      const newDate = new Date(startDate);
      newDate.setMonth(startDate.getMonth() + i);

      // Ajustar para o dia original, lidando com meses com menos dias
      const lastDayOfMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
      newDate.setDate(Math.min(originalDay, lastDayOfMonth));

      options.push(newDate.toISOString().split('T')[0]);
    }

    return options;
  };

  const handleNextRecurrenceMonth = () => {
    setCurrentRecurrenceMonth(prev => prev + 1);
  };

  const handlePrevRecurrenceMonth = () => {
    setCurrentRecurrenceMonth(prev => Math.max(0, prev - 1));
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header userName="João Silva" notificationCount={2} />
      <main className="relative md:pl-[20px] pt-5 px-4 space-y-6 max-w-screen-xl mx-auto">
        <div className="w-full">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold text-primary">Transações dos Cartões</h1>
              <p className="text-text-secondary mt-1">Visualize e gerencie todas as transações</p>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors text-[0.65rem]
                  ${showFilters 
                    ? 'bg-primary text-white' 
                    : 'bg-card-bg text-text-primary hover:bg-card-bg/80'
                  }
                `}
              >
                <FunnelIcon className="w-4 h-4" />
                Filtros
              </button>

              <button
                onClick={fetchTransactions}
                className="flex items-center gap-2 px-3 py-1.5 bg-card-bg text-text-primary rounded-lg hover:bg-card-bg/80 transition-colors text-[0.65rem]"
                disabled={loading}
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="bg-card-bg rounded-xl p-6 mb-8">
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-[0.65rem] text-text-secondary mb-2">
                      Cartão
                    </label>
                    <select
                      value={filters.cardId}
                      onChange={(e) => setFilters({ ...filters, cardId: e.target.value })}
                      className="w-full bg-background border border-divider rounded-lg px-3 py-1.5 text-[0.65rem]"
                    >
                      <option value="">Todos os cartões</option>
                      {cards.map((card) => (
                        <option key={card.id} value={card.id}>
                          {card.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[0.65rem] text-text-secondary mb-2">
                      Categoria
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full bg-background border border-divider rounded-lg px-3 py-1.5 text-[0.65rem]"
                    >
                      <option value="">Todas as categorias</option>
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[0.65rem] text-text-secondary mb-2">
                        Valor Mínimo
                      </label>
                      <input
                        type="number"
                        value={filters.minValue}
                        onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
                        placeholder="R$ 0,00"
                        className="w-full bg-background border border-divider rounded-lg px-3 py-1.5 text-[0.65rem]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.65rem] text-text-secondary mb-2">
                        Valor Máximo
                      </label>
                      <input
                        type="number"
                        value={filters.maxValue}
                        onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })}
                        placeholder="R$ 0,00"
                        className="w-full bg-background border border-divider rounded-lg px-3 py-1.5 text-[0.65rem]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[0.65rem] text-text-secondary mb-2">
                        Data Inicial
                      </label>
                      <input
                        type="date"
                        value={filters.startDate}
                        onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                        className="w-full bg-background border border-divider rounded-lg px-3 py-1.5 text-[0.65rem]"
                      />
                    </div>
                    <div>
                      <label className="block text-[0.65rem] text-text-secondary mb-2">
                        Data Final
                      </label>
                      <input
                        type="date"
                        value={filters.endDate}
                        onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                        className="w-full bg-background border border-divider rounded-lg px-3 py-1.5 text-[0.65rem]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.fixed}
                      onChange={(e) => setFilters({ ...filters, fixed: e.target.checked })}
                      className="rounded border-divider text-primary focus:ring-primary"
                    />
                    <span className="text-[0.65rem] text-text-primary">Fixas</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={filters.recurring}
                      onChange={(e) => setFilters({ ...filters, recurring: e.target.checked })}
                      className="rounded border-divider text-primary focus:ring-primary"
                    />
                    <span className="text-[0.65rem] text-text-primary">Recorrentes</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Lista de Transações */}
          <div className="bg-card-bg rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="text-left">
                    <th className="p-4 text-[0.65rem] font-medium text-text-secondary">Data</th>
                    <th className="p-4 text-[0.65rem] font-medium text-text-secondary">Vencimento</th>
                    <th className="p-4 text-[0.65rem] font-medium text-text-secondary">Categoria</th>
                    <th className="p-4 text-[0.65rem] font-medium text-text-secondary">Descrição</th>
                    <th className="p-4 text-[0.65rem] font-medium text-text-secondary">Valor</th>
                    <th className="p-4 text-[0.65rem] font-medium text-text-secondary">Cartão</th>
                    <th className="p-4 text-[0.65rem] font-medium text-text-secondary">Recorrência</th>
                    <th className="p-4 text-[0.65rem] font-medium text-text-secondary">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center p-8 text-[0.65rem] text-text-secondary">
                        Carregando transações...
                      </td>
                    </tr>
                  ) : transactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center p-8 text-[0.65rem] text-text-secondary">
                        Nenhuma transação encontrada
                      </td>
                    </tr>
                  ) : (
                    transactions.map((transaction) => (
                      <tr key={transaction.id} className="border-b border-divider">
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-[0.65rem] text-text-primary">
                              {formatDate(transaction.date)}
                            </span>
                            <span className="text-[0.6rem] text-text-secondary">
                              Venc: {formatDate(transaction.dueDate)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-[0.65rem] text-text-primary">
                          {formatDate(transaction.dueDate)}
                        </td>
                        <td className="p-4 text-[0.65rem] text-text-primary">
                          {transaction.category}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-[0.65rem] text-text-primary">{transaction.description}</span>
                            {transaction.installments && transaction.installments > 1 && (
                              <span className="text-[0.6rem] text-text-secondary">
                                Parcelado {transaction.installments}x
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-right text-[0.65rem] text-expense font-medium">
                          {formatCurrency(transaction.value)}
                        </td>
                        <td className="p-4 text-[0.65rem] text-text-primary">
                          {transaction.cardName}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-[0.65rem] text-text-primary">
                          {transaction.fixed && (
                            <div className="flex items-center gap-3">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={!transaction.endRecurrenceDate}
                                  onChange={() => handleToggleRecurring(transaction)}
                                  className="sr-only peer"
                                />
                                <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-primary after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
                              </label>
                              <span className="text-[0.65rem]">
                                {!transaction.endRecurrenceDate ? 'Recorrente' : 'Não Recorrente'}
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleEdit(transaction)}
                              className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                              title="Editar"
                            >
                              <PencilSquareIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingTransaction(transaction)}
                              className="p-1 text-text-secondary hover:text-expense transition-colors"
                              title="Excluir"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de Edição */}
      {editingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card-bg rounded-xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Editar Transação</h3>
              <button
                onClick={() => setEditingTransaction(null)}
                className="text-text-secondary hover:text-text-primary"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Descrição
                </label>
                <input
                  type="text"
                  value={editingTransaction.description || ''}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    description: e.target.value
                  })}
                  className="w-full bg-background border border-divider rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-2">
                  Valor
                </label>
                <input
                  type="number"
                  value={Number(editingTransaction.value)}
                  onChange={(e) => setEditingTransaction({
                    ...editingTransaction,
                    value: parseFloat(e.target.value)
                  })}
                  className="w-full bg-background border border-divider rounded-lg px-4 py-2"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Data da Compra
                  </label>
                  <input
                    type="date"
                    value={editingTransaction.date.split('T')[0]}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction,
                      date: new Date(e.target.value).toISOString()
                    })}
                    className="w-full bg-background border border-divider rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Data de Vencimento
                  </label>
                  <input
                    type="date"
                    value={editingTransaction.dueDate.split('T')[0]}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction,
                      dueDate: new Date(e.target.value).toISOString()
                    })}
                    className="w-full bg-background border border-divider rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={editingTransaction.category}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction,
                      category: e.target.value
                    })}
                    className="w-full bg-background border border-divider rounded-lg px-4 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Subcategoria
                  </label>
                  <input
                    type="text"
                    value={editingTransaction.subcategory}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction,
                      subcategory: e.target.value
                    })}
                    className="w-full bg-background border border-divider rounded-lg px-4 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Parcelas
                  </label>
                  <input
                    type="number"
                    value={editingTransaction.installments || ''}
                    onChange={(e) => setEditingTransaction({
                      ...editingTransaction,
                      installments: e.target.value ? parseInt(e.target.value) : undefined
                    })}
                    min="1"
                    className="w-full bg-background border border-divider rounded-lg px-4 py-2"
                  />
                </div>
                <div className="flex items-center">
                  {editingTransaction.installments && editingTransaction.installments > 1 && (
                    <span className="px-2 py-1 text-xs bg-warning/10 text-warning rounded-full">
                      Parcelado {editingTransaction.installments}x
                    </span>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setEditingTransaction(null)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleUpdateTransaction({
                    description: editingTransaction.description,
                    value: editingTransaction.value,
                    date: editingTransaction.date,
                    dueDate: editingTransaction.dueDate,
                    category: editingTransaction.category,
                    subcategory: editingTransaction.subcategory,
                    installments: editingTransaction.installments,
                    fixed: editingTransaction.fixed,
                    recurring: editingTransaction.recurring
                  })}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {deletingTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card-bg rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium">Confirmar Exclusão</h3>
              <button
                onClick={() => setDeletingTransaction(null)}
                className="text-text-secondary hover:text-text-primary"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <p className="text-text-primary">
                {(deletingTransaction.installments && deletingTransaction.installments > 1) || deletingTransaction.fixed
                  ? "Ao confirmar a exclusão, essa despesa e todas as suas parcelas serão excluídas de todas as faturas, deseja continuar?"
                  : "Tem certeza que deseja excluir esta transação?"
                }
              </p>

              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={() => setDeletingTransaction(null)}
                  className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deletingTransaction.id)}
                  className="px-4 py-2 bg-expense text-white rounded-lg hover:bg-expense/90 transition-colors"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Fim de Recorrência */}
      {recurrenceModalTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-text-primary">
              Qual a última fatura que a despesa deve vir?
            </h2>
            <p className="text-red-600 font-bold mb-4">
              Atenção! A despesa virá até a fatura com vencimento no mês selecionado
            </p>
            <div className="mb-4 flex items-center space-x-2">
              <button 
                onClick={handlePrevRecurrenceMonth}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                disabled={currentRecurrenceMonth === 0}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="flex-grow text-center">
                <span className="text-lg font-semibold text-text-primary">
                  {new Date(endRecurrenceDate).toLocaleDateString('pt-BR', { 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </span>
              </div>
              <button 
                onClick={handleNextRecurrenceMonth}
                className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <div className="flex justify-end gap-4">
              <button 
                onClick={() => setRecurrenceModalTransaction(null)}
                className="px-4 py-2 text-text-primary hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  if (recurrenceModalTransaction) {
                    handleEndRecurrence(recurrenceModalTransaction.id, endRecurrenceDate);
                    setRecurrenceModalTransaction(null);
                  }
                }}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}