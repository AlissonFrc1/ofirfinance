"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  HomeIcon,
  BanknotesIcon,
  ArrowTrendingUpIcon,
  WalletIcon,
  Cog6ToothIcon,
  QuestionMarkCircleIcon,
  ArrowLeftOnRectangleIcon,
  CreditCardIcon,
  CalendarIcon,
  PlusIcon,
  ChartBarIcon,
  FlagIcon,
  XMarkIcon,
  MinusCircleIcon,
} from "@heroicons/react/24/outline";
import { TransactionForm } from "./TransactionForm";
import { useTransactions } from "@/hooks/useTransactions";
import { useMobileMenu } from "@/contexts/MobileMenuContext";

interface Card {
  id: string;
  name: string;
  brand: string;
  lastDigits: string;
  limit: number;
  dueDate: number;
  closingDate: number;
  color: string;
}

const menuItems = [
  {
    title: "Principal",
    items: [
      { name: "Dashboard", href: "/", icon: ChartBarIcon },
      { name: "Transações", href: "/transactions", icon: BanknotesIcon },
      { name: "Carteiras", href: "/wallets", icon: WalletIcon },
    ],
  },
  {
    title: "Gestão",
    items: [
      { name: "Orçamentos", href: "/budgets", icon: ArrowTrendingUpIcon },
      { name: "Objetivos", href: "/goals", icon: FlagIcon },
      { name: "Cartões", href: "/cards", icon: CreditCardIcon },
      { name: "Agenda", href: "/agenda", icon: CalendarIcon },
    ],
  },
  {
    title: "Sistema",
    items: [
      { name: "Configurações", href: "/settings", icon: Cog6ToothIcon },
      { name: "Ajuda", href: "/help", icon: QuestionMarkCircleIcon },
      { name: "Sair", href: "/logout", icon: ArrowLeftOnRectangleIcon },
    ],
  },
];

const PAYMENT_METHODS = [
  { id: 1, name: "Dinheiro" },
  { id: 2, name: "Cartão de Crédito" },
  { id: 3, name: "Cartão de Débito" },
  { id: 4, name: "Pix" },
  { id: 5, name: "Boleto" },
];

