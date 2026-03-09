
/**
 * Module: layout
 * Purpose: Compose application root providers and global document layout.
 * Responsibilities: Provide app-wide contexts, font setup, and metadata.
 * Constraints: deterministic logic, respect module boundaries
 */
import type {Metadata} from 'next';
import { Inter } from 'next/font/google';

import './globals.css';
import { AppProvider } from '@/app-runtime/providers/app-provider';
import { AuthProvider } from '@/app-runtime/providers/auth-provider';
import { FirebaseClientProvider } from '@/app-runtime/providers/firebase-provider';
import { I18nProvider } from '@/app-runtime/providers/i18n-provider';
import { ThemeProvider } from '@/app-runtime/providers/theme-provider';
import { NexusToaster } from '@/shadcn-ui/custom-ui';
import { cn } from '@/shadcn-ui/utils/utils';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'OrgVerse | Modern Workspace Architecture',
  description: 'From Single Identity to Multidimensional Organization',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(inter.variable, 'font-sans', 'antialiased', 'min-h-screen', 'bg-background')}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <FirebaseClientProvider>
              <AuthProvider>
                <AppProvider>
                  {children}
                  <NexusToaster />
                </AppProvider>
              </AuthProvider>
            </FirebaseClientProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
