export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  planId: string | null;
  plan?: Plan;
  createdAt: Date;
  updatedAt: Date;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  billingCycle: 'MONTHLY' | 'YEARLY';
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED';
  allowedPages: string[];
  features: string[];
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  status: 'ACTIVE' | 'CANCELED' | 'EXPIRED';
  startDate: Date;
  endDate: Date;
  userId: string;
  planId: string;
  user?: User;
  plan?: Plan;
  createdAt: Date;
  updatedAt: Date;
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
  userId: string;
  user?: User;
  expenses?: Expense[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  description: string;
  value: number;
  date: Date;
  paid: boolean;
  cardId: string;
  card?: Card;
  createdAt: Date;
  updatedAt: Date;
}

export interface Income {
  id: string;
  description: string;
  value: number;
  date: Date;
  userId: string;
  user?: User;
  createdAt: Date;
  updatedAt: Date;
} 