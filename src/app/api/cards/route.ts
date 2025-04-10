import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const data = await request.json();
    console.log('Dados recebidos para criar cartão:', data);

    if (!data.name || !data.lastDigits || !data.limit || 
        !data.dueDay || !data.closingDay || !data.brand) {
      console.error('Dados inválidos:', data);
      return NextResponse.json({
        error: 'Todos os campos são obrigatórios',
        receivedData: data
      }, { status: 400 });
    }

    const card = await prisma.card.create({
      data: {
        name: data.name,
        brand: data.brand,
        lastDigits: data.lastDigits,
        limit: Number(data.limit),
        dueDay: Number(data.dueDay),
        closingDay: Number(data.closingDay),
        color: data.color || '#000000',
        bank: data.brand,
        userId
      }
    });

    console.log('Cartão criado com sucesso:', card);
    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error('Erro ao criar cartão:', error);
    
    if (error instanceof PrismaClientKnownRequestError) {
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    
    const cards = await prisma.card.findMany({
      where: { userId },
      include: {
        expenses: {
          where: {
            paid: false
          }
        }
      }
    });
    
    const cardsWithBills = cards.map(card => ({
      ...card,
      currentBill: card.expenses.reduce((sum: number, expense: { value: { toNumber: () => number } }) => 
        sum + expense.value.toNumber(), 0)
    }));

    return NextResponse.json(cardsWithBills);
  } catch (error) {
    console.error('Erro ao buscar cartões:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar cartões' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    // Obter sessão do usuário
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const data = await request.json();
    console.log('Dados recebidos para atualização:', data);
    
    // Verificar se o cartão pertence ao usuário
    const card = await prisma.card.findFirst({
      where: {
        id: data.id,
        userId
      }
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Cartão não encontrado ou não pertence a este usuário' },
        { status: 403 }
      );
    }
    
    const result = await prisma.card.update({
      where: { id: data.id },
      data: {
        limit: Number(data.limit),
        dueDay: Number(data.dueDay),
        closingDay: Number(data.closingDay),
        name: data.name,
        lastDigits: data.lastDigits,
        brand: data.brand,
        bank: data.brand,
        color: data.color
      }
    });
    
    console.log('Cartão atualizado com sucesso:', result);
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
    // Obter sessão do usuário
    const session = await getServerSession(authOptions);
    
    // Verificar se o usuário está autenticado
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({
        error: 'ID do cartão não fornecido'
      }, { status: 400 });
    }
    
    // Verificar se o cartão pertence ao usuário
    const card = await prisma.card.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!card) {
      return NextResponse.json(
        { error: 'Cartão não encontrado ou não pertence a este usuário' },
        { status: 403 }
      );
    }
    
    // Primeiro excluir todas as despesas relacionadas
    await prisma.cardExpense.deleteMany({
      where: { cardId: id }
    });
    
    // Depois excluir o cartão
    const result = await prisma.card.delete({
      where: { id }
    });
    
    console.log('Cartão excluído com sucesso:', result);
    return NextResponse.json({ message: 'Cartão excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir cartão:', error);
    return NextResponse.json({
      error: 'Erro ao excluir cartão',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 