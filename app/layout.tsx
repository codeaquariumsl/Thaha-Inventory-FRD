import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/components/ThemeProvider'

import AuthGuard from '@/components/AuthGuard'

// ... existing imports

export const metadata: Metadata = {
    title: 'Inventory Management System - Sales, Purchase & Stock Control',
    description: 'Comprehensive inventory management system with sales tracking, purchase orders, and real-time stock management. Streamline your business operations with our modern ERP solution.',
    keywords: 'inventory management, stock control, sales tracking, purchase orders, ERP system',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="en">
            <body>
                <ThemeProvider>
                    <AuthGuard>
                        {children}
                    </AuthGuard>
                </ThemeProvider>
            </body>
        </html>
    )
}
