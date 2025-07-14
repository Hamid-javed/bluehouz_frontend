//File: bluehouz_frontend\src\app\[locale]\(public)\page.tsx

'use client';

import { useTranslations } from 'next-intl';

export default function HomePage() {
  const t = useTranslations();

  return (
    <section className="max-w-5xl mx-auto px-4 py-20 text-center">
      <h1 className="text-4xl font-bold mb-4">{t('pageHomepage.title')}</h1>
      <p className="text-lg text-gray-600 mb-8">{t('pageHomepage.subtitle')}</p>
      <a
        href="/signup"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded hover:bg-blue-700 transition"
      >
        {t('pageHomepage.cta')}
      </a>
    </section>
  );
}
