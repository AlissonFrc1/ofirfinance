'use server';

import { Plan, User } from '@/types';
import prisma from '@/lib/prisma';
import { hash } from 'bcryptjs';

export async function subscribeToPlan(planId: string) {
  try {
    const response = await fetch('/api/subscriptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ planId })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao assinar plano');
    }
  } catch (error) {
    throw error;
  }
}

export async function upgradePlan(planId: string) {
  try {
    const response = await fetch('/api/subscriptions/upgrade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ planId })
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Erro ao fazer upgrade do plano');
    }
  } catch (error) {
    throw error;
  }
}

export async function savePlan(planData: Omit<Plan, 'id'> & { id?: string }) {
  try {
    if (planData.id) {
      const { id, createdAt, updatedAt, ...data } = planData;
      await prisma.plan.update({
        where: { id },
        data
      });
    } else {
      const { createdAt, updatedAt, ...data } = planData;
      await prisma.plan.create({
        data
      });
    }
  } catch (error) {
    throw error;
  }
}

export async function saveUser(userData: Omit<User, 'id' | 'plan' | 'subscriptions' | 'expenses' | 'incomes' | 'cards' | 'createdAt' | 'updatedAt'> & { id?: string; password?: string }) {
  try {
    const { planId, password, ...userDataWithoutPlan } = userData;

    // Se houver senha, hash ela
    const hashedPassword = password ? await hash(password, 10) : undefined;

    if (userData.id) {
      await prisma.user.update({
        where: { id: userData.id },
        data: {
          ...userDataWithoutPlan,
          ...(hashedPassword && { password: hashedPassword }),
          planId: planId || null
        }
      });

      if (planId) {
        // Atualizar ou criar assinatura
        const existingSubscription = await prisma.subscription.findFirst({
          where: {
            userId: userData.id,
            status: 'ACTIVE'
          }
        });

        if (existingSubscription) {
          await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: { planId }
          });
        } else {
          await prisma.subscription.create({
            data: {
              userId: userData.id,
              planId,
              status: 'ACTIVE',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
            }
          });
        }
      }
    } else {
      if (!hashedPassword) {
        throw new Error('Senha é obrigatória para criar um novo usuário');
      }

      await prisma.user.create({
        data: {
          ...userDataWithoutPlan,
          password: hashedPassword,
          planId: planId || null
        }
      });
    }
  } catch (error) {
    throw error;
  }
}

export async function getPlans() {
  try {
    const plans = await prisma.plan.findMany({
      where: { active: true }
    });
    return plans;
  } catch (error) {
    throw error;
  }
} 