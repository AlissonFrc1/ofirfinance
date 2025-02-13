import { NextResponse } from 'next/server';
import prisma from "@/lib/prisma";
import { CardExpense as PrismaCardExpense, Prisma } from "@prisma/client";

// Função para formatar moeda
function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

interface CardExpense extends PrismaCardExpense {
  endRecurrenceDate: Date | null;
  parcela_atual?: number;
  total_parcelas?: number;
}

interface FormattedCardExpense {
  id: string;
  value: number;
  date: string;
  dueDate: string;
  cardId: string;
  category: string;
  subcategory: string;
  recurring: boolean;
  fixed: boolean;
  installments: number | null;
  description: string | null;
  endRecurrenceDate: string | null;
  parcela_atual?: number;
  total_parcelas?: number;
  originalExpense: CardExpense;
}

interface GroupedExpenses {
  month: Date;
  total: number;
  expenses: FormattedCardExpense[];
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
              lte: new Date(endDate),
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
              lte: new Date(endDate),
            },
          },
          // Despesas com data final definida, independente do status fixed
          {
            endRecurrenceDate: {
              not: null,
              gte: new Date(startDate),
              lte: new Date(endDate)
            }
          }
        ],
      },
      orderBy: {
        dueDate: 'desc',
      },
    }) as CardExpense[];

    // Log detalhado para investigar dueDate
    console.log('🕵️ Despesas encontradas no backend:', baseExpenses.map(expense => ({
      id: expense.id,
      description: expense.description,
      value: expense.value,
      date: expense.date,
      dueDate: expense.dueDate,
      cardId: expense.cardId,
      installments: expense.installments
    })));

    // Data limite para despesas fixas sem data final (12 meses a partir de hoje)
    const defaultEndDate = new Date();
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 12);

    // Processar todas as despesas
    let processedExpenses: CardExpense[] = [];
    
    for (const expense of baseExpenses) {
      // Caso 1: Despesa normal (não parcelada e não fixa)
      if (!expense.fixed && (!expense.installments || expense.installments <= 1)) {
        console.log('Processando despesa não fixa:', {
          id: expense.id,
          description: expense.description,
          dueDate: expense.dueDate,
          startDate,
          endDate,
          isWithinRange: expense.dueDate >= new Date(startDate) && expense.dueDate <= new Date(endDate)
        });

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

      // Caso 3: Despesa fixa ou com data final
      if (expense.fixed || expense.endRecurrenceDate) {
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        const expenseDueDate = new Date(expense.dueDate);
        const originalDate = new Date(expense.date);
        const endRecurrenceDate = expense.endRecurrenceDate 
          ? new Date(expense.endRecurrenceDate) 
          : defaultEndDate;

        let currentDueDate = new Date(expenseDueDate);
        const processedExpenseKeys = new Set<string>();

        while (currentDueDate <= endRecurrenceDate && currentDueDate <= endDateObj) {
          // Criar chave única que considera ID, valor e data de vencimento
          const uniqueExpenseKey = `${expense.id}-${Number(expense.value)}-${currentDueDate.toISOString().split('T')[0]}`;
          
          if (currentDueDate >= startDateObj && 
              currentDueDate <= endDateObj && 
              !processedExpenseKeys.has(uniqueExpenseKey)) {
            const recurrentExpense = {
              ...expense,
              date: originalDate,
              dueDate: currentDueDate
            };

            console.log('Processando despesa recorrente:', {
              uniqueExpenseKey,
              id: recurrentExpense.id,
              description: recurrentExpense.description,
              originalDate: expense.date,
              dueDate: recurrentExpense.dueDate,
              startDate,
              endDate,
              isWithinRange: currentDueDate >= startDateObj && currentDueDate <= endDateObj
            });

            processedExpenses.push(recurrentExpense);
            processedExpenseKeys.add(uniqueExpenseKey);
          }

          currentDueDate = new Date(currentDueDate);
          currentDueDate.setMonth(currentDueDate.getMonth() + 1);
        }
      }
    }

    // Agrupar por mês
    const groupedExpenses = processedExpenses.reduce((acc: Record<string, GroupedExpenses>, expense: CardExpense) => {
      const month = new Date(expense.dueDate);
      month.setDate(1); // Primeiro dia do mês
      month.setHours(0, 0, 0, 0); // Zerar horas

      const monthKey = month.toISOString();

      if (!acc[monthKey]) {
        acc[monthKey] = {
          month,
          total: 0,
          expenses: [],
        };
      }

      // Formatar a despesa antes de adicionar ao grupo
      const formattedExpense: FormattedCardExpense = {
        ...expense,
        date: expense.date.toISOString().split('T')[0],
        dueDate: expense.dueDate.toISOString().split('T')[0],
        value: Number(expense.value),
        endRecurrenceDate: expense.endRecurrenceDate?.toISOString().split('T')[0] || null,
        description: expense.installments && expense.installments > 1
          ? `${expense.description || expense.subcategory || 'Despesa'} (${expense.parcela_atual}/${expense.total_parcelas})`
          : expense.description || expense.subcategory || 'Despesa',
        originalExpense: expense
      };

      acc[monthKey].expenses.push(formattedExpense);
      acc[monthKey].total += Number(expense.value);

      return acc;
    }, {});

    // Converter para array e ordenar por mês
    const result = Object.values(groupedExpenses).sort(
      (a: GroupedExpenses, b: GroupedExpenses) => b.month.getTime() - a.month.getTime()
    );

    console.group('🔍 Resultado Final da API - Histórico de Cartão');
    console.log('Total de grupos:', result.length);
    
    result.forEach((grupo, index) => {
      console.group(`Grupo ${index}`);
      console.log('Mês:', grupo.month);
      console.log('Total do mês:', grupo.total);
      console.log('Quantidade de despesas:', grupo.expenses.length);
      
      grupo.expenses.forEach((despesa, expenseIndex) => {
        console.group(`Despesa ${expenseIndex}`);
        console.log('Descrição:', despesa.description);
        console.log('Valor:', despesa.value);
        console.log('Parcelas:', despesa.installments);
        console.log('Parcela atual:', despesa.parcela_atual);
        console.log('Total de parcelas:', despesa.total_parcelas);
        console.log('Objeto completo:', despesa);
        console.groupEnd();
      });
      
      console.groupEnd();
    });
    
    console.groupEnd();

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    return NextResponse.json({
      error: 'Erro ao buscar histórico'
    }, { status: 500 });
  }
} 