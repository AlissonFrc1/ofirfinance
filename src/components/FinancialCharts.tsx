"use client";

import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ChartData {
  date: string;
  income: number;
  expenses: number;
  balance: number;
}

interface CategoryData {
  name: string;
  value: number;
}

interface FinancialChartsProps {
  monthlyData: ChartData[];
  expensesByCategory: CategoryData[];
  incomeByCategory: CategoryData[];
}

const COLORS = {
  income: '#3FBC8B',
  expense: '#FF5E57',
  balance: '#7B61FF',
};

const CATEGORY_COLORS = [
  '#7B61FF',
  '#FF5E57',
  '#3FBC8B',
  '#FFB547',
  '#3B82F6',
  '#EC4899',
  '#8B5CF6',
  '#10B981',
];

export function FinancialCharts({
  monthlyData,
  expensesByCategory,
  incomeByCategory,
}: FinancialChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Gráfico de Evolução */}
      <div className="col-span-12 bg-card-bg p-6 rounded-xl">
        <h3 className="text-lg font-medium mb-6">Evolução Financeira</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#272739" />
              <XAxis
                dataKey="date"
                stroke="#A0A0A0"
                tick={{ fill: '#A0A0A0' }}
              />
              <YAxis
                stroke="#A0A0A0"
                tick={{ fill: '#A0A0A0' }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1E2F',
                  border: 'none',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#FFFFFF' }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke={COLORS.balance}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke={COLORS.income}
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="expenses"
                stroke={COLORS.expense}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Despesas por Categoria */}
      <div className="col-span-6 bg-card-bg p-6 rounded-xl">
        <h3 className="text-lg font-medium mb-6">Despesas por Categoria</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={expensesByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {expensesByCategory.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1E2F',
                  border: 'none',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráfico de Receitas por Categoria */}
      <div className="col-span-6 bg-card-bg p-6 rounded-xl">
        <h3 className="text-lg font-medium mb-6">Receitas por Categoria</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={incomeByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {incomeByCategory.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1E1E2F',
                  border: 'none',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
} 