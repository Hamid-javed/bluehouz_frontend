'use client';

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useEntityGetAll } from "@/hooks/useEntityGetAll";
import { documentTemplateConfig, FieldKeyDocumentTemplateFromConfig } from '@shared/config/documentTemplateConfig';
import { generateColumnsFromFieldConfig } from '@/lib/generateColoumn';
import { useEntityDelete } from "@/hooks/useEntityDelete";
import { useTranslations } from 'next-intl'
import { useFieldHeader } from "@/hooks/useFieldHeader";
import { ConfigureColumnsModal, DisplayField, FieldConfig } from "@/components/ui/modal/ConfigureModal";
import { ImportModal } from "@/components/ui/modal/ImportModal";
import Papa from 'papaparse';
import { useAuth } from "@/context/AuthProvider";

// generate specific columns 
const columns = generateColumnsFromFieldConfig(documentTemplateConfig)
type DocumentTemplateType = Extract<FieldKeyDocumentTemplateFromConfig<typeof documentTemplateConfig>, string> | 'name';

function hasAccessorKey(col: ColumnDef<any>): col is ColumnDef<any> & { accessorKey: string } {
  return 'accessorKey' in col;
}

// Build fieldConfig for ConfigureColumnsModal
const fieldConfig: FieldConfig[] = [
  { name: 'name', label: 'documentTemplate.fields.name' },
  ...columns
    .filter(hasAccessorKey)
    .map((col) => ({
      name: col.accessorKey as string,
      label: col.header as string,
    }))
];

const allFields: DisplayField[] = [
  {
    accessorKey: 'name',
    header: 'documentTemplate.fields.name',
  },
  ...columns
    .filter(hasAccessorKey)
    .map((col) => ({
      accessorKey: col.accessorKey as string,
      header: col.header as string,
    }))
];

export default function ContactPage() {
  const t = useTranslations();
  const { getFieldHeader } = useFieldHeader(fieldConfig);
  const [documentTemplates, setDocumentTemplates] = useState<any[]>([]);
  const [entityDataMap, setEntityDataMap] = useState<Record<string, any[]>>({});
  const [selectedFields, setSelectedFields] = useState<DisplayField[]>([
    { accessorKey: 'name', header: getFieldHeader('name') },
    { accessorKey: 'country', header: getFieldHeader('country') },
    { accessorKey: 'language', header: getFieldHeader('language') },
    { accessorKey: 'isHidden', header: getFieldHeader('isHidden') }
  ]);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [formeditValues, setFormEditValues] = useState<Record<string, any>>({});
  const {user} = useAuth()
  const quiry = {
    organizationId: user?.currentOrganizationId || "",
  };

  const dynamicColumns: ColumnDef<any>[] = selectedFields?.map((field) => {
    if (field.accessorKey === 'name') {
      return {
        accessorKey: 'name',
        header: t('documentTemplate.fields.name'),
        cell: ({ row }) => {
          return row.original.name;
        },
      };
    }
    return {
      accessorKey: field.accessorKey,
      header: getFieldHeader(field.accessorKey),
      cell: (info) => info.getValue(),
    };
  });
  
  // all request routes
  const { data: documentTemplateData, loading: gettingNewOne } = useEntityGetAll<any>('document-templates', quiry, undefined, '/api');
  const { deleteEntity, loading: deleting, error: deleteError } = useEntityDelete('document-templates');

  const handleDelete = (property: any) => {
    deleteEntity(property.id)
    setDocumentTemplates(prev => prev.filter(p => p.id !== property.id));
  };

  const loadMore = async (): Promise<any> => {
    await new Promise((r) => setTimeout(r, 1000));
    return [
      {
        id: crypto.randomUUID(),
        name: "New Document Template",
        description: "This is a description of the new document template.",
        templateContent: "<html><body><h1>Hello, World!</h1></body></html>",
        entityType: "Contact",
        organizationId: "some-org-id",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  };

  const handleEdit = (row: object) => {
    setFormEditValues(row)
  };

  useEffect(() => {
    if (!documentTemplateData) return;

    setDocumentTemplates((prev) => {
      const newIds = new Set(prev.map(p => p.id));
      const filtered = documentTemplateData.filter(p => !newIds.has(p.id));
      return [...prev, ...filtered];
    });
  }, [documentTemplateData])

  // Example: merge related table data into contact (future-proof, currently only 'contact')
  // You can add more logic here if you add related tables in the future
  useEffect(() => {
    // Example: if you had a related table 'organization', merge it here
    // const orgData = entityDataMap["organization"];
    // if (Array.isArray(orgData) && orgData.length > 0) {
    //   setContact((prevContacts) => {
    //     const orgMap = new Map(orgData.map((o) => [o.id, o]));
    //     return prevContacts.map((c) => {
    //       const org = orgMap.get(c.organizationId);
    //       return org ? { ...c, organization: org } : c;
    //     });
    //   });
    // }
  }, [entityDataMap]);

  return (
    <div>
      <PageBreadcrumb pageTitle="Document Template List" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[1100px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Manage Document Template
            </h3>
          </div>
          <DataTable<any>
            columns={dynamicColumns}
            data={documentTemplates}
            loading={gettingNewOne}
            onEdit={handleEdit}
            fieldConfig={documentTemplateConfig}
            onDelete={handleDelete}
            loadMore={loadMore}
            setConfigModal={setIsConfigModalOpen}
            height="500px"
            entity="documentTemplate"
            isAllBtns={false}
            iscreatModal = {false}
          />
        </div>
      </div>
    </div>
  );
}