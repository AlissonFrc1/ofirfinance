import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { getPlans, subscribeToPlan, upgradePlan } from '../actions';
import SubscribeButton from '@/components/SubscribeButton';
import { Plan } from '@/types';

export default async function PlansPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const plans = await getPlans();

  const currentSubscription = await prisma.subscription.findFirst({
    where: {
      userId: session.user.id,
      status: 'ACTIVE'
    },
    include: {
      plan: true
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Planos Disponíveis</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan: Plan) => (
          <div key={plan.id} className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold mb-2">{plan.name}</h2>
            <p className="text-gray-600 mb-4">{plan.description}</p>
            <div className="mb-4">
              <span className="text-3xl font-bold">R$ {plan.price}</span>
              <span className="text-gray-500">/{plan.billingCycle === 'MONTHLY' ? 'mês' : 'ano'}</span>
            </div>
            <ul className="mb-6">
              {plan.features.map((feature: string, index: number) => (
                <li key={index} className="flex items-center mb-2">
                  <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <SubscribeButton
              planId={plan.id}
              currentPlanPrice={currentSubscription?.plan.price}
              price={plan.price}
              onSubscribe={subscribeToPlan}
              onUpgrade={upgradePlan}
            />
          </div>
        ))}
      </div>
    </div>
  );
} 