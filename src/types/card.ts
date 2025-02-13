export interface Card {
  id: string;
  name: string;
  brand: string;
  lastDigits: string;
  limit: number;
  dueDay: number;
  closingDay: number;
  currentBill?: number;
} 