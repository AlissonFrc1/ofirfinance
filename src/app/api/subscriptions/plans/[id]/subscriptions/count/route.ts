import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const count = await prisma.subscription.count({
      where: {
        planId: params.id,
        status: 'ACTIVE'
      }
    });

    return NextResponse.json(count);
  } catch (error) {
    console.error('Erro ao contar assinaturas do plano:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 