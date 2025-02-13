import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { CardExpense as PrismaCardExpense, Prisma } from "@prisma/client";

interface CardExpense extends PrismaCardExpense {
  endRecurrenceDate: Date | null;
  parcela_atual?: number;
  total_parcelas?: number;
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

    // Buscar todas as despesas do cartão
    const baseExpenses = await prisma.cardExpense.findMany({
      where: {
        cardId: cardId,
        OR: [
          // Despesas normais dentro do período
          {
            dueDate: {
              gte: new Date(startDate),
              lte: new Date(endDate)
            },
            fixed: false,
            installments: null
          },
          // Despesas parceladas que podem ter parcelas no período
          {
            AND: [
              { installments: { gt: 1 } },
              {
                dueDate: {
                  gte: new Date(new Date(startDate).setMonth(new Date(startDate).getMonth() - 12))
                }
              }
            ]
          },
          // Despesas fixas que começam antes ou durante o período
          {
            fixed: true,
            date: {
              lte: new Date(endDate)
            }
          }
        ]
      },
      orderBy: {
        dueDate: 'desc'
      }
    }) as CardExpense[];

    // Data limite para despesas fixas sem data final (12 meses a partir de hoje)
    const defaultEndDate = new Date();
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 12);

    // Processar todas as despesas
    let processedExpenses: CardExpense[] = [];
    
    for (const expense of baseExpenses) {
      // Caso 1: Despesa normal (não parcelada e não fixa)
      if (!expense.fixed && (!expense.installments || expense.installments <= 1)) {
        if (expense.dueDate >= new Date(startDate) && expense.dueDate <= new Date(endDate)) {
          processedExpenses.push(expense);
        }
        continue;
      }

      // Caso 2: Despesa parcelada
      if (expense.installments && expense.installments > 1) {
        const valorParcela = Number(expense.value) / expense.installments;
        
        for (let i = 0; i < expense.installments; i++) {
          const dueDate = new Date(expense.dueDate);
          dueDate.setMonth(dueDate.getMonth() + i);

          if (dueDate >= new Date(startDate) && dueDate <= new Date(endDate)) {
            processedExpenses.push({
              ...expense,
              dueDate: dueDate,
              value: new Prisma.Decimal(valorParcela),
              parcela_atual: i + 1,
              total_parcelas: expense.installments
            });
          }
        }
        continue;
      }

      // Caso 3: Despesa fixa
      if (expense.fixed) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const expenseStartDate = new Date(expense.date);
        const endRecurrenceDate = expense.endRecurrenceDate 
          ? new Date(expense.endRecurrenceDate) 
          : defaultEndDate;

        let currentDate = new Date(expenseStartDate);

        while (currentDate <= endRecurrenceDate && currentDate <= endDateObj) {
          if (currentDate >= startDateObj && currentDate <= endDateObj) {
            processedExpenses.push({
              ...expense,
              date: new Date(currentDate),
              dueDate: new Date(currentDate)
            });
          }

          currentDate = new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + 1,
            currentDate.getDate()
          );
        }
      }
    }

    // Calcular o total
    const total = processedExpenses.reduce((acc, expense) => {
      return acc + Number(expense.value);
    }, 0);

    // Formatar as datas para retorno
    const formattedExpenses = processedExpenses.map(expense => ({
      ...expense,
      date: expense.date.toISOString().split('T')[0],
      dueDate: expense.dueDate.toISOString().split('T')[0],
      value: Number(expense.value),
      description: expense.installments && expense.installments > 1
        ? `${expense.description || ''} (${expense.parcela_atual}/${expense.total_parcelas})`
        : expense.description
    }));

    return NextResponse.json({
      total,
      expenses: formattedExpenses,
      period: {
        start: startDate,
        end: endDate
      }
    });
  } catch (error) {
    console.error('Erro ao buscar despesas do cartão:', error);
    return NextResponse.json({
      error: 'Erro ao buscar despesas do cartão',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 