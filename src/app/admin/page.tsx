'use client';

import { useState, useEffect } from 'react';
import { User, Plan } from '@/types';
import { getPlans } from '@/app/actions';
import UserModal from '@/components/UserModal';
import PlanModal from '@/components/PlanModal';
import { toast } from 'react-hot-toast';

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);

  useEffect(() => {
    loadUsers();
    loadPlans();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.users) {
        setUsers(data.users);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar usuários');
      setUsers([]);
    }
  };

  const loadPlans = async () => {
    try {
      const plansData = await getPlans();
      setPlans(plansData as Plan[]);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast.error('Erro ao carregar planos');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleNewUser = () => {
    setSelectedUser(undefined);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUser(undefined);
  };

  const handleEditPlan = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsPlanModalOpen(true);
  };

  const handleNewPlan = () => {
    setSelectedPlan(undefined);
    setIsPlanModalOpen(true);
  };

  const handleClosePlanModal = () => {
    setIsPlanModalOpen(false);
    setSelectedPlan(undefined);
  };

  return (
    <div className="space-y-8">
      {/* Seção de Usuários */}
      <div className="bg-card shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-medium text-text-primary">Usuários</h1>
            <button
              onClick={handleNewUser}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Novo Usuário
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Função
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Plano
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Editar</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text-primary">{user.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.role === 'ADMIN' 
                        ? 'bg-green-900 text-green-100' 
                        : 'bg-blue-900 text-blue-100'
                    }`}>
                      {user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">
                      {user.planId ? plans.find(p => p.id === user.planId)?.name || 'Nenhum' : 'Nenhum'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="text-primary hover:text-primary-dark"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção de Planos */}
      <div className="bg-card shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex justify-between items-center">
            <h1 className="text-lg font-medium text-text-primary">Planos</h1>
            <button
              onClick={handleNewPlan}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Novo Plano
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-background">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Nome
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Preço
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Editar</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {plans.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-text-primary">{plan.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-text-secondary">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(plan.price)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      plan.active 
                        ? 'bg-green-900 text-green-100' 
                        : 'bg-red-900 text-red-100'
                    }`}>
                      {plan.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditPlan(plan)}
                      className="text-primary hover:text-primary-dark"
                    >
                      Editar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isUserModalOpen && (
        <UserModal
          user={selectedUser}
          plans={plans}
          onClose={handleCloseUserModal}
          onSave={loadUsers}
        />
      )}

      {isPlanModalOpen && (
        <PlanModal
          plan={selectedPlan}
          onClose={handleClosePlanModal}
          onSave={loadPlans}
        />
      )}
    </div>
  );
} 