"use client";

import { useState } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { useTransactions } from "@/hooks/useTransactions";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";

interface TransactionListProps {
  onEdit: (transaction: any) => void;
}

export function TransactionList({ onEdit }: TransactionListProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { transactions, loading, error } = useTransactions({
    month: currentMonth.getMonth() + 1,
    year: currentMonth.getFullYear(),
  });

  const monthYear = currentMonth.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const handlePreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.setMonth(currentMonth.getMonth() - 1))
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)));
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR");
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
        Erro ao carregar transações. Por favor, tente novamente.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <Header userName="João Silva" notificationCount={2} />

      <main className="pl-[280px] pt-20 p-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-text-primary">
                  Lista de Transações
                </h2>
                <div className="flex items-center gap-4">
                  <button
                    onClick={handlePreviousMonth}
                    className="p-2 text-text-secondary hover:text-primary transition-colors"
                  >
                    <ChevronLeftIcon className="w-5 h-5" />
                  </button>
                  <span className="text-text-primary font-medium capitalize">
                    {monthYear}
                  </span>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 text-text-secondary hover:text-primary transition-colors"
                  >
                    <ChevronRightIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-divider">
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                        Data
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                        Descrição
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-text-secondary">
                        Categoria
                      </th>
                      <th className="text-right py-3 px-4 text-sm font-medium text-text-secondary">
                        Valor
                      </th>
                      <th className="text-center py-3 px-4 text-sm font-medium text-text-secondary">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-divider last:border-0 hover:bg-background/50 transition-colors"
                      >
                        <td className="py-4 px-4 text-sm text-text-secondary">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-text-primary font-medium">
                              {transaction.description}
                            </span>
                            {transaction.notes && (
                              <span className="text-sm text-text-secondary">
                                {transaction.notes}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-text-primary">
                              {transaction.category}
                            </span>
                            {transaction.subcategory && (
                              <span className="text-sm text-text-secondary">
                                {transaction.subcategory}
                              </span>
                            )}
                          </div>
                        </td>
                        <td
                          className={`py-4 px-4 text-right font-medium ${
                            transaction.type === "income"
                              ? "text-success"
                              : "text-expense"
                          }`}
                        >
                          {transaction.type === "income" ? "+" : "-"}{" "}
                          {formatCurrency(transaction.value)}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => onEdit(transaction)}
                              className="p-2 text-text-secondary hover:text-primary transition-colors"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button className="p-2 text-text-secondary hover:text-expense transition-colors">
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {transactions.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-8 text-center text-text-secondary"
                        >
                          Nenhuma transação encontrada neste período.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 