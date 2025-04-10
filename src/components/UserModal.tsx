'use client';

import { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { User, Plan } from '@/types';
import { toast } from 'react-hot-toast';
import { saveUser } from '@/app/actions';

interface UserModalProps {
  user?: User;
  plans: Plan[];
  onClose: () => void;
  onSave: (userData: Omit<User, 'id' | 'plan' | 'subscriptions' | 'expenses' | 'incomes' | 'cards' | 'createdAt' | 'updatedAt'> & { id?: string; password?: string }) => void;
}

type UserRole = 'USER' | 'ADMIN';

export default function UserModal({ user, plans, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'USER' as UserRole,
    planId: null as string | null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        planId: user.planId
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user && !formData.password) {
        toast.error('Senha é obrigatória para criar um novo usuário');
        return;
      }

      await saveUser({
        ...formData,
        id: user?.id
      });
      toast.success(user ? 'Usuário atualizado com sucesso!' : 'Usuário criado com sucesso!');
      onSave({
        ...formData,
        id: user?.id
      });
      onClose();
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
      toast.error('Erro ao salvar usuário. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-text-primary/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card-bg rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[1.5rem] font-semibold text-text-primary">
            {user ? 'Editar Usuário' : 'Novo Usuário'}
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
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-3 p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
              Senha
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full pl-3 p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
              required={!user}
            />
          </div>

          <div>
            <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
              Função
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full pl-3 p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="USER">Usuário</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          <div>
            <label className="block text-[0.90rem] font-medium text-text-primary mb-1">
              Plano
            </label>
            <select
              value={formData.planId || ''}
              onChange={(e) => setFormData({ ...formData, planId: e.target.value || null })}
              className="w-full pl-3 p-2 text-base border rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione um plano</option>
              {plans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name}
                </option>
              ))}
            </select>
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
              {loading ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 