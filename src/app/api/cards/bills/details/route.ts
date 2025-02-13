import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

interface CardExpense {
  id: string;
  value: Prisma.Decimal;
  date: Date;
  dueDate: Date;
  cardId: string;
  category: string;
  subcategory: string;
  recurring: boolean;
  fixed: boolean;
  installments: number | null;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cardId = searchParams.get('cardId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!cardId || !startDate || !endDate) {
      return NextResponse.json({
        error: 'Parâmetros inválidos'
      }, { status: 400 });
    }

    console.log('Buscando despesas do cartão:', {
      cardId,
      startDate,
      endDate
    });

    // Buscar informações do cartão
    const card = await prisma.card.findUnique({
      where: { id: cardId }
    });

    if (!card) {
      return NextResponse.json({
        error: 'Cartão não encontrado'
      }, { status: 404 });
    }

    // Buscar despesas do período usando a data de vencimento
    const expenses = await prisma.$queryRaw<CardExpense[]>`
      SELECT *
      FROM "CardExpense"
      WHERE "cardId" = ${cardId}
      AND "dueDate" >= ${new Date(startDate)}
      AND "dueDate" <= ${new Date(endDate)}
      ORDER BY "dueDate" DESC
    `;

    console.log('Despesas encontradas:', {
      total: expenses.length,
      periodo: {
        inicio: startDate,
        fim: endDate
      },
      despesas: expenses.map(e => ({
        id: e.id,
        data: e.date,
        dataVencimento: e.dueDate,
        valor: e.value,
        categoria: e.category
      }))
    });

    // Calcular totais considerando parcelas
    const total = expenses.reduce((acc, expense) => {
      const value = Number(expense.value);
      if (expense.installments && expense.installments > 1) {
        return acc + (value / expense.installments);
      }
      return acc + value;
    }, 0);

    // Agrupar por categoria
    const byCategory = expenses.reduce((acc, expense) => {
      const value = Number(expense.value);
      const amount = expense.installments && expense.installments > 1
        ? value / expense.installments
        : value;

      if (!acc[expense.category]) {
        acc[expense.category] = {
          total: 0,
          expenses: []
        };
      }

      acc[expense.category].total += amount;
      acc[expense.category].expenses.push({
        ...expense,
        date: expense.date.toISOString().split('T')[0],
        dueDate: expense.dueDate.toISOString().split('T')[0],
        value: amount
      });

      return acc;
    }, {} as Record<string, { total: number; expenses: any[] }>);

    return NextResponse.json({
      card: {
        name: card.name,
        lastDigits: card.lastDigits,
        dueDay: card.dueDay,
        closingDay: card.closingDay
      },
      period: {
        start: startDate,
        end: endDate
      },
      total,
      byCategory,
      expenses: expenses.map(expense => ({
        ...expense,
        date: expense.date.toISOString().split('T')[0],
        dueDate: expense.dueDate.toISOString().split('T')[0],
        value: expense.installments && expense.installments > 1
          ? Number(expense.value) / expense.installments
          : Number(expense.value)
      }))
    });
  } catch (error) {
    console.error('Erro ao buscar detalhes da fatura:', error);
    return NextResponse.json({
      error: 'Erro ao buscar detalhes da fatura',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 