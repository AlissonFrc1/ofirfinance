import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { format, parseISO, startOfDay, endOfDay, subMonths, startOfMonth, endOfMonth } from 'date-fns';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Valores padrão e conversão de parâmetros
    const startDateParam = searchParams.get('startDate') || format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const endDateParam = searchParams.get('endDate') || format(endOfMonth(new Date()), 'yyyy-MM-dd');
    const typeParam = searchParams.get('type') || 'all';
    const statusParam = searchParams.get('status') || 'pending';

    // Parse das datas
    const startDate = parseISO(startDateParam);
    const endDate = parseISO(endDateParam);

    // Log detalhado dos parâmetros
    console.log('Parâmetros de busca:', {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      type: typeParam,
      status: statusParam
    });

    // Busca de despesas
    let expensePendencies: any[] = [];
    let incomePendencies: any[] = [];

    const expenseWhereConditions: any = {
      date: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate)
      }
    };

    const incomeWhereConditions: any = {
      date: {
        gte: startOfDay(startDate),
        lte: endOfDay(endDate)
      }
    };

    // Lógica de filtro de status baseada APENAS no pagamento/recebimento
    if (statusParam === 'pending') {
      expenseWhereConditions.paid = false;
      incomeWhereConditions.received = false;
    } else if (statusParam === 'paid') {
      expenseWhereConditions.paid = true;
      incomeWhereConditions.received = true;
    }

    console.log('Condições de filtro:', {
      statusParam,
      expenseWhereConditions,
      incomeWhereConditions
    });

    // Busca de despesas
    if (typeParam === 'all' || typeParam === 'expense') {
      expensePendencies = await prisma.expense.findMany({
        where: expenseWhereConditions,
        orderBy: { date: 'asc' }
      });

      console.log('Despesas pendentes encontradas:', {
        count: expensePendencies.length,
        whereConditions: expenseWhereConditions,
        firstExpense: expensePendencies[0],
        lastExpense: expensePendencies[expensePendencies.length - 1],
        allExpenseFields: expensePendencies.map(e => ({
          id: e.id,
          description: e.description,
          value: e.value,
          date: e.date,
          paid: e.paid,
          category: e.category,
          subcategory: e.subcategory
        }))
      });
    }

    // Busca de receitas
    if (typeParam === 'all' || typeParam === 'income') {
      incomePendencies = await prisma.income.findMany({
        where: incomeWhereConditions,
        orderBy: { date: 'asc' }
      });

      console.log('Receitas pendentes encontradas:', {
        count: incomePendencies.length,
        whereConditions: incomeWhereConditions
      });
    }

    console.log('Filtros aplicados:', {
      typeParam,
      statusParam,
      expenseCount: expensePendencies.length,
      incomeCount: incomePendencies.length
    });

    // Formatação das pendências
    const formattedPendencies = [
      ...expensePendencies.map(expense => ({
        id: expense.id,
        description: expense.subcategory || 'Despesa sem subcategoria',
        value: parseFloat(expense.value.toString()),
        dueDate: format(expense.date, 'yyyy-MM-dd'), // Usando 'date'
        type: 'EXPENSE' as const,
        typeLabel: '💸 Despesa',
        category: expense.category,
        subcategory: expense.subcategory,
        paid: expense.paid || false,
        cardName: null,
        date: expense.date // Adicionando o campo date original
      })),
      ...incomePendencies.map(income => ({
        id: income.id,
        description: income.subcategory || 'Receita sem subcategoria',
        value: parseFloat(income.value.toString()),
        dueDate: format(income.date, 'yyyy-MM-dd'), // Usando 'date'
        type: 'INCOME' as const,
        typeLabel: '💰 Receita',
        category: income.category,
        subcategory: income.subcategory,
        paid: income.received || false,
        cardName: null,
        date: income.date // Adicionando o campo date original
      }))
    ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Cálculo do sumário
    const summary = {
      expense: {
        total: formattedPendencies
          .filter(p => p.type === 'EXPENSE' && !p.paid)
          .reduce((sum, p) => sum + p.value, 0),
        count: formattedPendencies.filter(p => p.type === 'EXPENSE' && !p.paid).length
      },
      income: {
        total: formattedPendencies
          .filter(p => p.type === 'INCOME' && !p.paid)
          .reduce((sum, p) => sum + p.value, 0),
        count: formattedPendencies.filter(p => p.type === 'INCOME' && !p.paid).length
      }
    };

    return NextResponse.json({
      pendencies: formattedPendencies,
      summary
    });
  } catch (error) {
    console.error('Erro interno:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: { 
        message: error instanceof Error ? error.message : String(error) 
      } 
    }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, paid, type } = await request.json();

    if (!id || !type) {
      return NextResponse.json(
        { error: 'ID e tipo da transação são obrigatórios' }, 
        { status: 400 }
      );
    }

    let updatedTransaction;
    if (type === 'EXPENSE') {
      updatedTransaction = await prisma.expense.update({
        where: { id },
        data: { 
          paid: paid === true,
          updatedAt: new Date()
        }
      });
    } else if (type === 'INCOME') {
      updatedTransaction = await prisma.income.update({
        where: { id },
        data: { 
          received: paid === true,
          updatedAt: new Date()
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Tipo de transação inválido' }, 
        { status: 400 }
      );
    }

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('Erro ao atualizar pendência:', error);
    return NextResponse.json(
      { 
        error: 'Erro ao atualizar pendência', 
        details: error instanceof Error ? error.message : String(error) 
      }, 
      { status: 500 }
    );
  }
}
