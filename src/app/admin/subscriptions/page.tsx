"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Subscription {
  id: string;
  user: {
    name: string;
    email: string;
  };
  plan: {
    name: string;
    price: number;
  };
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchSubscriptions = async () => {
      if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return;

      try {
        const response = await fetch('/api/admin/subscriptions');
        if (!response.ok) throw new Error('Falha ao carregar assinaturas');
        const data = await response.json();
        setSubscriptions(data);
      } catch (error) {
        console.error('Erro ao carregar assinaturas:', error);
      }
    };

    fetchSubscriptions();
  }, [status, session]);

  // Verificar se o usuário é admin
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, session, router]);

  const handleCancelSubscription = async (subscriptionId: string) => {
    try {
      setLoading(true);
      
      const response = await fetch(`/api/admin/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'canceled',
          cancelAtPeriodEnd: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao cancelar assinatura');
      }
      
      // Atualizar a lista de assinaturas
      setSubscriptions(subscriptions.map(sub => 
        sub.id === subscriptionId 
          ? { ...sub, status: 'canceled', cancelAtPeriodEnd: true } 
          : sub
      ));
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro ao cancelar assinatura');
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || (loading && !error)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
          <p>Você não tem permissão para acessar esta página.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        Gerenciamento de Assinaturas
      </h1>

      {error && (
        <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Usuário
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Plano
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Período Atual
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Nenhuma assinatura encontrada
                  </td>
                </tr>
              ) : (
                subscriptions.map((subscription) => (
                  <tr key={subscription.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white">{subscription.user.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">{subscription.user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white">{subscription.plan.name}</span>
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          R$ {parseFloat(subscription.plan.price.toString()).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        subscription.status === 'active'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : subscription.status === 'canceled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : subscription.status === 'trial'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      }`}>
                        {subscription.status === 'active'
                          ? 'Ativa'
                          : subscription.status === 'canceled'
                          ? 'Cancelada'
                          : subscription.status === 'trial'
                          ? 'Período de teste'
                          : 'Expirada'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-gray-900 dark:text-white">
                          {format(new Date(subscription.currentPeriodStart), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        <span className="text-gray-900 dark:text-white">
                          até {format(new Date(subscription.currentPeriodEnd), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {subscription.status === 'active' && (
                        <button
                          onClick={() => handleCancelSubscription(subscription.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200"
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 