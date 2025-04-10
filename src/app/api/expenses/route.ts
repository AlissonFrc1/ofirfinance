import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { Decimal } from '@prisma/client/runtime/library';

type ValidFields = 'value' | 'paid' | 'recurring' | 'date' | 'nextDate' | 
                  'paymentMethod' | 'category' | 'subcategory' | 
                  'fixed' | 'installments' | 'description' | 'dueDay';

type ExpenseCreateData = {
  [K in ValidFields]?: K extends 'value' ? number | string :
                      K extends 'date' | 'nextDate' ? string | Date :
                      K extends 'paid' | 'recurring' | 'fixed' ? boolean :
                      K extends 'installments' | 'dueDay' ? number :
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
    const paid = searchParams.get('paid');

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

    if (paid !== null) {
      where.paid = paid === 'true';
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: {
        date: 'desc'
      }
    });

    return NextResponse.json(expenses);
  } catch (error) {
    console.error('Erro ao buscar despesas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar despesas' },
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
    const data: ExpenseCreateData = await request.json();

    if (!data.value || !data.category || !data.paymentMethod) {
      return NextResponse.json(
        { error: 'Valor, categoria e método de pagamento são obrigatórios' },
        { status: 400 }
      );
    }

    const expense = await prisma.expense.create({
      data: {
        value: new Decimal(data.value as string),
        date: new Date(data.date as string),
        nextDate: data.nextDate ? new Date(data.nextDate as string) : null,
        paymentMethod: data.paymentMethod,
        category: data.category,
        subcategory: data.subcategory || 'OUTROS',
        paid: data.paid ?? false,
        recurring: data.recurring ?? false,
        fixed: data.fixed ?? false,
        installments: data.installments,
        description: data.description,
        dueDay: data.dueDay,
        userId
      }
    });

    return NextResponse.json(expense);
  } catch (error) {
    console.error('Erro ao criar despesa:', error);
    return NextResponse.json(
      { error: 'Erro ao criar despesa' },
      { status: 500 }
    );
  }
}