export function Sidebar() {
  const pathname = usePathname();
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [transactionType, setTransactionType] = useState<"expense" | "expense-card" | "income">("expense");
  const { cards } = useTransactions();
  const { isMobileMenuOpen, closeMobileMenu } = useMobileMenu();
  
  // Estado para controlar o menu de transação
  const [showTransactionMenu, setShowTransactionMenu] = useState(false);
  
  // Ref para controlar o estado do menu
  const menuStateRef = useRef(false);

  // Ref para controlar eventos
  const isProcessingRef = useRef(false);

  // Adiciona logs de depuração para diagnóstico
  useEffect(() => {
    console.log('showTransactionMenu state changed:', showTransactionMenu);
  }, [showTransactionMenu]);

  // Simplifica o toggle do menu de transação
  const toggleTransactionMenu = useCallback(() => {
    console.group('Toggle Transaction Menu');
    console.log('Estado atual (ref):', menuStateRef.current);
    
    // Alterna o estado usando o ref
    const newState = !menuStateRef.current;
    menuStateRef.current = newState;
    
    // Atualiza o estado do React
    setShowTransactionMenu(newState);
    
    console.log('Novo estado:', newState);
    console.groupEnd();
  }, []);

  const handleButtonClick = useCallback((e: React.MouseEvent) => {
    console.group('Button Click');
    console.log('Evento:', e);
    
    e.preventDefault();
    e.stopPropagation();
    
    toggleTransactionMenu();
    
    console.groupEnd();
  }, [toggleTransactionMenu]);

  // Fecha o menu quando clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const menu = document.getElementById('transaction-type-menu');
      const button = document.getElementById('new-transaction-button');
      
      // Verificar se o clique está fora do menu e do botão
      if (
        showTransactionMenu && 
        menu && 
        button && 
        !menu.contains(event.target as Node) && 
        !button.contains(event.target as Node)
      ) {
        // Reseta o ref e o estado
        menuStateRef.current = false;
        setShowTransactionMenu(false);
      }
    }

    // Adiciona listener no documento para capturar cliques em qualquer lugar
    document.addEventListener('mousedown', handleClickOutside, true);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, [showTransactionMenu]);

  const handleTransactionTypeSelect = (type: "expense" | "expense-card" | "income") => {
    setTransactionType(type);
    setShowTransactionForm(true);
    setShowTransactionMenu(false);
  };

  const handleTransactionSubmit = async (data: any) => {
    try {
      // Adiciona o tipo de transação aos dados
      const transactionData = {
        ...data,
        type: transactionType
      };

      // Faz a requisição para a API
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(transactionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar transação');
      }

      // Fecha o formulário após sucesso
      setShowTransactionForm(false);

      // Recarrega a página para mostrar a nova transação
      window.location.reload();
    } catch (error) {
      console.error('Erro ao criar transação:', error);
      alert('Não foi possível criar a transação. Por favor, tente novamente.');
    }
  };

  // Previne scroll quando menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-20 transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 block' : 'opacity-0 hidden md:hidden'
        }`}
        onClick={closeMobileMenu}
      />

      {/* Sidebar */}
      <nav 
        className={`fixed top-0 left-0 h-full w-[200px] bg-white shadow-xl md:shadow-none border-r border-divider z-30 transform transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="h-16 md:h-20 flex items-center justify-between px-4 border-b border-divider">
            <Link href="/" className="text-xl font-bold text-primary">
              Ofir
            </Link>
            <div className="flex items-center gap-2">
              <button 
                onClick={closeMobileMenu}
                className="p-1.5 md:hidden text-text-primary hover:bg-background rounded-lg transition-colors"
                aria-label="Fechar menu"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* New Transaction Button */}
          <div className="p-2 border-b border-divider relative">
            <button
              id="new-transaction-button"
              onClick={handleButtonClick}
              className="w-full bg-primary text-white py-2 rounded-lg text-[0.75rem] font-medium flex items-center justify-center gap-1.5 hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              Nova Transação
            </button>

            {showTransactionMenu && (
              <div 
                id="transaction-type-menu"
                className="absolute z-50 top-full left-0 right-0 mt-2 p-2 bg-white border border-divider rounded-lg shadow-lg"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Botões de tipo de transação */}
                <div className="grid grid-cols-3 gap-2">
                  <button 
                    onClick={() => handleTransactionTypeSelect('expense')}
                    className="flex flex-col items-center justify-center p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <MinusCircleIcon className="w-6 h-6 text-red-500 -mt-0.5 mb-1" />
                    <span className="text-[0.65rem] text-red-500">Despesa</span>
                  </button>
                  
                  <button 
                    onClick={() => handleTransactionTypeSelect('expense-card')}
                    className="flex flex-col items-center justify-center p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <CreditCardIcon className="w-6 h-6 text-blue-500 mb-1" />
                    <span className="text-[0.65rem] text-blue-500">Compra Cartão</span>
                  </button>
                  
                  <button 
                    onClick={() => handleTransactionTypeSelect('income')}
                    className="flex flex-col items-center justify-center p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    <ArrowTrendingUpIcon className="w-6 h-6 text-green-500 -mt-0.5 mb-1" />
                    <span className="text-[0.65rem] text-green-500">Receita</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Menu Items */}
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="p-2 border-b border-divider">
              <h3 className="text-[0.65rem] text-text-secondary uppercase mb-2 px-2">
                {section.title}
              </h3>
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`
                    group flex items-center gap-2 p-2 rounded-lg text-[0.75rem] 
                    transition-all duration-300 ease-in-out
                    ${pathname === item.href
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-primary/5 text-text-primary hover:text-primary hover:pl-4'}
                    active:scale-[0.98] active:bg-primary/10
                    focus:outline-none focus:ring-2 focus:ring-primary/30
                  `}
                >
                  <item.icon 
                    className={`
                      w-4 h-4 transition-all duration-300 
                      ${pathname === item.href 
                        ? 'text-primary' 
                        : 'group-hover:text-primary group-hover:scale-110'}
                    `} 
                  />
                  <span className="transition-all duration-300 group-hover:ml-1">
                    {item.name}
                  </span>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </nav>

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
    </>
  );
}
