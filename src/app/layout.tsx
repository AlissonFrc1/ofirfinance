import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';
import { AuthenticatedLayout } from '@/components/AuthenticatedLayout';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Ofir Finance - Sua jornada para a liberdade financeira',
  description: 'Sistema de gestão financeira inteligente e profissional',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body suppressHydrationWarning className={`${inter.className} min-h-screen overflow-x-hidden`}>
        <ThemeProvider>
          <NextAuthProvider>
            <div className="min-h-screen bg-background text-text-primary transition-colors duration-200">
              <AuthenticatedLayout>{children}</AuthenticatedLayout>
            </div>
            <Toaster 
              position="top-right"
              toastOptions={{
                success: {
                  style: {
                    background: '#22c55e',
                    color: 'white',
                  },
                },
                error: {
                  style: {
                    background: '#ef4444',
                    color: 'white',
                  },
                },
              }}
            />
          </NextAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
