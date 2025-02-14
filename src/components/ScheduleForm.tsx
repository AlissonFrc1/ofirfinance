"use client";

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { RecurrenceType } from '@/types/schedule';

interface ScheduleFormProps {
  onSubmit: (data: ScheduleFormData) => void;
  onClose: () => void;
  initialData?: Partial<ScheduleFormData>;
  wallets: Array<{ id: string; name: string }>;
  cards: Array<{ id: string; name: string; lastDigits: string }>;
}

export interface ScheduleFormData {
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  dueDate: string;
  recurrence: RecurrenceType;
  walletId?: string;
  cardId?: string;
  notes?: string;
  color: string;
}

const COLORS = [
  '#C4A962',
  '#0A4D68',
  '#1B4D3E',
  '#2C74B3',
  '#E5E7EB',
  '#94A3B8',
  '#D14D72',
  '#4A5568',
];

const CATEGORIES = {
  income: [
    'Salário',
    'Freelance',
    'Investimentos',
    'Rendimentos',
    'Outros',
  ],
  expense: [
    'Alimentação',
    'Moradia',
    'Transporte',
    'Saúde',
    'Educação',
    'Lazer',
    'Vestuário',
    'Outros',
  ],
};

const RECURRENCE_TYPES: Array<{ value: RecurrenceType; label: string }> = [
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
];

export function ScheduleForm({
  onSubmit,
  onClose,
  initialData,
  wallets,
  cards,
}: ScheduleFormProps) {
  const [formData, setFormData] = useState<ScheduleFormData>({
    title: initialData?.title || '',
    amount: initialData?.amount || 0,
    type: initialData?.type || 'expense',
    category: initialData?.category || '',
    dueDate: initialData?.dueDate || new Date().toISOString().split('T')[0],
    recurrence: initialData?.recurrence || 'monthly',
    walletId: initialData?.walletId,
    cardId: initialData?.cardId,
    notes: initialData?.notes || '',
    color: initialData?.color || COLORS[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field: keyof ScheduleFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrencyInput = (value: string) => {
    // implementar formatação de moeda
    return value;
  };

  return (
    <div className="fixed inset-0 bg-text-primary/10 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card-bg rounded-xl w-full max-w-md p-4 shadow-lg border border-divider">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {formData.type === 'income' ? 'Nova Receita' : 'Nova Despesa'}
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary focus:outline-none"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Título */}
          <div className="mb-2">
            <label className="block text-[0.72rem] text-text-secondary font-medium mb-1">
              Título
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
              placeholder="Insira o título"
              required
            />
          </div>

          {/* Tipo e Valor */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[0.72rem] text-text-secondary font-medium mb-1">
                Tipo
              </label>
              <select
                value={formData.type}
                onChange={(e) => {
                  handleInputChange('type', e.target.value);
                  handleInputChange('category', '');
                }}
                className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Selecione</option>
                <option value="expense">Despesa</option>
                <option value="income">Receita</option>
              </select>
            </div>
            <div>
              <label className="block text-[0.72rem] text-text-secondary font-medium mb-1">
                Valor
              </label>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', formatCurrencyInput(e.target.value))}
                className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
                placeholder="R$ 0,00"
                required
              />
            </div>
          </div>

          {/* Categoria e Recorrência */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[0.72rem] text-text-secondary font-medium mb-1">
                Categoria
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  handleInputChange('category', e.target.value);
                }}
                className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
                required
              >
                <option value="">Selecione</option>
                {CATEGORIES[formData.type].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[0.72rem] text-text-secondary font-medium mb-1">
                Recorrência
              </label>
              <select
                value={formData.recurrence}
                onChange={(e) => handleInputChange('recurrence', e.target.value)}
                className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
                required
              >
                {RECURRENCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Data de Vencimento */}
          <div className="mb-2">
            <label className="block text-[0.72rem] text-text-secondary font-medium mb-1">
              Data de Vencimento
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
              className="w-48 px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
              required
            />
          </div>

          {/* Carteira e Cartão */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div>
              <label className="block text-[0.72rem] text-text-secondary font-medium mb-1">
                Carteira
              </label>
              <select
                value={formData.walletId || ''}
                onChange={(e) => {
                  handleInputChange('walletId', e.target.value);
                  handleInputChange('cardId', '');
                }}
                className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
              >
                <option value="">Selecione</option>
                {wallets.map((wallet) => (
                  <option key={wallet.id} value={wallet.id}>
                    {wallet.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[0.72rem] text-text-secondary font-medium mb-1">
                Cartão
              </label>
              <select
                value={formData.cardId || ''}
                onChange={(e) => {
                  handleInputChange('cardId', e.target.value);
                  handleInputChange('walletId', '');
                }}
                className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
              >
                <option value="">Selecione</option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name} - Final {card.lastDigits}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Observações */}
          <div className="mb-2">
            <label className="block text-[0.72rem] text-text-secondary font-medium mb-1">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary resize-none h-24"
              placeholder="Detalhes adicionais"
            />
          </div>

          {/* Cor */}
          <div className="mb-2">
            <label className="block text-[0.72rem] text-text-secondary font-medium mb-1">
              Cor
            </label>
            <div className="flex space-x-2">
              {COLORS.map((color) => (
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

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors text-[0.72rem]"
          >
            {formData.type === 'income' ? 'Adicionar Receita' : 'Adicionar Despesa'}
          </button>
        </form>
      </div>
    </div>
  );
}