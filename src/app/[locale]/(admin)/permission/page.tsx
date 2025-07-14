// File: bluehouz_frontend/src/app/[locale]/(admin)/permission/page.tsx

'use client';

import React, { useEffect, useState } from "react";
import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { DataTable } from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useEntityGetAll } from "@/hooks/useEntityGetAll";
import { useEntityDelete } from "@/hooks/useEntityDelete";
import { useTranslations } from 'next-intl';
import { FieldConfig, useFieldHeader } from "@/hooks/useFieldHeader";
import  {ConfigureColumnsModal}  from "@/components/ui/modal/ConfigureModal";
import { ImportModal } from "@/components/ui/modal/ImportModal";
import Papa from 'papaparse';
import { permissionFieldConfig } from '@shared/config/permissionFieldConfig';
import { generateColumnsFromFieldConfig } from '@/lib/generateColoumn';

// Columns to include in default view
const selectedFieldNames = ['name', 'description', 'module', 'createdAt'];
const columns = generateColumnsFromFieldConfig(permissionFieldConfig)
  .filter(col => selectedFieldNames.includes((col as any).accessorKey));

type Permission = {
  id: string;
  name: string;
  description: string;
  module: string;
  createdAt: string;
};

type DisplayField = {
  accessorKey: keyof Permission;
  header: string;
};

// All available fields to pick in column configuration
const allFields: DisplayField[] = [
  {
    accessorKey: 'name',
    header: 'permission.fields.name',
  },
  ...columns.map((col) => col as DisplayField)
];

export default function PermissionPage() {
  const t = useTranslations();
  const { getFieldHeader } = useFieldHeader(permissionFieldConfig as FieldConfig<{ [x: string]: {} }>[]);

  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedFields, setSelectedFields] = useState<DisplayField[]>([
    { accessorKey: 'name', header: getFieldHeader('name') },
    { accessorKey: 'module', header: getFieldHeader('module') }
  ]);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [formeditValues, setFormEditValues] = useState<Record<string, any>>({});

  const dynamicColumns: ColumnDef<Permission>[] = selectedFields.map((field) => ({
    accessorKey: field.accessorKey,
    header: getFieldHeader(field.accessorKey),
    cell: (info) => info.getValue(),
  }));

  const { data: permissionData, loading } = useEntityGetAll<Permission>('permission');
  const { deleteEntity } = useEntityDelete('permission');

  const handleDelete = (perm: Permission) => {
    deleteEntity(perm.id);
    setPermissions(prev => prev.filter(p => p.id !== perm.id));
  };

  const loadMore = async (): Promise<Permission[]> => {
    await new Promise((r) => setTimeout(r, 1000));
    return [];
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<Permission>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPermissions((prev) => [...prev, ...results.data]);
      }
    });
  };

  const handleEdit = (row: object) => {
    setFormEditValues(row);
  };

  useEffect(() => {
    if (!permissionData) return;

    setPermissions(prev => {
      const existingIds = new Set(prev.map(p => p.id));
      const filtered = permissionData.filter(p => !existingIds.has(p.id));
      return [...prev, ...filtered];
    });
  }, [permissionData]);

  const renderImportModal = (open: boolean, setOpen: (v: boolean) => void) => (
    <ImportModal
      open={open}
      setOpen={setOpen}
      title="Import Permissions"
      headers={['id', 'name', 'description', 'module', 'createdAt']}
      exampleRow={['', 'View Dashboard', 'Allows dashboard viewing', 'dashboard', '2025-01-01T00:00:00Z']}
      onUpload={(file) => {
        handleImport({ target: { files: [file] } } as any);
      }}
    />
  );

  return (
    <div>
      <PageBreadcrumb pageTitle="Permission List" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[100%]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Manage Permissions
            </h3>
          </div>
          <DataTable
            columns={dynamicColumns}
            data={permissions}
            loading={loading}
            onEdit={handleEdit}
            fieldConfig={permissionFieldConfig}
            onDelete={handleDelete}
            loadMore={loadMore}
            setConfigModal={setIsConfigModalOpen}
            renderImportModal={renderImportModal}
            height="500px"
            entity="permission"
            isredirectEdit={true}
            isredirectCreate={true}
            // tableId="permission-list"
          />
        </div>
      </div>
      <ConfigureColumnsModal
        tableId="permission-list"
        isOpen={isConfigModalOpen}
        onOpenChange={setIsConfigModalOpen}
        allFields={allFields}
        selectedFields={selectedFields}
        onChangeSelectedFields={setSelectedFields}
        fieldConfig={permissionFieldConfig}
        defaultFieldsArr={['name', 'module']}
      />
    </div>
  );
}
