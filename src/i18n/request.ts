// File: bluehouz_frontend\src\i18n\request.ts
import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';

const locales = ['en', 'de'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale;

  if (!locale || !locales.includes(locale as Locale)) {
    notFound();
  }

  const messages = await import(`bluehouz_shared/locales/${locale}/__merged.json`);

  return {
    locale,
    messages: messages.default
  };
});
