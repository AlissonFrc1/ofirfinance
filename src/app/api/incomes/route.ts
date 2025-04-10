import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

type ValidFields = 'value' | 'received' | 'recurring' | 'date' | 'nextDate' | 
                  'category' | 'subcategory' | 'fixed' | 'description';

type IncomeCreateData = {
  [K in ValidFields]?: K extends 'value' ? number | string :
                      K extends 'date' | 'nextDate' ? string | Date :
                      K extends 'received' | 'recurring' | 'fixed' ? boolean :
                      string;
};

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
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const category = searchParams.get('category');
    const received = searchParams.get('received');

    const where: any = {
      userId
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      };
    }

    if (category) {
      where.category = category;
    }

    if (received !== null) {
      where.received = received === 'true';
    }

    const incomes = await prisma.income.findMany({
      where,
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(incomes);
  } catch (error) {
    console.error('Erro ao buscar receitas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar receitas' },
      { status: 500 }
    );
  }
}

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
    const data: IncomeCreateData = await request.json();

    if (!data.value || !data.category) {
      return NextResponse.json(
        { error: 'Valor e categoria são obrigatórios' },
        { status: 400 }
      );
    }

    const income = await prisma.income.create({
      data: {
        value: new Decimal(data.value as string),
        date: new Date(data.date as string),
        nextDate: data.nextDate ? new Date(data.nextDate as string) : null,
        category: data.category,
        subcategory: data.subcategory || 'OUTROS',
        received: data.received ?? false,
        recurring: data.recurring ?? false,
        fixed: data.fixed ?? false,
        description: data.description,
        userId
      }
    });

    return NextResponse.json(income);
  } catch (error) {
    console.error('Erro ao criar receita:', error);
    return NextResponse.json(
      { error: 'Erro ao criar receita' },
      { status: 500 }
    );
  }
} 