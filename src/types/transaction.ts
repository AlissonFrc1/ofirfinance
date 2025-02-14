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

export interface CardExpense {
  id: string;
  value: number;
  date: string;
  category: string;
  subcategory: string;
  description?: string;
  fixed: boolean;
  recurring: boolean;
  dueDate?: string;
  endRecurrenceDate?: string;
  installments?: number;
  currentInstallment?: number;
  status: string;
  notes?: string;
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