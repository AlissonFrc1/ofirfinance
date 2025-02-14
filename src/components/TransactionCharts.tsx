"use client";

import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useTransactions } from "@/hooks/useTransactions";

const COLORS = ["#3FBC8B", "#D14D72", "#FFB547", "#0A4D68", "#C4A962"];

export function TransactionCharts() {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calcula startDate e endDate com base no mês e ano selecionados
  const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`;
  const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];

  const { transactions, loading, error, totals, byCategory } = useTransactions({
    startDate,
    endDate,
  });

  // Dados para o gráfico de barras (Receitas vs Despesas)
  const barData = [
    {
      name: "Receitas",
      value: totals.income,
      color: "#3FBC8B",
    },
    {
      name: "Despesas",
      value: totals.expenses,
      color: "#D14D72",
    },
  ];

  // Dados para o gráfico de pizza (Despesas por categoria)
  const pieData = Object.entries(byCategory)
    .filter(([_, value]) => value > 0)
    .map(([category, value], index) => ({
      name: category,
      value,
      color: COLORS[index % COLORS.length],
    }));

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-expense">
        Erro ao carregar dados. Por favor, tente novamente.
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Gráfico de Barras */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary mb-6">
          Receitas vs Despesas
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) =>
                  value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                    notation: "compact",
                  })
                }
              />
              <Tooltip
                formatter={(value: number) => [
                  formatCurrency(value),
                  "Valor",
                ]}
              />
              <Bar dataKey="value">
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Pizza */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary mb-6">
          Despesas por Categoria
        </h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({
                  cx,
                  cy,
                  midAngle,
                  innerRadius,
                  outerRadius,
                  percent,
                  name,
                }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

                  return (
                    <text
                      x={x}
                      y={y}
                      fill="white"
                      textAnchor={x > cx ? "start" : "end"}
                      dominantBaseline="central"
                      className="text-xs"
                    >
                      {`${name} (${(percent * 100).toFixed(0)}%)`}
                    </text>
                  );
                }}
                outerRadius={100}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-80 transition-opacity"
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  formatCurrency(value),
                  "Valor",
                ]}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legenda */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          {pieData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-4 h-4 rounded"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-text-secondary">
                {entry.name}: {formatCurrency(entry.value)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 