"use client"

import EntityPage from '@/components/entities/EntityPage';
import { childContactFieldConfig } from '@shared/config/childContactFieldConfig';
import { defaultFieldsArr, importExampleRow, importHeaders } from './childContactDummyData';

export default function ChildContactPage() {
  
  return (
    <EntityPage
      pageHeading="Manage ChildContacts"
      entityName="childContact"
      fieldConfig={childContactFieldConfig}
      defaultFieldsArr={defaultFieldsArr}
      importHeaders={importHeaders}
      importExampleRow={importExampleRow}
    />
  );
}