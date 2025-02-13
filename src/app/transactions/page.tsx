"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import {
  FunnelIcon,
  ArrowPathIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';
import { CATEGORIES } from '@/components/TransactionForm';

interface Transaction {
  id: string;
  type: 'expense' | 'income';
  value: number;
  date: string;
  category: string;
  subcategory: string;
  description?: string;
  status: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    type: '',
    category: '',
    status: '',
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date' as keyof Transaction,
    direction: 'desc' as 'asc' | 'desc',
  });

  useEffect(() => {
    fetchTransactions();
  }, [filters]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/transactions/history?${queryParams}`);
      if (!response.ok) throw new Error('Erro ao buscar transações');
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
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

  const handleSort = (key: keyof Transaction) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const getSortedTransactions = () => {
    const sorted = [...transactions].sort((a, b) => {
      if (sortConfig.key === 'value') {
        return sortConfig.direction === 'asc'
          ? Number(a[sortConfig.key]) - Number(b[sortConfig.key])
          : Number(b[sortConfig.key]) - Number(a[sortConfig.key]);
      }
      
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'asc'
          ? new Date(a[sortConfig.key]).getTime() - new Date(b[sortConfig.key]).getTime()
          : new Date(b[sortConfig.key]).getTime() - new Date(a[sortConfig.key]).getTime();
      }
      
      return sortConfig.direction === 'asc'
        ? String(a[sortConfig.key]).localeCompare(String(b[sortConfig.key]))
        : String(b[sortConfig.key]).localeCompare(String(a[sortConfig.key]));
    });
    return sorted;
  };

  const SortIcon = ({ columnKey }: { columnKey: keyof Transaction }) => {
    if (sortConfig.key !== columnKey) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4" />
    ) : (
      <ChevronDownIcon className="w-4 h-4" />
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header userName="João Silva" notificationCount={2} />
      <main className="absolute left-0 md:left-[280px] right-0 pt-20 px-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">Transações</h1>
              <p className="text-text-secondary">
                Visualize e gerencie suas transações
              </p>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-divider rounded-lg text-text-primary hover:bg-card-bg transition-colors"
              >
                <FunnelIcon className="w-5 h-5" />
                Filtros
              </button>
              <button
                onClick={fetchTransactions}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <ArrowPathIcon className="w-5 h-5" />
                Atualizar
              </button>
            </div>
          </div>

          {/* Filtros */}
          {showFilters && (
            <div className="bg-card-bg rounded-xl p-6 mb-8">
              <div className="grid grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) =>
                      setFilters({ ...filters, startDate: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background border border-divider rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) =>
                      setFilters({ ...filters, endDate: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background border border-divider rounded-lg focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Tipo
                  </label>
                  <select
                    value={filters.type}
                    onChange={(e) =>
                      setFilters({ ...filters, type: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background border border-divider rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="">Todos</option>
                    <option value="expense">Despesas</option>
                    <option value="income">Receitas</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Categoria
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) =>
                      setFilters({ ...filters, category: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background border border-divider rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="">Todas</option>
                    {[...CATEGORIES.expense, ...CATEGORIES.income].map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-2">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) =>
                      setFilters({ ...filters, status: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-background border border-divider rounded-lg focus:outline-none focus:border-primary"
                  >
                    <option value="">Todos</option>
                    <option value="paid">Pago/Recebido</option>
                    <option value="pending">Pendente</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Tabela */}
          <div className="bg-card-bg rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-divider">
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-text-secondary cursor-pointer"
                      onClick={() => handleSort('date')}
                    >
                      <div className="flex items-center gap-2">
                        Data
                        <SortIcon columnKey="date" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-text-secondary cursor-pointer"
                      onClick={() => handleSort('type')}
                    >
                      <div className="flex items-center gap-2">
                        Tipo
                        <SortIcon columnKey="type" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-text-secondary cursor-pointer"
                      onClick={() => handleSort('category')}
                    >
                      <div className="flex items-center gap-2">
                        Categoria
                        <SortIcon columnKey="category" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-text-secondary cursor-pointer"
                      onClick={() => handleSort('subcategory')}
                    >
                      <div className="flex items-center gap-2">
                        Subcategoria
                        <SortIcon columnKey="subcategory" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-text-secondary cursor-pointer"
                      onClick={() => handleSort('value')}
                    >
                      <div className="flex items-center gap-2">
                        Valor
                        <SortIcon columnKey="value" />
                      </div>
                    </th>
                    <th
                      className="px-6 py-4 text-left text-sm font-medium text-text-secondary cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <SortIcon columnKey="status" />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-text-secondary">
                        Carregando transações...
                      </td>
                    </tr>
                  ) : getSortedTransactions().length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-text-secondary">
                        Nenhuma transação encontrada.
                      </td>
                    </tr>
                  ) : (
                    getSortedTransactions().map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-divider hover:bg-background/50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.type === 'income'
                                ? 'bg-success/10 text-success'
                                : 'bg-expense/10 text-expense'
                            }`}
                          >
                            {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">{transaction.category}</td>
                        <td className="px-6 py-4 text-sm">{transaction.subcategory}</td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={
                              transaction.type === 'income'
                                ? 'text-success'
                                : 'text-expense'
                            }
                          >
                            {formatCurrency(Number(transaction.value))}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              transaction.status === 'Pendente'
                                ? 'bg-warning/10 text-warning'
                                : 'bg-success/10 text-success'
                            }`}
                          >
                            {transaction.status}
                          </span>
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
    </div>
  );
} 