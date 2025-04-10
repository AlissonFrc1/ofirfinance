import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const plans = await prisma.plan.findMany({
      where: {
        active: true
      },
      orderBy: {
        price: 'asc'
      }
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Error fetching plans:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar planos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const plan = await prisma.plan.create({
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        billingCycle: body.billingCycle,
        features: body.features,
        allowedPages: body.allowedPages,
        active: body.active
      }
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error creating plan:', error);
    return NextResponse.json(
      { error: 'Erro ao criar plano' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const { id } = await request.json();

    await prisma.plan.delete({
      where: { id }
    });

    return NextResponse.json({ message: 'Plano excluído com sucesso' });
  } catch (error) {
    console.error('Error deleting plan:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir plano' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const plan = await prisma.plan.update({
      where: { id: body.id },
      data: {
        name: body.name,
        description: body.description,
        price: body.price,
        billingCycle: body.billingCycle,
        features: body.features,
        allowedPages: body.allowedPages,
        active: body.active
      }
    });

    return NextResponse.json(plan);
  } catch (error) {
    console.error('Error updating plan:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar plano' },
      { status: 500 }
    );
  }
} 