import { NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Dados recebidos para criar cartão:', data);

    // Validação dos dados
    if (!data.name || !data.lastDigits || !data.limit || 
        !data.dueDay || !data.closingDay) {
      console.error('Dados inválidos:', data);
      return NextResponse.json({
        error: 'Todos os campos são obrigatórios',
        receivedData: data
      }, { status: 400 });
    }

    // Converte os dados para o formato correto
    const cardData = {
      name: String(data.name),
      brand: String(data.bank),
      lastDigits: String(data.lastDigits),
      limit: Number(data.limit),
      dueDay: Number(data.dueDay),
      closingDay: Number(data.closingDay),
      color: data.color || '#000000'
    };

    console.log('Tentando criar cartão com os dados:', cardData);

    const result = await prisma.card.create({
      data: cardData
    });

    console.log('Cartão criado com sucesso:', result);
    return NextResponse.json(result, { status: 201 });

  } catch (error) {
    console.error('Erro detalhado ao criar cartão:', error);
    
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      console.error('Erro do Prisma:', {
        code: error.code,
        message: error.message,
        meta: error.meta
      });
      return NextResponse.json({
        error: 'Erro ao criar cartão',
        code: error.code,
        message: error.message,
        meta: error.meta
      }, { status: 400 });
    }
    
    return NextResponse.json({
      error: 'Erro ao criar cartão',
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const cards = await prisma.card.findMany();
    
    // Processar cada cartão para adicionar valor da fatura atual
    const cardsWithBillValue = await Promise.all(cards.map(async (card) => {
      const currentDate = new Date();
      const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      // Buscar todas as despesas do cartão
      const baseExpenses = await prisma.cardExpense.findMany({
        where: {
          cardId: card.id,
          OR: [
            // Despesas normais dentro do período
            {
              dueDate: {
                gte: startDate,
                lte: endDate,
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
                    gte: new Date(startDate.getFullYear(), startDate.getMonth() - 12, 1)
                  }
                }
              ]
            },
            // Despesas fixas que começam antes ou durante o período
            {
              fixed: true,
              date: {
                lte: endDate,
              },
            },
            // Despesas com data final definida, independente do status fixed
            {
              endRecurrenceDate: {
                not: null,
                gte: startDate,
                lte: endDate
              }
            }
          ],
        },
        orderBy: {
          dueDate: 'desc',
        },
      });

      // Data limite para despesas fixas sem data final (12 meses a partir de hoje)
      const defaultEndDate = new Date();
      defaultEndDate.setMonth(defaultEndDate.getMonth() + 12);

      // Processar todas as despesas
      let processedExpenses: any[] = [];
      
      for (const expense of baseExpenses) {
        // Caso 1: Despesa normal (não parcelada e não fixa)
        if (!expense.fixed && (!expense.installments || expense.installments <= 1)) {
          if (expense.dueDate >= startDate && expense.dueDate <= endDate) {
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

            if (dueDate >= startDate && dueDate <= endDate) {
              const parcelaAtual = i + 1;
              processedExpenses.push({
                ...expense,
                dueDate: dueDate,
                value: expense.value,
                parcela_atual: parcelaAtual,
                total_parcelas: expense.installments,
                description: expense.description
              });
            }
          }
          continue;
        }

        // Caso 3: Despesa fixa
        if (expense.fixed) {
          const startDateObj = startDate;
          const endDateObj = endDate;
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

        // Caso 4: Despesas com data final, independente de ser fixa
        if (expense.endRecurrenceDate) {
          const startDateObj = startDate;
          const endDateObj = endDate;
          const expenseStartDate = new Date(expense.date);
          const endRecurrenceDate = new Date(expense.endRecurrenceDate);

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

      // Calcular valor total da fatura
      const currentBill = processedExpenses.reduce((total, expense) => {
        return total + Number(expense.value);
      }, 0);

      return {
        ...card,
        currentBill: Number(currentBill.toFixed(2))
      };
    }));

    return NextResponse.json(cardsWithBillValue);
  } catch (error) {
    console.error('Erro ao buscar cartões:', error);
    return NextResponse.json({
      error: 'Erro ao buscar cartões',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const data = await request.json();
    console.log('Dados recebidos para atualização:', data);
    
    const result = await prisma.card.update({
      where: { id: data.id },
      data: {
        limit: Number(data.limit),
        dueDay: Number(data.dueDay),
        closingDay: Number(data.closingDay),
        color: data.color
      }
    });

    console.log('Cartão atualizado:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar cartão:', error);
    return NextResponse.json({
      error: 'Erro ao atualizar cartão',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        error: 'ID não fornecido'
      }, { status: 400 });
    }

    await prisma.card.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao deletar cartão:', error);
    return NextResponse.json({
      error: 'Erro ao deletar cartão',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 