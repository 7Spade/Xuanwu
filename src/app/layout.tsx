
import type {Metadata} from 'next';

import './globals.css';
import { AppProvider } from '@/app-runtime/providers/app-provider';
import { AuthProvider } from '@/app-runtime/providers/auth-provider';
import { FirebaseClientProvider } from '@/app-runtime/providers/firebase-provider';
import { I18nProvider } from '@/app-runtime/providers/i18n-provider';
import { ThemeProvider } from '@/app-runtime/providers/theme-provider';
import {Toaster} from '@/shadcn-ui/toaster';
import { cn } from '@/shadcn-ui/utils/utils';

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
      <body className={cn('font-sans', 'antialiased', 'min-h-screen', 'bg-background')}>
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
                  <Toaster />
                </AppProvider>
              </AuthProvider>
            </FirebaseClientProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
