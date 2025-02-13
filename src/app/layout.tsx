import { Inter } from 'next/font/google'
import './globals.css'
import { ClientLayout } from './client-layout'
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Ofir Finance - Sua jornada para a liberdade financeira',
  description: 'Sistema de gestão financeira inteligente e profissional',
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body suppressHydrationWarning className={`${inter.className} bg-background text-text-primary min-h-screen overflow-x-hidden`}>
        <AppLayout>{children}</AppLayout>
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
      </body>
    </html>
  )
}
