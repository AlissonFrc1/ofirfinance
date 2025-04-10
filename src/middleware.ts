import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

// Páginas que requerem verificação de plano
const PROTECTED_PAGES = [
  '/dashboard',
  '/cards',
  '/expenses',
  '/incomes',
  '/subscriptions',
  '/plans',
  '/users',
  '/transactions',
  '/wallets',
  '/budgets',
  '/goals',
  '/agenda'
];

// Páginas que requerem autenticação mas não requerem plano
const AUTH_PAGES = ['/plans'];

// Páginas que requerem permissão de administrador
const ADMIN_PAGES = ['/admin'];

// Rotas da API que requerem autenticação
const PROTECTED_API_ROUTES = [
  '/api/cards',
  '/api/expenses',
  '/api/incomes',
  '/api/subscriptions',
  '/api/transactions'
];

export async function middleware(request: NextRequest) {
  console.log('Middleware executado para:', request.url);
  
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === 'production'
  });
  
  console.log('Token encontrado:', token ? 'Sim' : 'Não');
  if (token) {
    console.log('Token details:', {
      role: token.role,
      hasSubscription: !!token.subscription,
      subscriptionStatus: token.subscription?.status
    });
  }
  
  const { pathname } = request.nextUrl;

  // Verifica se é uma rota da API que requer autenticação
  if (PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))) {
    console.log('Verificando autenticação para rota da API:', pathname);
    
    if (!token) {
      console.log('Usuário não autenticado para rota da API');
      return new NextResponse(
        JSON.stringify({ error: 'Não autorizado' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
    }

    // Adiciona o userId ao header da requisição
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', token.sub as string);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders
      }
    });
  }

  // Verifica se a página requer autenticação
  if (pathname === '/' || pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) {
    if (!token) {
      console.log('Redirecionando para login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Verifica se a página requer permissões de admin
  if (ADMIN_PAGES.some(page => pathname.startsWith(page))) {
    if (token?.role !== 'ADMIN') {
      console.log('Redirecionando para página inicial - Sem permissão de admin');
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // Verificar se a página requer assinatura
  if (PROTECTED_PAGES.some((page) => pathname.startsWith(page))) {
    if (!token?.subscription || token.subscription.status !== 'ACTIVE') {
      console.log('Redirecionando para planos - Sem assinatura ativa');
      return NextResponse.redirect(new URL('/plans', request.url));
    }

    // Verificar se o plano permite acesso à página
    const allowedPages = token.subscription.plan.allowedPages || [];
    const currentPage = pathname.split('/')[1];

    if (!allowedPages.includes(currentPage)) {
      console.log('Redirecionando para planos - Página não permitida');
      return NextResponse.redirect(new URL('/plans', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/cards/:path*',
    '/api/expenses/:path*',
    '/api/incomes/:path*',
    '/api/subscriptions/:path*',
    '/api/transactions/:path*',
    '/cards/:path*',
    '/transactions/:path*',
    '/wallets/:path*',
    '/budgets/:path*',
    '/goals/:path*',
    '/agenda/:path*'
  ]
}; 