export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ScheduleItem {
  id: string;
  title: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  dueDate: string;
  recurrence: RecurrenceType;
  walletId?: string;
  cardId?: string;
  notes?: string;
  color: string;
}
