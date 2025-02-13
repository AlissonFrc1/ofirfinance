import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { cardIds, queryDate } = await request.json();
    console.log('Recebido pedido de cálculo de fatura:', { cardIds, queryDate });
    const parsedQueryDate = new Date(queryDate);

    const statementValues: { [cardId: string]: number } = {};

    for (const cardId of cardIds) {
      const expenses = await db.cardExpense.findMany({
        where: {
          cardId: cardId,
          dueDate: {
            gte: new Date(parsedQueryDate.getFullYear(), parsedQueryDate.getMonth(), 1),
            lte: new Date(parsedQueryDate.getFullYear(), parsedQueryDate.getMonth() + 1, 0)
          }
        }
      });

      const totalStatementValue = expenses.reduce((total, expense) => {
        if (expense.fixed || expense.recurring) {
          return total + Number(expense.value);
        }
        return total + Number(expense.value);
      }, 0);

      console.log(`Valor da fatura para cartão ${cardId}:`, totalStatementValue);
      statementValues[cardId] = totalStatementValue;
    }

    console.log('Valores de fatura calculados:', statementValues);
    return NextResponse.json(statementValues);
  } catch (error) {
    console.error('Erro ao calcular valor da fatura:', error);
    return NextResponse.json({ error: 'Erro ao calcular valor da fatura' }, { status: 500 });
  }
}
