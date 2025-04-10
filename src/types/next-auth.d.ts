import { DefaultSession } from 'next-auth';
import { JWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: 'USER' | 'ADMIN';
      subscription?: {
        id: string;
        status: 'ACTIVE' | 'CANCELED' | 'EXPIRED';
        plan: {
          id: string;
          name: string;
          price: number;
          allowedPages: string[];
        };
      };
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    role: 'USER' | 'ADMIN';
    subscription?: {
      id: string;
      status: 'ACTIVE' | 'CANCELED' | 'EXPIRED';
      plan: {
        id: string;
        name: string;
        price: number;
        allowedPages: string[];
      };
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'USER' | 'ADMIN';
    subscription?: {
      id: string;
      status: 'ACTIVE' | 'CANCELED' | 'EXPIRED';
      plan: {
        id: string;
        name: string;
        price: number;
        allowedPages: string[];
      };
    };
  }
} 