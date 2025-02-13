import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PATCH(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();

    // Determinar o tipo de transação
    const transactionType = data.type;

    let result;
    if (transactionType === 'income') {
      result = await prisma.income.update({
        where: { id },
        data: {
          received: data.received,
          // Adicionar outros campos que podem ser atualizados
        }
      });
    } else if (transactionType === 'expense') {
      result = await prisma.expense.update({
        where: { id },
        data: {
          paid: data.paid,
          // Adicionar outros campos que podem ser atualizados
        }
      });
    } else if (transactionType === 'expense-card') {
      result = await prisma.cardExpense.update({
        where: { id },
        data: {
          // Campos específicos para despesas de cartão, se necessário
        }
      });
    } else {
      throw new Error('Tipo de transação inválido');
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    return NextResponse.json(
      { 
        error: 'Não foi possível atualizar a transação', 
        details: error instanceof Error ? error.message : 'Erro desconhecido' 
      },
      { status: 500 }
    );
  }
}
