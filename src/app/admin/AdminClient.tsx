'use client';

import { useState } from 'react';
import { FiEdit2, FiPlus } from 'react-icons/fi';
import { User, Plan } from '@/types';
import UserModal from '@/components/UserModal';
import PlanModal from '@/components/PlanModal';
import { saveUser, savePlan } from '@/app/actions';

interface AdminClientProps {
  users: (User & { subscriptions: { plan: Plan; }[]; })[];
  plans: Plan[];
}

export default function AdminClient({ users, plans }: AdminClientProps) {
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>();

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setShowPlanModal(true);
  };

  const handleSaveUser = async (userData: Omit<User, 'id' | 'plan' | 'subscriptions' | 'expenses' | 'incomes' | 'cards' | 'createdAt' | 'updatedAt'> & { id?: string; password?: string }) => {
    await saveUser(userData);
    window.location.reload();
  };

  const handleSavePlan = async (planData: Omit<Plan, 'id'> & { id?: string }) => {
    await savePlan(planData);
    window.location.reload();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Usuários</h2>
            <button
              onClick={() => {
                setSelectedUser(undefined);
                setShowUserModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              Novo Usuário
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Função
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plano
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.subscriptions[0]?.plan?.name || 'Nenhum'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Planos</h2>
            <button
              onClick={() => {
                setSelectedPlan(undefined);
                setShowPlanModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
            >
              <FiPlus className="w-5 h-5" />
              Novo Plano
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {plans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(plan.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {plan.active ? 'Ativo' : 'Inativo'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="text-primary hover:text-primary/80 transition-colors"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showUserModal && (
        <UserModal
          user={selectedUser}
          plans={plans}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(undefined);
          }}
          onSave={handleSaveUser}
        />
      )}

      {showPlanModal && (
        <PlanModal
          plan={selectedPlan}
          onClose={() => {
            setShowPlanModal(false);
            setSelectedPlan(undefined);
          }}
          onSave={handleSavePlan}
        />
      )}
    </div>
  );
} 