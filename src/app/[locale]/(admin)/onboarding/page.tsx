//File: src\app\(admin)\onboarding\page.tsx

import { Metadata } from 'next';
import OnboardingClient from '@/components/onboarding/OnboardingClient';

export const metadata: Metadata = {
  title: 'Onboarding | BlueHouz',
  description: 'Complete organization setup',
};

export default function OnboardingPage() {
  return <OnboardingClient/>;
}
