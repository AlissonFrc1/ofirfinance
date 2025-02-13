"use client";

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import {
  PlusIcon,
  EllipsisHorizontalIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface Budget {
  id: string;
  name: string;
  category: string;
  limit: number;
  currentAmount: number;
  dailyAverage: number;
  color: string;
}

const mockBudgets: Budget[] = [
  {
    id: '1',
    name: 'Moradia',
    category: 'Moradia',
    limit: 2000,
    currentAmount: 1500,
    dailyAverage: 50,
    color: '#7B61FF',
  },
  {
    id: '2',
    name: 'Alimentação',
    category: 'Alimentação',
    limit: 1000,
    currentAmount: 800,
    dailyAverage: 30,
    color: '#FF5E57',
  },
  {
    id: '3',
    name: 'Transporte',
    category: 'Transporte',
    limit: 500,
    currentAmount: 400,
    dailyAverage: 20,
    color: '#3FBC8B',
  },
  {
    id: '4',
    name: 'Lazer',
    category: 'Lazer',
    limit: 400,
    currentAmount: 300,
    dailyAverage: 15,
    color: '#FFB547',
  },
];

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState(mockBudgets);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(null);
  const [showHistory, setShowHistory] = useState(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
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
              <h1 className="text-2xl font-bold mb-1">Orçamentos</h1>
              <p className="text-text-secondary">
                Defina limites para suas despesas
              </p>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <PlusIcon className="w-5 h-5" />
              Novo Orçamento
            </button>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-card-bg p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-2">Total Orçado</h3>
              <p className="text-3xl font-bold">
                {formatCurrency(
                  budgets.reduce((acc, budget) => acc + budget.limit, 0)
                )}
              </p>
            </div>
            <div className="bg-card-bg p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-2">Total Gasto</h3>
              <p className="text-3xl font-bold">
                {formatCurrency(
                  budgets.reduce((acc, budget) => acc + budget.currentAmount, 0)
                )}
              </p>
            </div>
            <div className="bg-card-bg p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-2">Orçamentos Ativos</h3>
              <p className="text-3xl font-bold">{budgets.length}</p>
            </div>
          </div>

          {/* Lista de Orçamentos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {budgets.map((budget) => (
              <div
                key={budget.id}
                className="bg-card-bg rounded-xl p-6 hover:ring-1 hover:ring-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                      style={{ backgroundColor: `${budget.color}20` }}
                    >
                      <ChartBarIcon
                        className="w-6 h-6"
                        style={{ color: budget.color }}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium">{budget.name}</h4>
                      <span className="text-sm text-text-secondary">
                        {budget.category}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingBudget(budget)}
                    className="text-text-secondary hover:text-text-primary transition-colors p-1 -mr-1"
                    aria-label="Editar orçamento"
                  >
                    <EllipsisHorizontalIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-text-secondary">Gasto no Mês</span>
                    <div className="flex items-end gap-2">
                      <p className="text-2xl font-bold text-text-primary break-all">
                        {formatCurrency(budget.currentAmount)}
                      </p>
                      <p className="text-sm text-text-secondary mb-1">
                        de {formatCurrency(budget.limit)}
                      </p>
                    </div>
                    <div className="mt-2 bg-background rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (budget.currentAmount / budget.limit) * 100,
                            100
                          )}%`,
                          backgroundColor:
                            budget.currentAmount > budget.limit
                              ? '#ef4444'
                              : budget.color,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="block text-text-secondary">Média Diária</span>
                      <span className="text-text-primary">
                        {formatCurrency(budget.dailyAverage)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-text-secondary">Restante</span>
                      <span className="text-text-primary">
                        {formatCurrency(Math.max(budget.limit - budget.currentAmount, 0))}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      onClick={() => {
                        console.log('Abrindo análise para o orçamento:', {
                          budgetId: budget.id,
                          budgetName: budget.name
                        });
                        setShowAnalysis(budget.id);
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-background rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Análise
                    </button>
                    <button
                      onClick={() => {
                        console.log('Abrindo histórico para o orçamento:', {
                          budgetId: budget.id,
                          budgetName: budget.name
                        });
                        setShowHistory(budget.id);
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-background rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Histórico
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}