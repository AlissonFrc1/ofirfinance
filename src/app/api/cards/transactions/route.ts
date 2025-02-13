import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const cardId = searchParams.get('cardId');
    const category = searchParams.get('category');
    const minValue = searchParams.get('minValue');
    const maxValue = searchParams.get('maxValue');
    const fixed = searchParams.get('fixed');
    const recurring = searchParams.get('recurring');

    if (!startDate || !endDate) {
      return NextResponse.json({
        error: 'Parâmetros de data são obrigatórios'
      }, { status: 400 });
    }

    // Construir o filtro base
    const where: any = {
      dueDate: {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    };

    // Adicionar filtros opcionais
    if (cardId) where.cardId = cardId;
    if (category) where.category = { contains: category, mode: 'insensitive' };
    if (minValue) where.value = { ...where.value, gte: parseFloat(minValue) };
    if (maxValue) where.value = { ...where.value, lte: parseFloat(maxValue) };
    if (fixed === 'true') where.fixed = true;
    if (recurring === 'true') where.recurring = true;

    // Buscar transações com informações do cartão
    const transactions = await prisma.cardExpense.findMany({
      where,
      include: {
        card: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    // Formatar os dados para retorno
    const formattedTransactions = transactions.map(transaction => ({
      ...transaction,
      cardName: transaction.card.name,
      card: undefined
    }));

    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    return NextResponse.json({
      error: 'Erro ao buscar transações',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, ...data } = await request.json();

    if (!id) {
      return NextResponse.json({
        error: 'ID da transação é obrigatório'
      }, { status: 400 });
    }

    // Converter datas para objetos Date
    if (data.date) data.date = new Date(data.date);
    if (data.dueDate) data.dueDate = new Date(data.dueDate);

    // Lógica específica para recorrência
    if ('recurring' in data) {
      if (data.recurring) {
        // Ao ativar recorrência, limpar data final de recorrência
        data.endRecurrenceDate = null;
      } else {
        // Ao desativar, usar a data enviada
        if (data.endRecurrenceDate) {
          const originalTransaction = await prisma.cardExpense.findUnique({
            where: { id }
          });

          if (originalTransaction) {
            const originalDate = new Date(originalTransaction.date);
            const endRecurrenceDate = new Date(data.endRecurrenceDate);
            
            // Encontrar o último dia do mês
            const lastDayOfMonth = new Date(endRecurrenceDate.getFullYear(), endRecurrenceDate.getMonth() + 1, 0).getDate();
            
            // Definir o dia como o menor entre o dia original e o último dia do mês
            endRecurrenceDate.setDate(Math.min(originalDate.getDate(), lastDayOfMonth));
            
            data.endRecurrenceDate = endRecurrenceDate;
          }
        }
      }
    }

    // Converter valor para Decimal
    if (data.value) data.value = Number(data.value);

    // Converter fixed para boolean se presente
    if ('fixed' in data) {
      data.fixed = Boolean(data.fixed);
    }

    const transaction = await prisma.cardExpense.update({
      where: { id },
      data
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    return NextResponse.json({
      error: 'Erro ao atualizar transação',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({
        error: 'ID da transação é obrigatório'
      }, { status: 400 });
    }

    await prisma.cardExpense.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir transação:', error);
    return NextResponse.json({
      error: 'Erro ao excluir transação',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 