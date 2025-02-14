import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface EditCardModalProps {
  card: {
    id: string;
    limit: number;
    dueDay: number;
    closingDay: number;
    color: string;
    lastDigits: string;
  };
  onClose: () => void;
  onUpdate: (updatedCard: {
    limit: number;
    dueDay: number;
    closingDay: number;
    color: string;
  }) => Promise<void>;
}

// Paleta de cores predefinidas para cartões
const CARD_COLORS = [
  '#1A1A2E',   // Dark Blue
  '#4A4E69',   // Slate Gray
  '#6A4C93',   // Purple
  '#1982C4',   // Blue
  '#8AC926',   // Green
  '#FF924C',   // Orange
  '#FF6B6B',   // Red
  '#7209B7',   // Deep Purple
  '#3A86FF',   // Bright Blue
  '#023E8A',   // Navy Blue
];

export function EditCardModal({ 
  card, 
  onClose, 
  onUpdate 
}: EditCardModalProps) {
  const [limit, setLimit] = useState(card.limit);
  const [dueDay, setDueDay] = useState(card.dueDay);
  const [closingDay, setClosingDay] = useState(card.closingDay);
  const [color, setColor] = useState(card.color);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updatedCard = {
        limit: limit,
        dueDay: dueDay,
        closingDay: closingDay,
        color: color,
      };
      await onUpdate(updatedCard);
      onClose();
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-full max-w-sm p-4 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-text-primary">
            Editar Cartão
          </h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary focus:outline-none"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Últimos 4 Dígitos */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Últimos 4 Dígitos
            </label>
            <p className="font-medium text-text-primary">**** {card.lastDigits}</p>
            <p className="text-xs text-text-secondary mt-2 italic">
              Este campo não pode ser editado para manter a integridade dos dados do cartão.
            </p>
          </div>

          {/* Limite */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Limite do Cartão
            </label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
              placeholder="Limite do cartão"
              required
            />
          </div>

          {/* Dia de Vencimento */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Dia de Vencimento
            </label>
            <input
              type="number"
              value={dueDay}
              onChange={(e) => setDueDay(Number(e.target.value))}
              className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
              placeholder="Dia de vencimento"
              min="1"
              max="31"
              required
            />
          </div>

          {/* Dia de Fechamento */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Dia de Fechamento
            </label>
            <input
              type="number"
              value={closingDay}
              onChange={(e) => setClosingDay(Number(e.target.value))}
              className="w-full px-2 py-1.5 text-[0.72rem] border rounded-md focus:ring-1 focus:ring-primary"
              placeholder="Dia de fechamento"
              min="1"
              max="31"
              required
            />
          </div>

          {/* Cor do Cartão */}
          <div className="mb-2">
            <label className="block text-[0.72rem] font-medium text-text-primary mb-1">
              Cor do Cartão
            </label>
            <div className="grid grid-cols-5 gap-2">
              {CARD_COLORS.map((colorOption) => (
                <div
                  key={colorOption}
                  className={`w-6 h-6 rounded-full cursor-pointer ${
                    color === colorOption
                      ? 'ring-2 ring-primary scale-110'
                      : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: colorOption }}
                  onClick={() => setColor(colorOption)}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary-dark transition-colors text-[0.72rem]"
            >
              {loading ? 'Atualizando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
