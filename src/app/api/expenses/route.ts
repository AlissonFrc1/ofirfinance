import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const expenseData = await request.json();

    // Validar dados da despesa
    if (!expenseData.value || !expenseData.category) {
      return NextResponse.json(
        { message: 'Valor e categoria são obrigatórios' }, 
        { status: 400 }
      );
    }

    // Lista de campos válidos baseados no schema do Prisma
    const validFields = [
      'value', 'paid', 'recurring', 'date', 'nextDate', 
      'paymentMethod', 'category', 'subcategory', 
      'fixed', 'installments', 'description', 
      'dueDay'
    ];

    // Remover campos inválidos ou nulos
    const cleanedExpenseData = Object.fromEntries(
      Object.entries(expenseData)
        .filter(([key, value]) => 
          validFields.includes(key) && 
          value !== null && 
          value !== undefined
        )
    );

    // Converter data para DateTime completo com validação
    if (cleanedExpenseData.date) {
      const parsedDate = new Date(cleanedExpenseData.date);
      
      // Verificar se a data é válida
      if (isNaN(parsedDate.getTime())) {
        return NextResponse.json(
          { message: 'Data inválida' }, 
          { status: 400 }
        );
      }

      // Ajustar para o início do dia no fuso horário UTC
      cleanedExpenseData.date = new Date(
        Date.UTC(
          parsedDate.getFullYear(), 
          parsedDate.getMonth(), 
          parsedDate.getDate()
        )
      );
    }

    // Criar despesa no banco de dados
    const newExpense = await prisma.expense.create({
      data: {
        ...cleanedExpenseData,
        value: new Prisma.Decimal(expenseData.value)
      }
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar despesa:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) }, 
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
