import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    console.log('Buscando cartão:', params.id);

    const card = await prisma.card.findUnique({
      where: { id: params.id }
    });

    if (!card) {
      return NextResponse.json({
        error: 'Cartão não encontrado'
      }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error('Erro ao buscar cartão:', error);
    return NextResponse.json({
      error: 'Erro ao buscar cartão',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
} 