import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { CardExpense as PrismaCardExpense, Prisma } from '@prisma/client';

interface ExtendedCardExpense extends PrismaCardExpense {
  endRecurrenceDate: Date | null;
  parcela_atual?: number;
  total_parcelas?: number;
}

console.log('Prisma importado:', !!prisma);
console.log('Métodos disponíveis:', Object.keys(prisma));

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const cardId = searchParams.get('cardId');
    const startDateStr = searchParams.get('startDate');
    const endDateStr = searchParams.get('endDate');

    console.log('Parâmetros recebidos na API:', {
      cardId,
      startDateStr,
      endDateStr
    });

    if (!cardId || !startDateStr || !endDateStr) {
      return NextResponse.json({ 
        error: 'Parâmetros inválidos' 
      }, { status: 400 });
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    console.log('Datas processadas:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    });

    console.log('🔍 Parâmetros de Busca Detalhados:', {
      cardId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      startMonth: startDate.getMonth(),
      startYear: startDate.getFullYear(),
      endMonth: endDate.getMonth(),
      endYear: endDate.getFullYear()
    });

    // Verificar se o cartão existe
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: { id: true }
    });

    if (!card) {
      console.error('Cartão não encontrado:', cardId);
      return NextResponse.json({ 
        error: 'Cartão não encontrado' 
      }, { status: 404 });
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
    }) as ExtendedCardExpense[];

    // Data limite para despesas fixas sem data final (12 meses a partir de hoje)
    const defaultEndDate = new Date();
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 12);

    // Expandir período de processamento
    const expandedStartDate = new Date(startDate);
    expandedStartDate.setMonth(expandedStartDate.getMonth() - 1);
    const expandedEndDate = new Date(endDate);
    expandedEndDate.setMonth(expandedEndDate.getMonth() + 1);

    console.log('🔍 Período Expandido:', {
      startDate: expandedStartDate.toISOString(),
      endDate: expandedEndDate.toISOString()
    });

    // Processar todas as despesas
    const processedExpenses: ExtendedCardExpense[] = [];
    const processedExpenseKeys = new Set<string>();

    // Função para gerar chave única considerando mais atributos
    const generateUniqueKey = (expense: ExtendedCardExpense & { parcela_atual?: number }) => {
      const baseKey = `${expense.id}-${Number(expense.value)}-${expense.dueDate.toISOString().split('T')[0]}`;
      const parcelaKey = expense.parcela_atual ? `-${expense.parcela_atual}` : '';
      const descriptionKey = expense.description ? `-${expense.description}` : '';
      return `${baseKey}${parcelaKey}${descriptionKey}`;
    };

    // Função para processar despesas
    const processExpense = (expense: ExtendedCardExpense) => {
      console.log(`🔍 Processando despesa: ${expense.id}`, {
        valor: Number(expense.value),
        dataVencimento: expense.dueDate,
        fixa: expense.fixed,
        parcelada: expense.installments && expense.installments > 1,
        descricao: expense.description
      });

      // Caso 1: Despesa normal (não parcelada e não fixa)
      if (!expense.fixed && (!expense.installments || expense.installments <= 1)) {
        const uniqueKey = generateUniqueKey(expense);
        if (expense.dueDate >= expandedStartDate && expense.dueDate <= expandedEndDate && 
            !processedExpenseKeys.has(uniqueKey)) {
          processedExpenses.push(expense);
          processedExpenseKeys.add(uniqueKey);
          console.log(`✅ Despesa normal adicionada: ${expense.id}`);
        }
        return;
      }

      // Caso 2: Despesa parcelada
      if (expense.installments && expense.installments > 1) {
        const valorTotal = Number(expense.value);
        const valorParcela = new Prisma.Decimal(valorTotal / expense.installments);
        
        for (let i = 0; i < expense.installments; i++) {
          const dueDate = new Date(expense.dueDate);
          dueDate.setMonth(dueDate.getMonth() + i);

          const parcelaAtual = i + 1;
          const despesaParcela = {
            ...expense,
            dueDate: dueDate,
            value: valorParcela,
            parcela_atual: parcelaAtual,
            total_parcelas: expense.installments,
            description: `${expense.description || ''} (${parcelaAtual}/${expense.installments})`
          };

          const uniqueKey = generateUniqueKey(despesaParcela);
          if (dueDate >= expandedStartDate && dueDate <= expandedEndDate && 
              !processedExpenseKeys.has(uniqueKey)) {
            processedExpenses.push(despesaParcela);
            processedExpenseKeys.add(uniqueKey);
            console.log(`✅ Despesa parcelada adicionada: ${expense.id}, parcela ${parcelaAtual}`);
          }
        }
        return;
      }

      // Caso 3: Despesa fixa ou recorrente
      if (expense.fixed || expense.endRecurrenceDate) {
        const expenseDueDate = new Date(expense.dueDate);
        const originalDate = new Date(expense.date);
        const endRecurrenceDate = expense.endRecurrenceDate 
          ? new Date(expense.endRecurrenceDate) 
          : defaultEndDate;

        let currentDueDate = new Date(expenseDueDate);

        while (currentDueDate <= endRecurrenceDate && currentDueDate <= expandedEndDate) {
          if (currentDueDate >= expandedStartDate && currentDueDate <= expandedEndDate) {
            const recurrentExpense = {
              ...expense,
              date: originalDate,
              dueDate: currentDueDate,
              value: expense.value
            };

            const uniqueKey = generateUniqueKey(recurrentExpense);
            if (!processedExpenseKeys.has(uniqueKey)) {
              processedExpenses.push(recurrentExpense);
              processedExpenseKeys.add(uniqueKey);
              console.log(`✅ Despesa fixa/recorrente adicionada: ${expense.id}`);
            }
          }

          currentDueDate = new Date(currentDueDate);
          currentDueDate.setMonth(currentDueDate.getMonth() + 1);
        }
      }
    };

    // Processar todas as despesas base
    baseExpenses.forEach(processExpense);

    console.log('🔢 Despesas Processadas:', processedExpenses.map(expense => ({
      id: expense.id,
      valor: Number(expense.value),
      dataVencimento: expense.dueDate,
      tipo: expense.fixed ? 'Fixa' : (expense.installments ? 'Parcelada' : 'Normal'),
      descricao: expense.description
    })));

    // Criar mapa de valores considerando chave única
    const billValueMap = new Map<string, number>();
    processedExpenses.forEach(expense => {
      const key = `${expense.id}-${expense.dueDate.toISOString().split('T')[0]}`;
      const value = Number(expense.value);
      billValueMap.set(key, (billValueMap.get(key) || 0) + value);
    });

    const totalBillValue = Array.from(billValueMap.values()).reduce((sum, value) => sum + value, 0);

    console.log('💰 Mapa de Valores:', Object.fromEntries(billValueMap));
    console.log('🧮 Valor Total da Fatura:', totalBillValue);

    console.log('🔍 Despesas Processadas (Sem Duplicatas):', processedExpenses.map(expense => ({
      id: expense.id,
      valor: Number(expense.value),
      dataVencimento: expense.dueDate,
      descricao: expense.description,
      tipo: expense.fixed ? 'Fixa' : (expense.installments ? 'Parcelada' : 'Normal')
    })));

    console.log('🔍 Log Detalhado de Despesas:', processedExpenses.map(expense => ({
      tipo: expense.fixed ? 'Fixa' : expense.installments ? 'Parcelada' : 'Normal',
      id: expense.id,
      valor: Number(expense.value),
      dataVencimento: expense.dueDate,
      descricao: expense.description,
      fixa: expense.fixed,
      parcelada: !!expense.installments,
      parcelas: expense.installments,
      parcelaAtual: expense.parcela_atual,
      totalParcelas: expense.total_parcelas
    })));

    // Buscar todas as despesas do cartão no período para comparação
    const allCardExpenses = await prisma.cardExpense.findMany({
      where: {
        cardId: cardId,
        dueDate: {
          gte: expandedStartDate,
          lte: expandedEndDate,
        },
      },
      orderBy: {
        dueDate: 'desc',
      },
    });

    console.log('🕵️ Todas as despesas do cartão no período:', allCardExpenses.map(expense => ({
      id: expense.id,
      valor: Number(expense.value),
      dataVencimento: expense.dueDate,
      fixa: expense.fixed,
      parcelada: !!expense.installments,
      descricao: expense.description
    })));

    return NextResponse.json({
      billValue: totalBillValue,
      expenses: processedExpenses.map(expense => ({
        id: expense.id,
        value: Number(expense.value),
        dueDate: expense.dueDate,
        description: expense.description,
        fixed: expense.fixed,
        installments: expense.installments,
        parcela_atual: expense.parcela_atual,
        total_parcelas: expense.total_parcelas
      }))
    });
  } catch (error) {
    console.error('Erro ao calcular valor da fatura:', error);
    return NextResponse.json(
      { error: 'Não foi possível calcular o valor da fatura.' },
      { status: 500 }
    );
  }
}
