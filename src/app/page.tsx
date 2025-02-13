"use client";

import { 
  BanknotesIcon,
  ArrowTrendingUpIcon,
  CreditCardIcon,
  CalendarIcon,
  EllipsisHorizontalIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline'
import { BalanceCard } from '@/components/BalanceCard'
import { RecentTransactions } from '@/components/RecentTransactions'
import { MetricCard } from '@/components/MetricCard'
import { Header } from '@/components/Header'
import { Sidebar } from '@/components/Sidebar'

// Dados mockados para exemplo
const mockTransactions = [
  {
    id: '1',
    description: 'Salário',
    amount: 5000,
    type: 'income' as const,
    category: 'Receita Fixa',
    date: new Date('2024-01-05'),
  },
  {
    id: '2',
    description: 'Aluguel',
    amount: 1500,
    type: 'expense' as const,
    category: 'Moradia',
    date: new Date('2024-01-04'),
  },
  {
    id: '3',
    description: 'Supermercado',
    amount: 450.75,
    type: 'expense' as const,
    category: 'Alimentação',
    date: new Date('2024-01-03'),
  },
  {
    id: '4',
    description: 'Freelance',
    amount: 2000,
    type: 'income' as const,
    category: 'Receita Extra',
    date: new Date('2024-01-02'),
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header userName="João Silva" notificationCount={2} />
      <main className="absolute left-0 md:left-[280px] right-0 pt-20 px-4">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-xl md:text-2xl font-bold mb-1">Visão Geral</h1>
              <p className="text-text-secondary">Acompanhe suas finanças</p>
            </div>

            <select className="w-full sm:w-auto bg-card-bg border border-divider text-text-primary px-4 py-2 rounded-lg focus:border-primary focus:outline-none">
              <option value="daily">Janeiro 2024</option>
              <option value="weekly">Dezembro 2023</option>
              <option value="monthly">Novembro 2023</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Saldo Total */}
            <div className="lg:col-span-2 bg-card-bg rounded-xl p-6 hover:ring-1 hover:ring-primary/20 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BanknotesIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">Saldo Total</h4>
                    <p className="text-sm text-text-secondary">Todas as contas</p>
                  </div>
                </div>
                <button className="text-text-secondary hover:text-text-primary transition-colors p-1 -mr-1">
                  <EllipsisHorizontalIcon className="w-6 h-6" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-3xl font-bold text-text-primary break-all">
                    R$ 5.049,25
                  </p>
                  <div className="flex gap-6 mt-4">
                    <div>
                      <span className="text-sm text-text-secondary">Receitas</span>
                      <p className="text-lg font-medium text-income">
                        R$ 7.000,00
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-text-secondary">Despesas</span>
                      <p className="text-lg font-medium text-expense">
                        R$ 1.950,75
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Receita Mensal */}
            <div className="bg-card-bg rounded-xl p-6 hover:ring-1 hover:ring-primary/20 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-income/10 flex items-center justify-center">
                    <ArrowTrendingUpIcon className="w-6 h-6 text-income" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">Receita Mensal</h4>
                    <p className="text-sm text-text-secondary">Janeiro 2024</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-text-primary break-all">
                    R$ 7.000,00
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <ArrowUpIcon className="w-4 h-4 text-income" />
                    <span className="text-sm font-medium text-income">+12%</span>
                    <span className="text-sm text-text-secondary">vs. último mês</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Despesa Mensal */}
            <div className="bg-card-bg rounded-xl p-6 hover:ring-1 hover:ring-primary/20 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-expense/10 flex items-center justify-center">
                    <ArrowTrendingDownIcon className="w-6 h-6 text-expense" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">Despesa Mensal</h4>
                    <p className="text-sm text-text-secondary">Janeiro 2024</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-text-primary break-all">
                    R$ 1.950,75
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <ArrowDownIcon className="w-4 h-4 text-expense" />
                    <span className="text-sm font-medium text-expense">-8%</span>
                    <span className="text-sm text-text-secondary">vs. último mês</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Fatura Atual */}
            <div className="bg-card-bg rounded-xl p-6 hover:ring-1 hover:ring-primary/20 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
                    <CreditCardIcon className="w-6 h-6 text-warning" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">Fatura Atual</h4>
                    <p className="text-sm text-text-secondary">Vence em 10 dias</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-text-primary break-all">
                    R$ 850,00
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <ArrowUpIcon className="w-4 h-4 text-warning" />
                    <span className="text-sm font-medium text-warning">+5%</span>
                    <span className="text-sm text-text-secondary">vs. última fatura</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Agenda */}
            <div className="bg-card-bg rounded-xl p-6 hover:ring-1 hover:ring-primary/20 transition-all">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-lg font-medium">Agenda</h4>
                    <p className="text-sm text-text-secondary">Próximos 7 dias</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-2xl font-bold text-text-primary">
                    3 Pagamentos
                  </p>
                  <p className="text-sm text-text-secondary mt-2">
                    Próximo: Internet em 2 dias
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-12">
            <RecentTransactions transactions={mockTransactions} />
          </div>
        </div>
      </main>
    </div>
  )
}
