"use client";

import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { usePathname } from 'next/navigation';
import { MobileMenuProvider } from '@/contexts/MobileMenuContext';
import { 
  PlusIcon, 
  MinusCircleIcon, 
  CreditCardIcon, 
  ArrowTrendingUpIcon 
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { TransactionForm } from "@/components/TransactionForm";
import { useCards } from "@/hooks/useCards";
import { useTransactions } from "@/hooks/useTransactions";

export function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <MobileMenuProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </MobileMenuProvider>
  );
}

function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [showTransactionMenu, setShowTransactionMenu] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<"expense" | "expense-card" | "income">("expense");
  
  const { cards } = useCards();
  const { createTransaction } = useTransactions();

  const handleTransactionTypeSelect = (type: "expense" | "expense-card" | "income") => {
    setTransactionType(type);
    setShowTransactionMenu(false);
    setShowTransactionForm(true);
  };

  const handleTransactionSubmit = async (data: any) => {
    try {
      // Adiciona o tipo de transação aos dados
      const cleanData = { 
        ...data,
        type: transactionType
      };

      // Remover campos não serializáveis
      delete cleanData.endRecurrenceDate;

      // Converter valores para tipos serializáveis
      cleanData.value = typeof cleanData.value === 'string' 
        ? Number(cleanData.value.replace(/[^\d,]/g, '').replace(',', '.'))
        : Number(cleanData.value);

      cleanData.date = new Date(cleanData.date).toISOString();
      
      // Campos opcionais
      if (cleanData.dueDate) {
        cleanData.dueDate = new Date(cleanData.dueDate).toISOString();
      }

      // Converter booleanos e strings vazias
      cleanData.paid = cleanData.paid || false;
      cleanData.recurring = cleanData.recurring || false;
      cleanData.fixed = cleanData.fixed || false;
      
      // Limpar campos vazios
      Object.keys(cleanData).forEach(key => {
        if (cleanData[key] === '' || cleanData[key] === null) {
          delete cleanData[key];
        }
      });

      // Fazer a requisição diretamente para garantir o tipo
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cleanData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar transação');
      }

      // Recarregar a página para mostrar a nova transação
      window.location.reload();

      setShowTransactionForm(false);
      setTransactionType("expense");
    } catch (error) {
      console.error("Erro ao criar transação:", error);
      alert('Não foi possível criar a transação. Por favor, tente novamente.');
    }
  };

  return (
    <div className="relative min-h-screen bg-background transition-colors duration-200">
      <Header 
        userName="João Silva" 
        notificationCount={2}
      />
      <Sidebar />
      <main className="pt-16 md:pt-20 md:pl-[200px] transition-[padding] duration-300">
        {children}
      </main>

      {/* Floating New Transaction Button */}
      <button 
        onClick={() => setShowTransactionMenu(prev => !prev)}
        className="md:hidden fixed bottom-6 left-6 z-50 bg-primary text-white p-4 rounded-full w-16 h-16 flex items-center justify-center hover:bg-primary/90 transition-colors shadow-xl"
        aria-label="Nova Transação"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {/* Floating Transaction Type Menu */}
      {showTransactionMenu && (
        <div 
          id="floating-transaction-type-menu"
          className="md:hidden fixed bottom-24 left-6 z-50 flex flex-col gap-2 w-48"
        >
          <button 
            onClick={() => handleTransactionTypeSelect('expense')}
            className="flex items-center justify-center gap-2 bg-red-500 text-white py-2 px-3 rounded-lg shadow-lg hover:bg-red-600 transition-colors"
          >
            <MinusCircleIcon className="w-6 h-6 -mt-0.5" />
            Despesa
          </button>
          
          <button 
            onClick={() => handleTransactionTypeSelect('expense-card')}
            className="flex items-center justify-center gap-2 bg-blue-500 text-white py-2 px-3 rounded-lg shadow-lg hover:bg-blue-600 transition-colors"
          >
            <CreditCardIcon className="w-6 h-6" />
            Compra Cartão
          </button>
          
          <button 
            onClick={() => handleTransactionTypeSelect('income')}
            className="flex items-center justify-center gap-2 bg-green-500 text-white py-2 px-3 rounded-lg shadow-lg hover:bg-green-600 transition-colors"
          >
            <ArrowTrendingUpIcon className="w-6 h-6 -mt-0.5" />
            Receita
          </button>
        </div>
      )}

      {/* Transaction Form Modal */}
      {showTransactionForm && (
        <TransactionForm 
          type={transactionType}
          onClose={() => {
            setShowTransactionForm(false);
            setTransactionType("expense");
          }}
          onSubmit={handleTransactionSubmit}
          cards={cards}
        />
      )}
    </div>
  );
}
