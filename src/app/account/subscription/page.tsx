"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: string;
  features: string[];
}

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
}

export default function SubscriptionPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelConfirm, setCancelConfirm] = useState(false);
  const [processingCancel, setProcessingCancel] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // Verificar se o usuário está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?redirect=/account/subscription');
    }
  }, [status, router]);

  // Buscar dados da assinatura
  useEffect(() => {
    const fetchSubscription = async () => {
      if (status !== 'authenticated') return;

      try {
        const response = await fetch('/api/subscriptions');
        
        if (response.status === 404) {
          // Usuário não tem assinatura
          setSubscription(null);
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          throw new Error('Falha ao carregar detalhes da assinatura');
        }
        
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        } else {
          setError('Erro ao carregar detalhes da assinatura');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [status]);

  const handleCancelSubscription = async () => {
    if (!subscription) return;
    
    try {
      setProcessingCancel(true);
      
      const response = await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelAtPeriodEnd: true,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao cancelar assinatura');
      }
      
      const data = await response.json();
      setSubscription(data);
      setCancelConfirm(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro ao processar o cancelamento');
      }
    } finally {
      setProcessingCancel(false);
    }
  };

  const handleReactivateSubscription = async () => {
    if (!subscription) return;
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/subscriptions', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cancelAtPeriodEnd: false,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Falha ao reativar assinatura');
      }
      
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Erro ao processar a reativação');
      }
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Sua Assinatura
        </h1>

        {error && (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg mb-6">
            <p>{error}</p>
          </div>
        )}

        {!subscription ? (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Você não possui uma assinatura ativa
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Assine um de nossos planos para aproveitar todos os recursos do nosso sistema.
            </p>
            <Link
              href="/pricing"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
            >
              Ver planos
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {subscription.plan.name}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-1">
                    {subscription.plan.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    R$ {parseFloat(subscription.plan.price.toString()).toFixed(2)}
                    <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                      /{subscription.plan.billingCycle === 'monthly' ? 'mês' : 'ano'}
                    </span>
                  </p>
                  <span
                    className={`inline-block px-3 py-1 mt-2 text-sm font-medium rounded-full ${
                      subscription.status === 'active'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                    }`}
                  >
                    {subscription.status === 'active'
                      ? 'Ativa'
                      : subscription.status === 'canceled'
                      ? 'Cancelada'
                      : subscription.status === 'trial'
                      ? 'Período de teste'
                      : 'Expirada'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Detalhes da Assinatura
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Início do período atual</p>
                  <p className="text-gray-900 dark:text-white">
                    {format(new Date(subscription.currentPeriodStart), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Fim do período atual</p>
                  <p className="text-gray-900 dark:text-white">
                    {format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {subscription.cancelAtPeriodEnd && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-md">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    Sua assinatura será cancelada ao final do período atual. Você terá acesso até{' '}
                    {format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recursos do Plano
              </h3>
              
              <ul className="space-y-2">
                {subscription.plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg
                      className="h-5 w-5 text-green-500 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="ml-3 text-gray-700 dark:text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="mt-8">
                {subscription.cancelAtPeriodEnd ? (
                  <button
                    onClick={handleReactivateSubscription}
                    disabled={loading}
                    className="inline-block bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md"
                  >
                    {loading ? 'Processando...' : 'Reativar assinatura'}
                  </button>
                ) : cancelConfirm ? (
                  <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md">
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Tem certeza que deseja cancelar sua assinatura? Você continuará tendo acesso até o final do período atual.
                    </p>
                    <div className="flex space-x-4">
                      <button
                        onClick={handleCancelSubscription}
                        disabled={processingCancel}
                        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-md"
                      >
                        {processingCancel ? 'Processando...' : 'Sim, cancelar'}
                      </button>
                      <button
                        onClick={() => setCancelConfirm(false)}
                        className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-md"
                      >
                        Não, manter assinatura
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCancelConfirm(true)}
                    className="inline-block bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-medium py-2 px-4 rounded-md"
                  >
                    Cancelar assinatura
                  </button>
                )}
                
                <Link
                  href="/pricing"
                  className="inline-block ml-4 text-blue-600 hover:text-blue-500 dark:text-blue-400 font-medium py-2"
                >
                  Ver outros planos
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 