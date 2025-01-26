export const dynamic = 'force-dynamic';
import { Inter } from 'next/font/google'
import type { Metadata } from 'next'

import './globals.css'
import { ModalProvider } from '@/providers/modal-provider'
import { ToastProvider } from '@/providers/toast-provider'
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Footer } from '@/components/footer'
import { ApolloWrapper } from '@/providers/apollo-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Admin Dashboard',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider />
        <ModalProvider />
        <ApolloWrapper>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
          >
            {children}
          </ThemeProvider>
        </ApolloWrapper>
        <Footer />
      </body>
    </html>
  )
}
