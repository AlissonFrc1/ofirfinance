"use client";

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MonthYearPicker } from '@/components/MonthYearPicker';
import {
  ChartBarIcon,
  ArrowPathIcon,
  CreditCardIcon,
  BanknotesIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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
}

interface Card {
  id: string;
  name: string;
  limit: number;
  brand: string;
}

interface Transaction {
  id: string;
  value: number;
  date: string;
  category: string;
  subcategory: string;
  description?: string;
  type: 'expense' | 'income';
  paid?: boolean;
  received?: boolean;
  recurring: boolean;
  fixed: boolean;
  installments?: number;
  dueDay?: number;
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [cards, setCards] = useState<Card[]>([]);
  const [cardTransactions, setCardTransactions] = useState<CardExpense[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  // Buscar dados
  useEffect(() => {
    fetchData();
  }, [selectedMonth, selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Buscar cartões
      const cardsResponse = await fetch('/api/cards');
      if (!cardsResponse.ok) throw new Error('Erro ao buscar cartões');
      const cardsData = await cardsResponse.json();
      setCards(cardsData);

      // Buscar transações de cartão
      const startDate = new Date(selectedYear, selectedMonth, 1);
      const endDate = new Date(selectedYear, selectedMonth + 1, 0);
      
      const cardTransactionsResponse = await fetch(
        `/api/cards/transactions?startDate=${startDate.toISOString()}&endDate=${new Date(endDate.getTime() + (24 * 60 * 60 * 1000)).toISOString()}`
      );
      if (!cardTransactionsResponse.ok) throw new Error('Erro ao buscar transações de cartão');
      const cardTransactionsData = await cardTransactionsResponse.json();
      setCardTransactions(cardTransactionsData);

      // Buscar transações gerais (receitas e despesas)
      const transactionsResponse = await fetch(
        `/api/transactions/history?startDate=${startDate.toISOString()}&endDate=${new Date(endDate.getTime() + (24 * 60 * 60 * 1000)).toISOString()}`
      );
      if (!transactionsResponse.ok) throw new Error('Erro ao buscar transações');
      const transactionsData = await transactionsResponse.json();
      setTransactions(transactionsData);

      // Gerar análise
      generateAiAnalysis(cardsData, cardTransactionsData, transactionsData);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
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

  const generateAiAnalysis = async (cardsData: Card[], cardTransactionsData: CardExpense[], transactionsData: Transaction[]) => {
    setLoadingAnalysis(true);
    try {
      const totalGastoCartoes = cardTransactionsData.reduce((total, t) => total + Number(t.value), 0);
      const totalReceitas = transactionsData
        .filter(t => t.type === 'income')
        .reduce((total, t) => total + Number(t.value), 0);
      const totalDespesas = transactionsData
        .filter(t => t.type === 'expense')
        .reduce((total, t) => total + Number(t.value), 0);
      const totalGeral = totalReceitas - (totalDespesas + totalGastoCartoes);
      const limiteTotal = cardsData.reduce((total, card) => total + Number(card.limit), 0);
      
      const categoriasDespesas = [...cardTransactionsData, ...transactionsData.filter(t => t.type === 'expense')]
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.value);
          return acc;
        }, {} as Record<string, number>);

      const categoriasReceitas = transactionsData
        .filter(t => t.type === 'income')
        .reduce((acc, t) => {
          acc[t.category] = (acc[t.category] || 0) + Number(t.value);
          return acc;
        }, {} as Record<string, number>);

      const dadosAnalise = {
        periodo: `${selectedMonth + 1}/${selectedYear}`,
        total_receitas: formatCurrency(totalReceitas),
        total_despesas: formatCurrency(totalDespesas + totalGastoCartoes),
        saldo_geral: formatCurrency(totalGeral),
        percentual_comprometido: ((totalDespesas + totalGastoCartoes) / totalReceitas * 100).toFixed(1) + '%',
        limite_total_cartoes: formatCurrency(limiteTotal),
        percentual_limite_usado: ((totalGastoCartoes / limiteTotal) * 100).toFixed(1) + '%',
        total_cartoes: cardsData.length,
        categorias_despesas: Object.entries(categoriasDespesas).map(([categoria, valor]) => ({
          categoria,
          valor: formatCurrency(valor),
          percentual: ((valor / (totalDespesas + totalGastoCartoes)) * 100).toFixed(1) + '%'
        })),
        categorias_receitas: Object.entries(categoriasReceitas).map(([categoria, valor]) => ({
          categoria,
          valor: formatCurrency(valor),
          percentual: ((valor / totalReceitas) * 100).toFixed(1) + '%'
        })),
        transacoes_parceladas: cardTransactionsData.filter(t => t.installments && t.installments > 1).length,
        transacoes_fixas: [...cardTransactionsData, ...transactionsData].filter(t => t.fixed).length,
        transacoes_recorrentes: [...cardTransactionsData, ...transactionsData].filter(t => t.recurring).length
      };

      // Gerar análise com IA
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dadosAnalise),
      });

      if (!response.ok) throw new Error('Erro ao gerar análise');
      const { analysis } = await response.json();
      setAiAnalysis(analysis);
    } catch (error) {
      console.error('Erro ao gerar análise:', error);
      setAiAnalysis('Não foi possível gerar a análise no momento. Por favor, tente novamente mais tarde.');
    } finally {
      setLoadingAnalysis(false);
    }
  };

  // Dados para os gráficos
  const getCategoryData = () => {
    const categoryTotals = [...cardTransactions, ...transactions.filter(t => t.type === 'expense')]
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.value);
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(categoryTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / (cardTransactions.reduce((total, t) => total + Number(t.value), 0) + 
          transactions.filter(t => t.type === 'expense').reduce((total, t) => total + Number(t.value), 0))) * 100
      }))
      .sort((a, b) => b.value - a.value);
  };

  const getIncomeData = () => {
    const incomeTotals = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + Number(t.value);
        return acc;
      }, {} as Record<string, number>);

    return Object.entries(incomeTotals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: (value / transactions
          .filter(t => t.type === 'income')
          .reduce((total, t) => total + Number(t.value), 0)) * 100
      }))
      .sort((a, b) => b.value - a.value);
  };

  const COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
    '#D4A5A5', '#9E579D', '#574B90', '#303952', '#FC427B'
  ];

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header userName="João Silva" notificationCount={2} />
      <main className="absolute left-0 md:left-[280px] right-0 pt-20 px-4">
        <div className="max-w-[1200px] mx-auto">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">Dashboard Financeiro</h1>
              <p className="text-text-secondary">
                Análise completa dos seus gastos e receitas
              </p>
            </div>

            <div className="flex items-center gap-4">
              <MonthYearPicker
                selectedMonth={selectedMonth}
                selectedYear={selectedYear}
                onChange={(month, year) => {
                  setSelectedMonth(month);
                  setSelectedYear(year);
                }}
              />

              <button
                onClick={fetchData}
                className="flex items-center gap-2 px-4 py-2 bg-card-bg text-text-primary rounded-lg hover:bg-card-bg/80 transition-colors"
                disabled={loading}
              >
                <ArrowPathIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-text-secondary">Carregando dados...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Resumo */}
              <div className="grid grid-cols-4 gap-6">
                <div className="bg-card-bg p-6 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                      <BanknotesIcon className="w-6 h-6 text-success" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Receitas</h3>
                      <p className="text-2xl font-bold text-success">
                        {formatCurrency(
                          transactions
                            .filter(t => t.type === 'income')
                            .reduce((total, t) => total + Number(t.value), 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card-bg p-6 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-expense/10 flex items-center justify-center">
                      <ArrowTrendingDownIcon className="w-6 h-6 text-expense" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Despesas</h3>
                      <p className="text-2xl font-bold text-expense">
                        {formatCurrency(
                          cardTransactions.reduce((total, t) => total + Number(t.value), 0) +
                          transactions
                            .filter(t => t.type === 'expense')
                            .reduce((total, t) => total + Number(t.value), 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card-bg p-6 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <ArrowTrendingUpIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Saldo</h3>
                      <p className={`text-2xl font-bold ${
                        transactions
                          .filter(t => t.type === 'income')
                          .reduce((total, t) => total + Number(t.value), 0) -
                        (cardTransactions.reduce((total, t) => total + Number(t.value), 0) +
                        transactions
                          .filter(t => t.type === 'expense')
                          .reduce((total, t) => total + Number(t.value), 0)) >= 0
                          ? 'text-success'
                          : 'text-expense'
                      }`}>
                        {formatCurrency(
                          transactions
                            .filter(t => t.type === 'income')
                            .reduce((total, t) => total + Number(t.value), 0) -
                          (cardTransactions.reduce((total, t) => total + Number(t.value), 0) +
                          transactions
                            .filter(t => t.type === 'expense')
                            .reduce((total, t) => total + Number(t.value), 0))
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-card-bg p-6 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                      <CalendarIcon className="w-6 h-6 text-warning" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Total de Transações</h3>
                      <p className="text-2xl font-bold">
                        {cardTransactions.length + transactions.length}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gráficos */}
              <div className="grid grid-cols-2 gap-8">
                {/* Gastos por Categoria */}
                <div className="bg-card-bg rounded-xl p-6">
                  <h3 className="text-lg font-medium mb-6">Gastos por Categoria</h3>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getCategoryData()}
                          cx="50%"
                          cy="50%"
                          innerRadius="70%"
                          outerRadius="100%"
                          dataKey="value"
                        >
                          {getCategoryData().map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Receitas por Categoria */}
                <div className="bg-card-bg rounded-xl p-6">
                  <h3 className="text-lg font-medium mb-6">Receitas por Categoria</h3>
                  <div style={{ height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={getIncomeData()}
                          cx="50%"
                          cy="50%"
                          innerRadius="70%"
                          outerRadius="100%"
                          dataKey="value"
                        >
                          {getIncomeData().map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Análise IA */}
              <div className="bg-card-bg rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <SparklesIcon className="w-6 h-6 text-primary" />
                    <h3 className="text-lg font-medium">Análise Inteligente</h3>
                  </div>
                  <button
                    onClick={() => generateAiAnalysis(cards, cardTransactions, transactions)}
                    className="flex items-center gap-2 px-4 py-2 bg-background text-text-primary rounded-lg hover:bg-background/80 transition-colors"
                    disabled={loadingAnalysis}
                  >
                    <ArrowPathIcon className={`w-5 h-5 ${loadingAnalysis ? 'animate-spin' : ''}`} />
                    Atualizar Análise
                  </button>
                </div>

                {loadingAnalysis ? (
                  <p className="text-text-secondary">Gerando análise...</p>
                ) : aiAnalysis ? (
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-line">
                      {aiAnalysis}
                    </div>
                  </div>
                ) : (
                  <p className="text-text-secondary">Nenhuma análise disponível</p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 