"use client";

import { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface CardFormProps {
  onSubmit: (data: CardFormData) => void;
  onClose: () => void;
  initialData?: Partial<CardFormData>;
}

export interface CardFormData {
  name: string;
  lastDigits: string;
  limit: number;
  dueDay: number;
  closingDay: number;
  color: string;
  brand: string;
  bank: string;
}

const COLORS = [
  // Tons de azul moderno
  '#1E90FF',   // Azul dodger vibrante
  '#4169E1',   // Azul royal elegante
  '#5F9EA0',   // Azul cadet suave

  // Tons de verde contemporâneo
  '#2E8B57',   // Verde mar médio
  '#3CB371',   // Verde mar médio suave
  '#20B2AA',   // Verde claro

  // Tons de roxo e violeta
  '#8A2BE2',   // Violeta azulado
  '#9370DB',   // Roxo médio
  '#6A5ACD',   // Azul ardósia

  // Tons de coral e terra
  '#FF6B6B',   // Coral vibrante
  '#FA8072',   // Salmão
  '#F4A460',   // Areia marrom suave

  // Tons metálicos e neutros
  '#4A4A4A',   // Cinza escuro
  '#708090',   // Ardósia
  '#2F4F4F',   // Verde ardósia escuro

  // Tons pastel modernos
  '#7FCDBB',   // Verde menta
  '#A3CB38',   // Verde oliva claro
  '#45B39D',   // Turquesa

  // Cores específicas de bancos
  '#FF6C00',   // Laranja Itaú
  '#FFDF00',   // Amarelo Banco do Brasil

  // Tons de vinho
  '#722F37',   // Vinho escuro
  '#8B0000'    // Vermelho escuro (borgonha)
];

const CARD_BRANDS = [
  'Visa',
  'Mastercard',
  'American Express',
  'Elo',
  'Hipercard',
  'Outros'
];

export function CardForm({ onSubmit, onClose, initialData }: CardFormProps) {
  console.log('=== INÍCIO DEBUG FORMULÁRIO DE CARTÃO ===');
  console.log('Dados iniciais recebidos:', initialData);

  const [formData, setFormData] = useState<CardFormData>({
    name: initialData?.name || '',
    lastDigits: initialData?.lastDigits || '',
    limit: initialData?.limit || 0,
    dueDay: initialData?.dueDay || 1,
    closingDay: initialData?.closingDay || 1,
    color: initialData?.color || COLORS[0],
    brand: initialData?.brand || CARD_BRANDS[0],
    bank: initialData?.bank || ''
  });

  console.log('Estado inicial do formulário:', formData);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dados do formulário no envio:', formData);
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl w-full max-w-md">
        <div className="p-6 border-b border-divider">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-text-primary">
              {initialData ? 'Editar Cartão' : 'Novo Cartão'}
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[0.70rem] text-text-secondary mb-1">
              Nome do Cartão
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Nubank"
              className="w-full px-2 py-1.5 text-[0.70rem] bg-background border border-divider rounded-md focus:ring-1 focus:ring-primary text-text-primary"
              required
            />
          </div>

          <div>
            <label className="block text-[0.70rem] text-text-secondary mb-1">
              Bandeira
            </label>
            <select
              value={formData.brand}
              onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
              className="w-full px-2 py-1.5 text-[0.70rem] bg-background border border-divider rounded-md focus:ring-1 focus:ring-primary text-text-primary"
              required
            >
              {CARD_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.70rem] text-text-secondary mb-1">
                Últimos 4 Dígitos
              </label>
              <input
                type="text"
                pattern="\d{4}"
                maxLength={4}
                value={formData.lastDigits}
                onChange={(e) => {
                  const numericValue = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, lastDigits: numericValue });
                }}
                placeholder="Ex: 8890"
                className="w-full px-2 py-1.5 text-[0.70rem] bg-background border border-divider rounded-md focus:ring-1 focus:ring-primary text-text-primary"
                required
                disabled={!!initialData}
              />
              {formData.lastDigits.length > 0 && formData.lastDigits.length !== 4 && (
                <p className="text-red-500 text-[0.60rem] mt-0.5">
                  Deve conter exatamente 4 dígitos
                </p>
              )}
            </div>
            <div>
              <label className="block text-[0.70rem] text-text-secondary mb-1">
                Limite
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.limit}
                onChange={(e) =>
                  setFormData({ ...formData, limit: parseFloat(e.target.value) })
                }
                className="w-full px-2 py-1.5 text-[0.70rem] bg-background border border-divider rounded-md focus:ring-1 focus:ring-primary text-text-primary"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[0.70rem] text-text-secondary mb-1">
                Dia do Vencimento
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.dueDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    dueDay: parseInt(e.target.value),
                  })
                }
                className="w-full px-2 py-1.5 text-[0.70rem] bg-background border border-divider rounded-md focus:ring-1 focus:ring-primary text-text-primary"
                required
              />
            </div>
            <div>
              <label className="block text-[0.70rem] text-text-secondary mb-1">
                Dia do Fechamento
              </label>
              <input
                type="number"
                min="1"
                max="31"
                value={formData.closingDay}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    closingDay: parseInt(e.target.value),
                  })
                }
                className="w-full px-2 py-1.5 text-[0.70rem] bg-background border border-divider rounded-md focus:ring-1 focus:ring-primary text-text-primary"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-[0.70rem] text-text-secondary mb-1">
              Cor do Cartão
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((colorOption) => (
                <button
                  key={colorOption}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: colorOption })}
                  className={`w-7 h-7 rounded-full hover:scale-110 transition-transform ${
                    formData.color === colorOption 
                      ? 'ring-2 ring-primary/50 scale-110' 
                      : ''
                  }`}
                  style={{ 
                    backgroundColor: colorOption,
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                  }}
                  aria-label={`Selecionar cor ${colorOption}`}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 bg-background text-text-primary rounded text-[0.70rem] hover:bg-background/80"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-3 py-1.5 bg-primary text-white rounded text-[0.70rem] hover:bg-primary-dark"
            >
              {initialData ? 'Atualizar' : 'Adicionar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}