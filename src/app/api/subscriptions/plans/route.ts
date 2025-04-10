import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      where: { active: true }
    });

    return NextResponse.json(plans);
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 