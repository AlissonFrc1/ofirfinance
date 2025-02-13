export interface Transaction {
  id: string;
  description: string;
  value: number;
  type: 'income' | 'expense' | 'expense-card';
  category: string;
  subcategory?: string;
  date: string;
  paid?: boolean;
  received?: boolean;
  notes?: string;
  walletId?: string;
}

export interface Card {
  id: string;
  name: string;
  brand: string;
  lastDigits: string;
  limit: number;
  dueDay: number;
  closingDay: number;
  color: string;
  currentBill: number;
  expenses?: CardExpense[];
}