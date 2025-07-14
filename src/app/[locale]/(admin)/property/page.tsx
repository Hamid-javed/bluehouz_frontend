'use client';

import { propertyFieldConfig } from '@shared/config/propertyFieldConfig';
import EntityPage from '@/components/entities/EntityPage';
import { defaultFieldsArr, importExampleRow, importHeaders, loadmoreDefaultData } from "./propertyDummyData";

const customColumns = (selectedFields : any[], t: any, getFieldHeader : any) => selectedFields.map((field) => {
  if (field.accessorKey === 'address') {
    return {
      accessorKey: 'address',
      header: t('contact.fields.address'),
      cell: ({ row }: any) => {
        const addressLine = row.original?.addressLine1 || ''
        const state = row.original?.state || ''
        const country = row.original?.country || ''
        return `${addressLine}, ${state}, ${country}`.trim();
      },
    };
  }
  return {
    accessorKey: field.accessorKey,
    header: getFieldHeader(field.accessorKey),
    cell: (info : any) => info.getValue(),
  };
});

export default function PropertyPage() {

  return (
    <EntityPage
      entityName="property"
      pageHeading="Manage Properties"
      loadmoreDefaultData={loadmoreDefaultData}
      fieldConfig={propertyFieldConfig}
      defaultFieldsArr={defaultFieldsArr}
      importHeaders={importHeaders}
      customColumns={customColumns}
      importExampleRow={importExampleRow}
    />
  );
}
