import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };
export const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const status = searchParams.get('status');

    // Construir o filtro base
    const baseFilter: any = {};
    
    // Adicionar filtros condicionais
    if (startDate && endDate) {
      baseFilter.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }
    
    if (category) {
      baseFilter.category = category;
    }

    // Buscar despesas
    const expenses = type !== 'income' ? await prisma.expense.findMany({
      where: {
        ...baseFilter,
        ...(status === 'paid' ? { paid: true } : {}),
        ...(status === 'pending' ? { paid: false } : {}),
      },
      orderBy: {
        date: 'desc',
      },
    }) : [];

    // Buscar receitas
    const incomes = type !== 'expense' ? await prisma.income.findMany({
      where: {
        ...baseFilter,
        ...(status === 'received' ? { received: true } : {}),
        ...(status === 'pending' ? { received: false } : {}),
      },
      orderBy: {
        date: 'desc',
      },
    }) : [];

    // Combinar e ordenar os resultados
    const transactions = [
      ...expenses.map(expense => {
        // Adicionar 4 horas para corrigir o fuso horário
        const date = new Date(expense.date.getTime() + (4 * 60 * 60 * 1000));

        return {
          ...expense,
          date: date.toISOString(), // Usar ISO string para consistência
          type: 'expense' as const,
          status: expense.paid ? 'Pago' : 'Pendente'
        };
      }),
      ...incomes.map(income => {
        // Adicionar 4 horas para corrigir o fuso horário
        const date = new Date(income.date.getTime() + (4 * 60 * 60 * 1000));

        return {
          ...income,
          date: date.toISOString(), // Usar ISO string para consistência
          type: 'income' as const,
          status: income.received ? 'Recebido' : 'Pendente'
        };
      })
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json(
      { error: 'Não foi possível buscar as transações.' },
      { status: 500 }
    );
  }
} 