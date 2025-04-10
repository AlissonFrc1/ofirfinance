import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Páginas que podem ser restritas por plano
const ALL_PAGES = [
  '/agenda',
  '/dashboard',
  '/transactions',
  '/wallets',
  '/budgets',
  '/goals',
  '/cards',
  '/cards/transactions'
];

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  billingCycle: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  allowedPages: string[];
}

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const plans = await prisma.plan.findMany({
      orderBy: {
        price: 'asc'
      }
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const plan = await prisma.plan.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        billingCycle: body.billingCycle,
        features: body.features,
        allowedPages: body.allowedPages,
        active: body.active
      }
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 