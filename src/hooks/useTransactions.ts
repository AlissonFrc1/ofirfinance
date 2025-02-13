import { useState, useEffect } from 'react';

interface Transaction {
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
}

interface UseTransactionsProps {
  startDate?: string;
  endDate?: string;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: Error | null;
  totals: {
    income: number;
    expenses: number;
    balance: number;
  };
  byCategory: Record<string, number>;
  cards: {
    id: string;
    name: string;
    brand: string;
    lastDigits: string;
    limit: number;
    dueDay: number;
    closingDay: number;
    color: string;
  }[];
  createTransaction: (data: any) => Promise<void>;
  updateTransaction: (id: string, data: Partial<Transaction>) => Promise<Transaction>;
  mutate: (newTransactions?: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
}

export function useTransactions({
  startDate,
  endDate,
}: UseTransactionsProps = {}): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    fetchTransactions();
    fetchCards();
  }, [startDate, endDate]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (startDate && endDate) {
        queryParams.append('startDate', startDate);
        queryParams.append('endDate', endDate);
      }

      const response = await fetch(`/api/transactions/history?${queryParams}`);
      if (!response.ok) throw new Error('Erro ao buscar transações');
      
      const data = await response.json();
      setTransactions(data);
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar transações:', err);
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  };

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards');
      if (!response.ok) throw new Error('Erro ao buscar cartões');
      const data = await response.json();
      setCards(data);
    } catch (err) {
      console.error('Erro ao buscar cartões:', err);
    }
  };

  // Função para criar uma nova transação
  const createTransaction = async (data: any) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar transação');
      }

      const result = await response.json();
      
      // Atualiza a lista de transações
      await fetchTransactions();
      
    } catch (err) {
      console.error('Erro ao criar transação:', err);
      throw new Error('Não foi possível criar a transação. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Função de mutate para atualizar transações
  const mutate = (newTransactions?: Transaction[] | ((prev: Transaction[]) => Transaction[])) => {
    if (typeof newTransactions === 'function') {
      setTransactions(prevTransactions => newTransactions(prevTransactions));
    } else if (newTransactions) {
      setTransactions(newTransactions);
    } else {
      // Se nenhum argumento for passado, recarrega as transações
      fetchTransactions();
    }
  };

  // Função para atualizar uma transação
  const updateTransaction = async (id: string, data: Partial<Transaction>) => {
    try {
      // Encontrar a transação original para obter o tipo
      const transactionToUpdate = transactions.find(t => t.id === id);
      
      if (!transactionToUpdate) {
        throw new Error('Transação não encontrada');
      }

      const updatePayload = {
        ...data,
        type: transactionToUpdate.type
      };

      const response = await fetch(`/api/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatePayload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao atualizar transação');
      }

      const updatedTransaction = await response.json();

      // Atualiza a transação localmente
      mutate(prevTransactions => 
        prevTransactions.map(transaction => 
          transaction.id === id 
            ? { ...transaction, ...updatedTransaction } 
            : transaction
        )
      );

      return updatedTransaction;
    } catch (err) {
      console.error('Erro ao atualizar transação:', err);
      throw err;
    }
  };

  // Calcula os totais
  const calculateTotals = (transactions: Transaction[]) => transactions.reduce(
    (acc, transaction) => {
      const value = Number(transaction.value);
      if (transaction.type === 'income') {
        acc.income += value;
        acc.balance += value;
      } else {
        acc.expenses += value;
        acc.balance -= value;
      }
      return acc;
    },
    { income: 0, expenses: 0, balance: 0 }
  );

  // Calcula os totais por categoria
  const calculateByCategory = (transactions: Transaction[]) => transactions.reduce((acc, transaction) => {
    if (transaction.type !== 'income') {
      acc[transaction.category] = (acc[transaction.category] || 0) + Number(transaction.value);
    }
    return acc;
  }, {} as Record<string, number>);

  return {
    transactions,
    loading,
    error,
    totals: calculateTotals(transactions),
    byCategory: calculateByCategory(transactions),
    cards,
    createTransaction,
    updateTransaction,
    mutate,
  };
} 