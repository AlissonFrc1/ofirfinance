"use client";

import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
  ChartData
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface CreditCard {
  id: string;
  name: string;
  expenses?: Expense[];
}

interface Expense {
  id: string;
  value: number;
  date: string;
  category: string;
  subcategory?: string;
  description?: string;
  installments?: number;
  fixed: boolean;
  recurring: boolean;
  currentInstallment?: number;
  dueDate?: string;
  endRecurrenceDate?: string;
}

interface AllCardsExpensePieChartProps {
  cards: CreditCard[];
  selectedMonth: number;
  selectedYear: number;
}

export function AllCardsExpensePieChart({ 
  cards = [], 
  selectedMonth, 
  selectedYear 
}: AllCardsExpensePieChartProps) {
  const calculateInstallmentValue = (expense: Expense, currentDate: Date) => {
    // Verificar se a despesa está dentro do período de recorrência
    if (expense.endRecurrenceDate) {
      const endRecurrence = new Date(expense.endRecurrenceDate);
      if (currentDate > endRecurrence) return 0;
    }

    // Despesas fixas sempre incluídas
    if (expense.fixed) return Number(expense.value);

    // Nova lógica considerando dueDate
    const dueDate = expense.dueDate ? new Date(expense.dueDate) : new Date(expense.date);
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    // Verificar se a data de vencimento está no intervalo do mês atual
    if (dueDate >= startOfMonth && dueDate <= endOfMonth) {
      // Para despesas parceladas
      if (expense.installments && expense.installments > 1) {
        return Number(expense.value) / expense.installments;
      }
      
      // Despesas não parceladas
      return Number(expense.value);
    }

    return 0;
  };

  const expensesByCategory = useMemo(() => {
    const currentDate = new Date(selectedYear, selectedMonth, 1);
    const categoryTotals: { [key: string]: number } = {};

    // Agregar despesas de todos os cartões
    cards.forEach(card => {
      card.expenses?.forEach(expense => {
        const value = calculateInstallmentValue(expense, currentDate);
        
        if (value > 0) {
          const category = expense.category || 'Outros';
          categoryTotals[category] = (categoryTotals[category] || 0) + value;
        }
      });
    });

    return categoryTotals;
  }, [cards, selectedMonth, selectedYear]);

  const pieData: ChartData<'pie'> = {
    labels: Object.keys(expensesByCategory),
    datasets: [{
      data: Object.values(expensesByCategory),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
      ],
      hoverBackgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF'
      ]
    }]
  };

  const options: ChartOptions<'pie'> = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a, b) => Number(a) + Number(b), 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: R$ ${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    }
  };

  // Não renderizar se não houver dados
  if (Object.keys(expensesByCategory).length === 0) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-500">
        Sem despesas para o mês selecionado
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center">
        Despesas por Categoria - {new Date(selectedYear, selectedMonth).toLocaleString('default', { month: 'long', year: 'numeric' })}
      </h2>
      <Pie data={pieData} options={options} />
    </div>
  );
}
