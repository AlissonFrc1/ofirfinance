"use client";

import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { useState } from 'react'

interface BalanceCardProps {
  balance: number
  income: number
  expenses: number
}

export function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  const [showValues, setShowValues] = useState(true)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const hideValue = (value: string) => {
    return showValues ? value : 'R$ ••••••'
  }

  return (
    <div className="bg-card-bg p-4 sm:p-6 rounded-xl">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-base font-medium">Saldo Total</h3>
        <button
          onClick={() => setShowValues(!showValues)}
          className="text-text-secondary hover:text-text-primary transition-colors p-2 -mr-2"
          aria-label={showValues ? "Ocultar valores" : "Mostrar valores"}
        >
          {showValues ? (
            <EyeSlashIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>

      <div className="mb-6 sm:mb-8">
        <span className="text-2xl sm:text-4xl font-bold break-all">
          {hideValue(formatCurrency(balance))}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="p-3 sm:p-4 rounded-lg bg-background/50">
          <span className="text-[0.65rem] sm:text-[0.65rem] text-text-secondary block mb-1">Receitas</span>
          <span className="text-base sm:text-base font-medium text-income break-all">
            {hideValue(formatCurrency(income))}
          </span>
        </div>
        <div className="p-3 sm:p-4 rounded-lg bg-background/50">
          <span className="text-[0.65rem] sm:text-[0.65rem] text-text-secondary block mb-1">Despesas</span>
          <span className="text-base sm:text-base font-medium text-expense break-all">
            {hideValue(formatCurrency(expenses))}
          </span>
        </div>
      </div>
    </div>
  )
}