"use client";

import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { MobileMenuProvider } from '@/contexts/MobileMenuContext';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === 'unauthenticated' && !pathname.includes('/login')) {
      router.push('/login');
    }
  }, [status, router, pathname]);

  if (pathname === '/login' || pathname === '/register') {
    return <>{children}</>;
  }

  return (
    <MobileMenuProvider>
      <div className="relative min-h-screen bg-background transition-colors duration-200">
        <Header notificationCount={2} />
        <Sidebar />
        <main className="pt-16 md:pt-20 md:pl-[200px] transition-[padding] duration-300">
          {children}
        </main>
      </div>
    </MobileMenuProvider>
  );
} 