"use client";

import { useState } from 'react';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { WalletForm, WalletFormData } from '@/components/WalletForm';
import {
  PlusIcon,
  EllipsisHorizontalIcon,
  BanknotesIcon,
  CreditCardIcon,
  BuildingLibraryIcon,
  WalletIcon,
} from '@heroicons/react/24/outline';

interface Wallet {
  id: string;
  name: string;
  type: 'cash' | 'checking' | 'savings' | 'investment';
  balance: number;
  color: string;
  institution?: string;
}

const mockWallets: Wallet[] = [
  {
    id: '1',
    name: 'Conta Corrente',
    type: 'checking',
    balance: 5000,
    color: '#7B61FF',
    institution: 'Banco do Brasil',
  },
  {
    id: '2',
    name: 'Poupança',
    type: 'savings',
    balance: 15000,
    color: '#3FBC8B',
    institution: 'Banco do Brasil',
  },
  {
    id: '3',
    name: 'Investimentos',
    type: 'investment',
    balance: 25000,
    color: '#FFB547',
    institution: 'XP Investimentos',
  },
  {
    id: '4',
    name: 'Carteira',
    type: 'cash',
    balance: 500,
    color: '#FF5E57',
  },
];

const WALLET_ICONS = {
  cash: BanknotesIcon,
  checking: CreditCardIcon,
  savings: BuildingLibraryIcon,
  investment: WalletIcon,
};

const WALLET_TYPES = {
  cash: 'Dinheiro',
  checking: 'Conta Corrente',
  savings: 'Poupança',
  investment: 'Investimentos',
};

export default function WalletsPage() {
  const [wallets, setWallets] = useState(mockWallets);
  const [showAddWallet, setShowAddWallet] = useState(false);
  const [editingWallet, setEditingWallet] = useState<Wallet | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTotalBalance = () => {
    return wallets.reduce((acc, wallet) => acc + wallet.balance, 0);
  };

  const handleAddWallet = (data: WalletFormData) => {
    const newWallet = {
      id: Math.random().toString(),
      ...data,
    };
    setWallets([...wallets, newWallet]);
    setShowAddWallet(false);
  };

  const handleEditWallet = (data: WalletFormData) => {
    if (!editingWallet) return;

    const updatedWallets = wallets.map((wallet) =>
      wallet.id === editingWallet.id ? { ...wallet, ...data } : wallet
    );
    setWallets(updatedWallets);
    setEditingWallet(null);
  };

  const handleDeleteWallet = (id: string) => {
    const updatedWallets = wallets.filter((wallet) => wallet.id !== id);
    setWallets(updatedWallets);
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
              <h1 className="text-2xl font-bold mb-1">Carteiras</h1>
              <p className="text-text-secondary">
                Gerencie suas contas e investimentos
              </p>
            </div>

            <button
              onClick={() => setShowAddWallet(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <PlusIcon className="w-5 h-5" />
              Nova Carteira
            </button>
          </div>

          {/* Resumo */}
          <div className="bg-card-bg p-6 rounded-xl mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium mb-2">Patrimônio Total</h3>
                <p className="text-3xl font-bold">{formatCurrency(getTotalBalance())}</p>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-background rounded-lg text-text-secondary hover:text-text-primary transition-colors">
                  Exportar
                </button>
                <button className="px-4 py-2 bg-background rounded-lg text-text-secondary hover:text-text-primary transition-colors">
                  Imprimir
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Carteiras */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="bg-card-bg rounded-xl p-6 hover:ring-1 hover:ring-primary/20 transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"
                      style={{ backgroundColor: `${wallet.color}20` }}
                    >
                      <BanknotesIcon
                        className="w-6 h-6"
                        style={{ color: wallet.color }}
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium">{wallet.name}</h4>
                      <span className="text-sm text-text-secondary">
                        {wallet.institution}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingWallet(wallet)}
                    className="text-text-secondary hover:text-text-primary transition-colors p-1 -mr-1"
                    aria-label="Editar carteira"
                  >
                    <EllipsisHorizontalIcon className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-text-secondary">Saldo Atual</span>
                    <p className="text-2xl font-bold text-text-primary break-all">
                      {formatCurrency(wallet.balance)}
                    </p>
                  </div>

                  <div className="pt-4 flex gap-2">
                    <button
                      onClick={() => {
                        console.log('Abrindo análise para a carteira:', {
                          walletId: wallet.id,
                          walletName: wallet.name
                        });
                        // setShowAnalysis(wallet.id);
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-background rounded-lg text-text-secondary hover:text-text-primary transition-colors"
                    >
                      Análise
                    </button>
                    <button
                      onClick={() => {
                        console.log('Abrindo histórico para a carteira:', {
                          walletId: wallet.id,
                          walletName: wallet.name
                        });
                        // setShowHistory(wallet.id);
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

      {showAddWallet && (
        <WalletForm
          onSubmit={handleAddWallet}
          onClose={() => setShowAddWallet(false)}
        />
      )}

      {editingWallet && (
        <WalletForm
          initialData={editingWallet}
          onSubmit={handleEditWallet}
          onClose={() => setEditingWallet(null)}
        />
      )}
    </div>
  );
}