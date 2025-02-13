import { NextResponse } from 'next/server';
import prisma from '../../../../../lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Buscando histórico do cartão:', params.id);

    // Buscar todas as despesas do cartão com informações completas
    const expenses = await prisma.cardExpense.findMany({
      where: {
        cardId: params.id
      },
      orderBy: {
        date: 'desc'
      },
      select: {
        id: true,
        value: true,
        date: true,
        description: true,
        category: true,
        subcategory: true,
        installments: true,
        fixed: true,
        recurring: true
      }
    });

    // Log detalhado das despesas
    console.log('Despesas encontradas:', {
      total: expenses.length,
      despesas: expenses.map(e => ({
        id: e.id,
        data: e.date,
        dataOriginal: e.date.toISOString(),
        dataFormatada: e.date.toLocaleDateString('pt-BR', { timeZone: 'UTC' }),
        valor: e.value,
        descricao: e.description,
        categoria: e.category,
        subcategoria: e.subcategory,
        parcelas: e.installments
      }))
    });

    // Retornar as datas exatamente como estão no banco, sem conversão
    const formattedExpenses = expenses.map(expense => ({
      ...expense,
      date: expense.date.toISOString().split('T')[0] // Mantém a data original sem ajuste de fuso horário
    }));

    return NextResponse.json({ expenses: formattedExpenses });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico do cartão' },
      { status: 500 }
    );
  }
} 