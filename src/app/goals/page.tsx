"use client";

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import {
  PlusIcon,
  EllipsisHorizontalIcon,
  FlagIcon,
  CalendarIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  color: string;
}

const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Viagem para Europa',
    targetAmount: 15000,
    currentAmount: 5000,
    deadline: new Date('2024-12-31'),
    color: '#7B61FF',
  },
  {
    id: '2',
    title: 'Entrada do Apartamento',
    targetAmount: 50000,
    currentAmount: 30000,
    deadline: new Date('2025-06-30'),
    color: '#3FBC8B',
  },
  {
    id: '3',
    title: 'Fundo de Emergência',
    targetAmount: 20000,
    currentAmount: 15000,
    deadline: new Date('2024-06-30'),
    color: '#FFB547',
  },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState(mockGoals);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  const calculateProgress = (current: number, target: number) => {
    return (current / target) * 100;
  };

  const calculateMonthlyTarget = (goal: Goal) => {
    const today = new Date();
    const monthsLeft = (goal.deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30);
    const remaining = goal.targetAmount - goal.currentAmount;
    return remaining / monthsLeft;
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
              <h1 className="text-2xl font-bold mb-1">Objetivos Financeiros</h1>
              <p className="text-text-secondary">
                Planeje e acompanhe suas metas financeiras
              </p>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors">
              <PlusIcon className="w-5 h-5" />
              Novo Objetivo
            </button>
          </div>

          {/* Resumo */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            <div className="bg-card-bg p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-2">Total em Objetivos</h3>
              <p className="text-3xl font-bold">
                {formatCurrency(
                  goals.reduce((acc, goal) => acc + goal.targetAmount, 0)
                )}
              </p>
            </div>
            <div className="bg-card-bg p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-2">Total Acumulado</h3>
              <p className="text-3xl font-bold">
                {formatCurrency(
                  goals.reduce((acc, goal) => acc + goal.currentAmount, 0)
                )}
              </p>
            </div>
            <div className="bg-card-bg p-6 rounded-xl">
              <h3 className="text-lg font-medium mb-2">Objetivos Ativos</h3>
              <p className="text-3xl font-bold">{goals.length}</p>
            </div>
          </div>

          {/* Lista de Objetivos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {goals.map((goal) => (
              <div
                key={goal.id}
                className="bg-card-bg rounded-xl p-6 hover:ring-1 hover:ring-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                      style={{ backgroundColor: `${goal.color}20` }}
                    >
                      <FlagIcon
                        className="w-6 h-6"
                        style={{ color: goal.color }}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium">{goal.title}</h4>
                      <span className="text-sm text-text-secondary">
                        {/* category */}
                      </span>
                    </div>
                  </div>
                  <button
                    className="text-text-secondary hover:text-text-primary transition-colors p-1 -mr-1"
                    aria-label="Editar meta"
                  >
                    <EllipsisHorizontalIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-text-secondary">Progresso</span>
                    <div className="flex items-end gap-2">
                      <p className="text-2xl font-bold text-text-primary break-all">
                        {formatCurrency(goal.currentAmount)}
                      </p>
                      <p className="text-sm text-text-secondary mb-1">
                        de {formatCurrency(goal.targetAmount)}
                      </p>
                    </div>
                    <div className="mt-2 bg-background rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (goal.currentAmount / goal.targetAmount) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between text-sm">
                    <div>
                      <span className="block text-text-secondary">Data Limite</span>
                      <span className="text-text-primary">
                        {formatDate(goal.deadline)}
                      </span>
                    </div>
                    <div>
                      <span className="block text-text-secondary">Faltam</span>
                      <span className="text-text-primary">
                        {/* getRemainingDays(goal.deadline) */} dias
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      className="flex-1 px-3 py-2 text-sm bg-background rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Análise
                    </button>
                    <button
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