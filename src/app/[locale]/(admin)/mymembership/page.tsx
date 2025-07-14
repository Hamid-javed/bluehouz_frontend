//File: bluehouz_frontend\src\app\[locale]\(admin)\mymembership\page.tsx

'use client';

import React, { useEffect, useState } from "react";
import { useEntityGetAll } from "@/hooks/useEntityGetAll";
import { useTranslations } from 'next-intl';
import PageBreadcrumb from "@/components/common/PageBreadCrumb";

type Membership = {
  id: string;
  organizationName: string;
  role: string;
  createdAt: string;
};

export default function MyMembershipPage() {
  const t = useTranslations('mymembership');
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const { data: membershipData, loading } = useEntityGetAll<Membership>('organizationMembership/mine');

  useEffect(() => {
    if (membershipData) {
      setMemberships(membershipData);
    }
  }, [membershipData]);

  return (
    <div>
      <PageBreadcrumb pageTitle={t('pageTitle')} />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[1100px]">
          <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl mb-6">
            {t('pageTitle')}
          </h3>
          <div className="overflow-auto rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('tableHeaders.organizationName')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('tableHeaders.role')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('tableHeaders.createdAt')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center">Loading...</td>
                  </tr>
                ) : memberships.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-4 text-center">{t('emptyState')}</td>
                  </tr>
                ) : (
                  memberships.map((membership) => (
                    <tr key={membership.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {membership.organizationName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {membership.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-200">
                        {new Date(membership.createdAt).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
