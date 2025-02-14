import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Prisma, Expense } from '@prisma/client';
import prisma from '@/lib/prisma';

type ValidFields = 'value' | 'paid' | 'recurring' | 'date' | 'nextDate' | 
                  'paymentMethod' | 'category' | 'subcategory' | 
                  'fixed' | 'installments' | 'description' | 'dueDay';

type ExpenseCreateData = {
  [K in ValidFields]?: K extends 'value' ? number | string :
                      K extends 'date' | 'nextDate' ? string | Date :
                      K extends 'paid' | 'recurring' | 'fixed' ? boolean :
                      K extends 'installments' | 'dueDay' ? number :
                      string;
};

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
    const validFields: ValidFields[] = [
      'value', 'paid', 'recurring', 'date', 'nextDate', 
      'paymentMethod', 'category', 'subcategory', 
      'fixed', 'installments', 'description', 
      'dueDay'
    ];

    // Remover campos inválidos ou nulos
    const cleanedExpenseData: ExpenseCreateData = {};
    for (const [key, value] of Object.entries(expenseData)) {
      if (validFields.includes(key as ValidFields) && value !== null && value !== undefined) {
        (cleanedExpenseData as any)[key] = value;
      }
    }

    // Converter data para DateTime completo com validação
    if (typeof cleanedExpenseData.date === 'string') {
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
        value: new Prisma.Decimal(expenseData.value),
        date: cleanedExpenseData.date || new Date(),
        paymentMethod: cleanedExpenseData.paymentMethod || 'MONEY',
        category: cleanedExpenseData.category!,
        subcategory: cleanedExpenseData.subcategory || 'OUTROS',
        paid: cleanedExpenseData.paid ?? false,
        recurring: cleanedExpenseData.recurring ?? false,
        fixed: cleanedExpenseData.fixed ?? false,
        installments: cleanedExpenseData.installments,
        description: cleanedExpenseData.description,
        dueDay: cleanedExpenseData.dueDay,
        nextDate: cleanedExpenseData.nextDate instanceof Date ? cleanedExpenseData.nextDate : 
                 typeof cleanedExpenseData.nextDate === 'string' ? new Date(cleanedExpenseData.nextDate) : 
                 undefined
      }
    });

    return NextResponse.json(newExpense, { status: 201 });
  } catch (error) {
    console.error('Erro ao registrar despesa:', error);
    return NextResponse.json(
      { message: 'Erro interno do servidor', error: String(error) }, 
      { status: 500 }
    );
  }
}
