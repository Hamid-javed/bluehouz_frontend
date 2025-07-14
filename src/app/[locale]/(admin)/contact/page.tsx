'use client';

import { contactFieldConfig } from '@shared/config/contactFieldConfig';
import EntityPage from '@/components/entities/EntityPage';
import { defaultFieldsArr, importExampleRow, importHeaders, loadmoreDefaultData } from "./contactDummyData";

const customColumns = (selectedFields : any[], t: any, getFieldHeader : any) => selectedFields.map((field) => {
  if (field.accessorKey === 'name') {
    return {
      accessorKey: 'name',
      header: t('contact.fields.name'),
      cell: ({ row }: any) => {
        const firstName = row.original.firstName || '';
        const lastName = row.original.lastName || '';
        return `${firstName} ${lastName}`.trim();
      },
    };
  }
  return {
    accessorKey: field.accessorKey,
    header: getFieldHeader(field.accessorKey),
    cell: (info : any) => info.getValue(),
  };
});

export default function ContactPage() {
  return (
    <EntityPage
      importHeaders={importHeaders}
      importExampleRow={importExampleRow}
      loadmoreDefaultData={loadmoreDefaultData}
      entityName="contact"
      pageHeading="Manage Contacts"
      fieldConfig={contactFieldConfig}
      defaultFieldsArr={defaultFieldsArr}
      customColumns={customColumns}
      isredirect={true}
    />
  );
}