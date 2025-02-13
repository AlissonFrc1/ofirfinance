import { ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline'

interface Transaction {
  id: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  date: Date
}

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short'
    }).format(date)
  }

  return (
    <div className="bg-card-bg rounded-xl">
      <div className="p-6 border-b border-divider">
        <h3 className="text-base font-medium">Transações Recentes</h3>
      </div>

      <div className="divide-y divide-divider">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="p-4 hover:bg-background/30 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  transaction.type === 'income' ? 'bg-income/10' : 'bg-expense/10'
                }`}>
                  {transaction.type === 'income' ? (
                    <ArrowUpIcon className="w-5 h-5 text-income" />
                  ) : (
                    <ArrowDownIcon className="w-5 h-5 text-expense" />
                  )}
                </div>

                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <span className="text-[0.65rem] text-text-secondary">{transaction.category}</span>
                </div>
              </div>

              <div className="text-right">
                <p className={`font-medium ${
                  transaction.type === 'income' ? 'text-income' : 'text-expense'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'} {formatCurrency(Math.abs(transaction.amount))}
                </p>
                <span className="text-[0.65rem] text-text-secondary">{formatDate(transaction.date)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 