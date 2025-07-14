// File: bluehouz_frontend\src\i18n\routing.ts
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'de'],
  defaultLocale: 'en',
});

// ✅ Add this line to fix the error
export type Locale = (typeof routing.locales)[number];
