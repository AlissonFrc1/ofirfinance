import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Verificar se o plano existe e está ativo
    const plan = await prisma.plan.findUnique({
      where: { id: planId }
    });

    if (!plan || !plan.active) {
      return NextResponse.json(
        { error: 'Invalid or inactive plan' },
        { status: 400 }
      );
    }

    // Encontrar a assinatura atual do usuário
    const currentSubscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      },
      include: {
        plan: true
      }
    });

    if (!currentSubscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Verificar se o novo plano é mais caro que o atual
    if (plan.price <= currentSubscription.plan.price) {
      return NextResponse.json(
        { error: 'New plan must be more expensive than current plan' },
        { status: 400 }
      );
    }

    // Atualizar a assinatura para o novo plano
    const updatedSubscription = await prisma.subscription.update({
      where: { id: currentSubscription.id },
      data: {
        planId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 dias
      },
      include: {
        plan: true
      }
    });

    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error('Erro ao fazer upgrade da assinatura:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 