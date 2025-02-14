import { NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    console.log('Dados recebidos:', data);
    
    // Converte o valor para Decimal
    const value = new Prisma.Decimal(data.value);
    
    // Converte as datas para DateTime
    const date = new Date(data.date);
    const nextDate = data.nextDate ? new Date(data.nextDate) : undefined;
    
    // Converte installments para número
    const installments = data.installments ? parseInt(data.installments) : undefined;

    let result;

    if (data.type === 'expense') {
      console.log('Criando despesa normal');
      result = await prisma.expense.create({
        data: {
          value,
          paid: data.paid,
          recurring: data.recurring,
          date,
          nextDate,
          paymentMethod: data.paymentMethod,
          category: data.category,
          subcategory: data.subcategory,
          fixed: data.fixed,
          installments,
          description: data.description || undefined,
          dueDay: data.dueDay ? parseInt(data.dueDay) : undefined
        }
      });
    } else if (data.type === 'expense-card') {
      console.log('Criando despesa de cartão');
      try {
        // Validação dos campos obrigatórios
        if (!data.cardId || !data.dueDate) {
          throw new Error('CardId e dueDate são obrigatórios para despesas de cartão');
        }

        const cardExpenseData = {
          value,
          date,
          dueDate: new Date(data.dueDate),
          cardId: data.cardId,
          category: data.category,
          subcategory: data.subcategory,
          recurring: data.recurring || false,
          fixed: data.fixed || false,
          installments,
          description: data.description || undefined
        };

        console.log('Dados da despesa de cartão:', cardExpenseData);

        result = await prisma.cardExpense.create({
          data: cardExpenseData,
          include: {
            card: true
          }
        });
      } catch (err) {
        console.error('Erro específico ao criar despesa de cartão:', err);
        throw err;
      }
    } else if (data.type === 'income') {
      console.log('Criando receita');
      result = await prisma.income.create({
        data: {
          value,
          received: data.paid,
          recurring: data.recurring,
          date,
          nextDate,
          category: data.category,
          subcategory: data.subcategory,
          fixed: data.fixed,
          installments,
          description: data.description || undefined,
          dueDay: data.dueDay ? parseInt(data.dueDay) : undefined
        }
      });
    }

    console.log('Transação criada com sucesso:', result);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro detalhado ao criar transação:', error);
    return NextResponse.json(
      { error: 'Não foi possível criar a transação. Por favor, tente novamente.' },
      { status: 500 }
    );
  }
} 