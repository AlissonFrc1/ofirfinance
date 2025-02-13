import prisma from '../src/lib/prisma';

async function checkExpenses() {
  try {
    const expenses = await prisma.cardExpense.findMany({
      where: {
        description: {
          in: ['teste 2', 'teste 3']
        }
      }
    });

    console.log('Expenses found:', JSON.stringify(expenses, null, 2));
  } catch (error) {
    console.error('Error fetching expenses:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkExpenses();
