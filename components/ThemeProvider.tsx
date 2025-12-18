'use client';

import { ThemeProvider as ThemeContextProvider } from '@/contexts/ThemeContext';
import { ReactNode } from 'react';

export function ThemeProvider({ children }: { children: ReactNode }) {
    return <ThemeContextProvider>{children}</ThemeContextProvider>;
}
