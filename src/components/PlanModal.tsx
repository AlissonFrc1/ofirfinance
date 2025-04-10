'use client';

import { useState, useEffect } from 'react';
import { FiX, FiTrash2 } from 'react-icons/fi';
import { Plan } from '@/types';
import { toast } from 'react-hot-toast';
import { savePlan } from '@/app/actions';

interface PlanModalProps {
  plan?: Plan;
  onClose: () => void;
  onSave: (planData: Omit<Plan, 'id'> & { id?: string }) => void;
}

export default function PlanModal({ plan, onClose, onSave }: PlanModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    billingCycle: 'MONTHLY' as 'MONTHLY' | 'YEARLY',
    status: 'ACTIVE' as 'ACTIVE' | 'CANCELED' | 'EXPIRED',
    allowedPages: [] as string[],
    features: [] as string[],
    active: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name,
        description: plan.description,
        price: plan.price,
        billingCycle: plan.billingCycle,
        status: plan.status,
        allowedPages: plan.allowedPages || [],
        features: plan.features || [],
        active: plan.active,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt
      });
    }
  }, [plan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const planData = {
        ...formData,
        id: plan?.id
      };
      await savePlan(planData);
      onSave(planData);
      toast.success(plan ? 'Plano atualizado com sucesso!' : 'Plano criado com sucesso!');
      onClose();
    } catch (error) {
      console.error('Erro ao salvar plano:', error);
      toast.error('Erro ao salvar plano. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card-bg rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[1.5rem] font-semibold text-text-primary">
            {plan ? 'Editar Plano' : 'Novo Plano'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
              Nome
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-3 p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full pl-3 p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
              rows={3}
              required
            />
          </div>

          <div>
            <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
              Preço
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
              className="w-full pl-3 p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
              Ciclo de Cobrança
            </label>
            <select
              value={formData.billingCycle}
              onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as 'MONTHLY' | 'YEARLY' })}
              className="w-full pl-3 p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="MONTHLY">Mensal</option>
              <option value="YEARLY">Anual</option>
            </select>
          </div>

          <div>
            <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'ACTIVE' | 'CANCELED' | 'EXPIRED' })}
              className="w-full pl-3 p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="ACTIVE">Ativo</option>
              <option value="CANCELED">Cancelado</option>
              <option value="EXPIRED">Expirado</option>
            </select>
          </div>

          <div>
            <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
              Páginas Permitidas
            </label>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {[
                  'dashboard',
                  'cards',
                  'expenses',
                  'incomes',
                  'subscriptions',
                  'plans',
                  'users',
                  'transactions',
                  'wallets',
                  'budgets',
                  'goals',
                  'agenda'
                ].map((page) => (
                  <label key={page} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={formData.allowedPages.includes(page)}
                      onChange={(e) => {
                        const newPages = e.target.checked
                          ? [...formData.allowedPages, page]
                          : formData.allowedPages.filter((p) => p !== page);
                        setFormData({ ...formData, allowedPages: newPages });
                      }}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-text-primary capitalize">{page}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
              Recursos
            </label>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={feature}
                    onChange={(e) => {
                      const newFeatures = [...formData.features];
                      newFeatures[index] = e.target.value;
                      setFormData({ ...formData, features: newFeatures });
                    }}
                    className="flex-1 pl-3 p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newFeatures = formData.features.filter((_, i) => i !== index);
                      setFormData({ ...formData, features: newFeatures });
                    }}
                    className="p-2 text-text-secondary hover:text-text-primary transition-colors"
                  >
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => setFormData({ ...formData, features: [...formData.features, ''] })}
                className="px-4 py-2 text-[0.85rem] bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                Adicionar Recurso
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[0.85rem] text-text-primary hover:bg-background/50 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-[0.85rem] bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {loading ? 'Salvando...' : plan ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 