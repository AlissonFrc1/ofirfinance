'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface SubscribeButtonProps {
  planId: string;
  currentPlanPrice?: number;
  price: number;
  onSubscribe: (planId: string) => Promise<void>;
  onUpgrade: (planId: string) => Promise<void>;
}

export default function SubscribeButton({
  planId,
  currentPlanPrice,
  price,
  onSubscribe,
  onUpgrade
}: SubscribeButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);

    try {
      await onSubscribe(planId);
      toast.success('Plano assinado com sucesso!');
      router.refresh();
    } catch (error) {
      console.error('Erro ao assinar plano:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao assinar plano');
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async () => {
    if (!currentPlanPrice) return;

    if (currentPlanPrice > price) {
      toast.error('Você já tem um plano com mais recursos');
      return;
    }

    if (!confirm('Deseja realmente fazer upgrade do seu plano?')) {
      return;
    }

    setLoading(true);

    try {
      await onUpgrade(planId);
      toast.success('Plano atualizado com sucesso!');
      router.refresh();
    } catch (error) {
      console.error('Erro ao fazer upgrade do plano:', error);
      toast.error(error instanceof Error ? error.message : 'Erro ao fazer upgrade do plano');
    } finally {
      setLoading(false);
    }
  };

  if (currentPlanPrice) {
    if (currentPlanPrice > price) {
      return (
        <div className="text-center">
          <p className="text-sm text-gray-500 mb-2">
            Você já tem um plano com mais recursos
          </p>
          <button
            type="button"
            disabled
            className="w-full px-4 py-2 text-sm font-medium text-white bg-gray-400 rounded-md cursor-not-allowed"
          >
            Plano Atual
          </button>
        </div>
      );
    }

    if (currentPlanPrice < price) {
      return (
        <button
          type="button"
          onClick={handleUpgrade}
          disabled={loading}
          className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
        >
          {loading ? 'Atualizando...' : 'Fazer Upgrade'}
        </button>
      );
    }
  }

  return (
    <button
      type="button"
      onClick={handleSubscribe}
      disabled={loading}
      className="w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
    >
      {loading ? 'Assinando...' : 'Assinar Agora'}
    </button>
  );
} 