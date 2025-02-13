const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const expenses = await prisma.cardExpense.findMany({
    where: {
      description: {
        in: ['teste 2', 'teste 3']
      }
    }
  })
  
  console.log(JSON.stringify(expenses, null, 2))
}

main()
  .catch(console.error)
  .finally(async () => await prisma.$disconnect())
