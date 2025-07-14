//File: bluehouz_frontend\src\app\[locale]\(admin)\membership\page.tsx

'use client';

import EntityPage from '@/components/entities/EntityPage';
import { membershipFieldConfig } from '@shared/config/membershipFieldConfig';
import { defaultFieldsArr, importExampleRow, importHeaders, loadmoreDefaultData } from './membershipDummyData';

const extraHooks = (
  data: any,
  setData: (value: any) => void,
  entityDataMap: Record<string, any>,
  setEntityDataMap: (value: any) => void
) => {
  const contactData: any[] = entityDataMap['contact'];
  if (!Array.isArray(contactData) || contactData.length === 0) return;

  setData((prevMemberships: any[]) => {
    const contactMap = new Map(contactData.map((c: any) => [c.id, c]));
    return prevMemberships.map((membership: any) => {
      const contact = contactMap.get(membership.contactId);
      return contact ? { ...membership, contact } : membership;
    });
  });
};

export default function MembershipPage() {

  return (
    <EntityPage
      entityName="membership"
      pageHeading="Manage Memberships"
      fieldConfig={membershipFieldConfig}
      defaultFieldsArr={defaultFieldsArr}
      importHeaders={importHeaders}
      importExampleRow={importExampleRow}
      loadmoreDefaultData={loadmoreDefaultData}
      extraHooks={extraHooks}
    />
  );
}