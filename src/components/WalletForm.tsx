"use client";

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface WalletFormProps {
  onSubmit: (data: WalletFormData) => void;
  onClose: () => void;
  initialData?: Partial<WalletFormData>;
}

export interface WalletFormData {
  name: string;
  type: 'cash' | 'checking' | 'savings' | 'investment';
  balance: number;
  institution?: string;
  color: string;
  description?: string;
}

const WALLET_TYPES = [
  { value: 'cash', label: 'Dinheiro' },
  { value: 'checking', label: 'Conta Corrente' },
  { value: 'savings', label: 'Poupança' },
  { value: 'investment', label: 'Investimentos' },
];

const COLORS = [
  '#7B61FF',
  '#FF5E57',
  '#3FBC8B',
  '#FFB547',
  '#3B82F6',
  '#EC4899',
  '#8B5CF6',
  '#10B981',
];

const WALLET_COLORS = [
  '#7B61FF',
  '#FF5E57',
  '#3FBC8B',
  '#FFB547',
  '#3B82F6',
  '#EC4899',
  '#8B5CF6',
  '#10B981',
];

export function WalletForm({ onSubmit, onClose, initialData }: WalletFormProps) {
  const [formData, setFormData] = useState<WalletFormData>({
    name: initialData?.name || '',
    type: initialData?.type || 'checking',
    balance: initialData?.balance || 0,
    institution: initialData?.institution || '',
    color: initialData?.color || COLORS[0],
    description: initialData?.description || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof WalletFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrencyInput = (value: string) => {
    // Implementar formatação de moeda
    return value;
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-sm p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {initialData ? 'Editar Carteira' : 'Nova Carteira'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary focus:outline-none"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Nome da Carteira */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Nome da Carteira
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
              placeholder="Nome da carteira"
              required
            />
          </div>

          {/* Tipo de Carteira */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Tipo de Carteira
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
              required
            >
              <option value="">Selecione o tipo</option>
              {WALLET_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Saldo Inicial */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Saldo Inicial
            </label>
            <input
              type="text"
              value={formData.balance}
              onChange={(e) => {
                const value = formatCurrencyInput(e.target.value);
                handleInputChange('balance', value);
              }}
              className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
              placeholder="R$ 0,00"
              required
            />
          </div>

          {formData.type !== 'cash' && (
            <div className="mb-2">
              <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
                Instituição
              </label>
              <input
                type="text"
                value={formData.institution}
                onChange={(e) => handleInputChange('institution', e.target.value)}
                className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
              />
            </div>
          )}

          {/* Cor da Carteira */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Cor da Carteira
            </label>
            <div className="grid grid-cols-5 gap-2">
              {WALLET_COLORS.map((color) => (
                <div
                  key={color}
                  className={`w-6 h-6 rounded-full cursor-pointer ${
                    formData.color === color
                      ? 'ring-2 ring-primary scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => handleInputChange('color', color)}
                />
              ))}
            </div>
          </div>

          {/* Descrição (Opcional) */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Descrição (Opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary resize-none h-20"
              placeholder="Detalhes adicionais"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors text-[0.72rem]"
          >
            {initialData ? 'Atualizar Carteira' : 'Criar Carteira'}
          </button>
        </form>
      </div>
    </div>
  );
}