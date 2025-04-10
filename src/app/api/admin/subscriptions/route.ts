import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Lista todas as assinaturas (apenas admin)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Verifica se o usuário está autenticado e é um admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Buscar todas as assinaturas com informações de usuário e plano
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: true,
        plan: true
      }
    });
    
    return NextResponse.json(subscriptions);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const subscription = await prisma.subscription.create({
      data: {
        userId: body.userId,
        planId: body.planId,
        status: body.status,
        currentPeriodStart: body.currentPeriodStart,
        currentPeriodEnd: body.currentPeriodEnd
      }
    });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 