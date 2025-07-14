//File: src\components\onboarding\OnboardingClient.tsx

'use client';

import React, { useState } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import JoinExistingForm from '@/components/form/JoinExistingForm';
import NewOrganizationWizard from '@/components/form/NewOrganizationWizard';

export default function OnboardingClient() {
  const [mode, setMode] = useState<'choose' | 'join' | 'create'>('choose');

  return (
    <div>
      <PageBreadcrumb pageTitle="Onboarding" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[800px]">
          {mode === 'choose' && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                How would you like to proceed?
              </h2>
              <button
                onClick={() => setMode('join')}
                className="w-full px-4 py-3 text-sm font-medium text-center text-white bg-brand-500 rounded-lg hover:bg-brand-600"
              >
                Join an Existing Organization
              </button>
              <button
                onClick={() => setMode('create')}
                className="w-full px-4 py-3 text-sm font-medium text-center text-brand-500 border border-brand-500 rounded-lg hover:bg-brand-50"
              >
                Create a New Organization
              </button>
            </div>
          )}

          {mode === 'join' && <JoinExistingForm />}
          {mode === 'create' && <NewOrganizationWizard />}
        </div>
      </div>
    </div>
  );
}
