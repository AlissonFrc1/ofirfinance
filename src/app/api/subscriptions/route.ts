import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { add } from 'date-fns';
import prisma from '@/lib/prisma';

// Buscar a assinatura do usuário atual
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {
      userId
    };

    if (status) {
      where.status = status;
    }

    const subscriptions = await prisma.subscription.findMany({
      where,
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Erro ao buscar assinaturas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar assinaturas' },
      { status: 500 }
    );
  }
}

// Criar uma nova assinatura
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const data = await request.json();

    if (!data.planId) {
      return NextResponse.json(
        { error: 'ID do plano é obrigatório' },
        { status: 400 }
      );
    }

    // Verificar se o plano existe
    const plan = await prisma.plan.findUnique({
      where: { id: data.planId }
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plano não encontrado' },
        { status: 404 }
      );
    }

    // Verificar se o usuário já tem uma assinatura ativa
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: 'ACTIVE'
      }
    });

    if (activeSubscription) {
      return NextResponse.json(
        { error: 'Usuário já possui uma assinatura ativa' },
        { status: 400 }
      );
    }

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        planId: data.planId,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(new Date().setMonth(new Date().getMonth() + 1))
      },
      include: {
        plan: true
      }
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Erro ao criar assinatura:', error);
    return NextResponse.json(
      { error: 'Erro ao criar assinatura' },
      { status: 500 }
    );
  }
}

// Cancelar uma assinatura
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const { cancelAtPeriodEnd } = await request.json();
    
    // Buscar a assinatura atual do usuário
    const subscription = await prisma.subscription.findFirst({
      where: { 
        userId: session.user.id,
        status: 'ACTIVE'
      }
    });
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Atualizar a assinatura para cancelar no final do período atual
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: cancelAtPeriodEnd === true ? 'CANCELED' : 'ACTIVE'
      },
    });
    
    return NextResponse.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Encontrar a assinatura ativa do usuário
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId: session.user.id,
        status: 'ACTIVE'
      }
    });

    if (!subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    // Atualizar o status da assinatura para CANCELED
    await prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: 'CANCELED' }
    });

    return NextResponse.json({ message: 'Subscription canceled successfully' });
  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 