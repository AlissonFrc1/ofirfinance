"use client";

import { ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SubscriptionGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectToPlans?: boolean;
}

export function SubscriptionGuard({ 
  children, 
  fallback, 
  redirectToPlans = false 
}: SubscriptionGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (status !== 'authenticated') {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/subscriptions');
        
        if (response.status === 200) {
          const subscription = await response.json();
          setHasSubscription(subscription.status === 'active');
        } else {
          setHasSubscription(false);
        }
      } catch (error) {
        console.error('Erro ao verificar assinatura:', error);
        setHasSubscription(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, [status]);

  // Redirecionamento para login se não estiver autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Redirecionamento para planos se não tiver assinatura
  useEffect(() => {
    if (redirectToPlans && hasSubscription === false && !loading && status === 'authenticated') {
      router.push('/pricing');
    }
  }, [redirectToPlans, hasSubscription, loading, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null; // Será redirecionado pelo useEffect
  }

  if (hasSubscription === false) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/30 p-6 rounded-lg text-center">
        <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 mb-3">
          Recurso disponível apenas para assinantes
        </h3>
        <p className="text-yellow-700 dark:text-yellow-300 mb-4">
          Assine um de nossos planos para acessar este recurso e muito mais.
        </p>
        <Link
          href="/pricing"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md"
        >
          Ver planos
        </Link>
      </div>
    );
  }

  return <>{children}</>;
} 