// bluehouz_frontend\src\app\[locale]\layout.tsx
import { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { setRequestLocale } from 'next-intl/server';
import { NextIntlClientProvider } from 'next-intl';
import { Outfit } from 'next/font/google';

import { routing, Locale } from '@/i18n/routing';

import '../globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthProvider';
import { SnackbarProvider } from '@/context/SnackbarContext';

const outfit = Outfit({ subsets: ['latin'] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params: { locale },
}: {
  children: ReactNode;
  params: { locale: Locale };
}) {
  if (!routing.locales.includes(locale)) notFound();

  setRequestLocale(locale); // 👈 Sets the locale for this request

  return (
    <html lang={locale}>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        {/* 👇 No need to manually load or inject messages */}
        <NextIntlClientProvider locale={locale}>
          <ThemeProvider>
            <SnackbarProvider>
              <AuthProvider>
                <SidebarProvider>{children}</SidebarProvider>
              </AuthProvider>
            </SnackbarProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
