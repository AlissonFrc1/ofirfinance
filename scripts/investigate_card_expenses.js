const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function investigateCardExpenses() {
  const expenses = await prisma.cardExpense.findMany({
    where: {
      OR: [
        { description: 'teste 2' },
        { description: 'teste 3' }
      ]
    }
  })

  console.log('Detalhes completos das despesas de cartão:')
  expenses.forEach(expense => {
    console.log(JSON.stringify({
      id: expense.id,
      description: expense.description,
      value: expense.value.toString(),
      date: expense.date,
      dueDate: expense.dueDate,
      fixed: expense.fixed,
      recurring: expense.recurring,
      endRecurrenceDate: expense.endRecurrenceDate
    }, null, 2))
  })
}

investigateCardExpenses()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
