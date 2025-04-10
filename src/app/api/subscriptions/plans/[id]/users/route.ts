import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const users = await prisma.user.findMany({
      where: {
        subscriptions: {
          some: {
            planId: params.id,
            status: 'ACTIVE'
          }
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Erro ao buscar usuários do plano:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 