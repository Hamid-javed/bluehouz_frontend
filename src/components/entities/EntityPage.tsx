'use client'

import React, { useEffect, useState, useMemo } from 'react';
import PageBreadcrumb from '@/components/common/PageBreadCrumb';
import { DataTable } from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useEntityGetAll } from '@/hooks/useEntityGetAll';
import { useEntityDelete } from '@/hooks/useEntityDelete';
import { useTranslations } from 'next-intl';
import { useFieldHeader } from '@/hooks/useFieldHeader';
import { ConfigureColumnsModal, DisplayField } from '@/components/ui/modal/ConfigureModal';
import { ImportModal } from '@/components/ui/modal/ImportModal';
import Papa from 'papaparse';
import { FieldConfig } from '@shared/types/fieldConfig';
import { useAuth } from '@/context/AuthProvider';
import { useEntityPut } from '@/hooks/useEntityPut';

export interface EntityPageProps {
  entityName: string;
  pageHeading: string;
  fieldConfig: FieldConfig[];
  translationNamespace?: string;
  defaultFieldsArr?: string[];
  customColumns?: (
    selectedFields: DisplayField[],
    t: ReturnType<typeof useTranslations>,
    getFieldHeader: (key: string) => string
  ) => ColumnDef<any>[];
  renderCreateModal?: (open: boolean, setOpen: (v: boolean) => void ) => React.ReactNode;
  renderEditModal?: (open: boolean, setOpen: (v: boolean) => void ) => React.ReactNode;
  importHeaders?: string[];
  importExampleRow?: string[];
  loadmoreDefaultData?: object;
  filterByField?: string;
  filterByValue?: string;
  isredirect?: boolean;
  onRowEdit?: (row: any) => void;
  onRowDelete?: (row: any) => void;
  extraHooks?: (data: any[], setData: React.Dispatch<React.SetStateAction<any[]>>, entityDataMap: Record<string, any[]>, setEntityDataMap: React.Dispatch<React.SetStateAction<Record<string, any[]>>>) => void;
  data?: any[]; // initial data from parent
}

export default function EntityPage({
  entityName,
  pageHeading,
  fieldConfig,
  translationNamespace,
  defaultFieldsArr,
  customColumns,
  renderCreateModal,
  renderEditModal,
  importHeaders,
  importExampleRow,
  loadmoreDefaultData,
  filterByField,
  filterByValue,
  onRowEdit,
  onRowDelete,
  extraHooks,
  isredirect = false,
  data: initialData,
}: EntityPageProps) {
  const t = useTranslations(translationNamespace);
  const { getFieldHeader } = useFieldHeader(fieldConfig);
  const [data, setData] = useState<any[]>(initialData || []);
  const [entityDataMap, setEntityDataMap] = useState<Record<string, any[]>>({});
  const [selectedFields, setSelectedFields] = useState<DisplayField[]>(
  (defaultFieldsArr && defaultFieldsArr.length > 0
    ? defaultFieldsArr
    : fieldConfig.filter(f => f.defaultVisible !== false).map(f => f.name as string)
   ).map((name) => {
    return {
      accessorKey: name,
      header: getFieldHeader(name),
    };
  })
);


  
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const { user } = useAuth();

  // Data fetching
  const { data: entityData, loading } = useEntityGetAll<any>(
    entityName,
    user?.currentOrganizationId ? { organizationId: user.currentOrganizationId } : undefined
  );
  const { deleteEntity, loading: deleteLoading } = useEntityDelete(entityName);
  const { replaceEntity, loading: updateLoading } = useEntityPut<any>(entityName);

  // Dynamic columns
  const dynamicColumns: ColumnDef<any>[] = useMemo(() => {
    if (customColumns) {
      return customColumns(selectedFields, t, getFieldHeader);
    }
    return selectedFields.map((field) => ({
      accessorKey: field.accessorKey,
      header: getFieldHeader(field.accessorKey),
      valueType: field.textType,
      cell: (info) => info.getValue(),
    }));
  }, [selectedFields, customColumns, t, getFieldHeader]);

  // Handle delete
  const handleDelete = (row: any) => {
    if (onRowDelete) {
      onRowDelete(row);
    } else {
      deleteEntity(row.id);
      setData(prev => prev.filter(p => p.id !== row.id));
    }
  };

  // Handle edit
  const handleEdit = async (row: any) => {
    if (onRowEdit) {
      onRowEdit(row);
    } else {
      // Store previous data for revert
      const previous = data.find(item => item.id === row.id);
      // Optimistically update data
      setData(prev => prev.map(item => item.id === row.id ? { ...item, ...row } : item));
      // Update backend
      const response = await replaceEntity(row.id, row, { previous });
      if (!response) {
        // Revert if API call failed
        setData(prev => prev.map(item => item.id === row.id ? previous : item));
      }
    }
  };

  // Import logic
  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    Papa.parse<any>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<any>) => {
        setData((prev) => [...prev, ...results.data]);
      },
    });
  };

  // Load more (pagination/infinite scroll)
  const loadMore = async (): Promise<any[]> => {
    await new Promise((r) => setTimeout(r, 1000));
    // Dummy data example (customize as needed)
    const newRow = loadmoreDefaultData
    setData(prev => [...prev, newRow]);
    return [newRow];
  };

  // Related data merging or extra hooks
  useEffect(() => {
    if (extraHooks) {
      extraHooks(data, setData, entityDataMap, setEntityDataMap);
    }
    // eslint-disable-next-line
  }, [entityDataMap]);

  // Data effect (with optional parent-child filtering)
  useEffect(() => {
    if (!entityData) return;
    let filtered = entityData;
    if (filterByField && filterByValue) {
      filtered = entityData.filter((item: any) => item[filterByField] === filterByValue);
    }
    setData((prev) => {
      const newIds = new Set(prev.map((p) => p.id));
      const filteredNew = filtered.filter((p: any) => !newIds.has(p.id));
      return [...prev, ...filteredNew];
    });
    // eslint-disable-next-line
  }, [entityData, filterByField, filterByValue]);

  // ConfigureColumnsModal callback
  const handleSetData = (entityName: string, rows: any[]) => {
    setEntityDataMap((prev) => ({
      ...prev,
      [entityName]: rows,
    }));
  };

  // Import modal
const renderImportModal = (open: boolean, setOpen: (v: boolean) => void) => (
  <ImportModal
    open={open}
    setOpen={setOpen}
    title={`Import ${entityName.charAt(0).toUpperCase() + entityName.slice(1)}`}
    headers={
      importHeaders ||
      ((fieldConfig as any[]).map((f: any) => f.name as string) as any)
    }
    exampleRow={
      importExampleRow ||
      ((fieldConfig as any[]).map((f: any) => '') as any)
    }
    onUpload={(file) => {
      handleImport({ target: { files: [file] } } as any);
    }}
  />
);

  // All fields for ConfigureColumnsModal
  const allFields: DisplayField[] = useMemo(() =>
    (fieldConfig as any[]).map(f => ({ accessorKey: f.name as string, header: getFieldHeader(f.label || (f.name as string)) })),
    [fieldConfig, getFieldHeader]
  );

  // Default fields for ConfigureColumnsModal
  const defaultFields = useMemo(() =>
    defaultFieldsArr && defaultFieldsArr.length > 0
      ? defaultFieldsArr
      : (fieldConfig as any[]).filter(f => f.defaultVisible !== false).map(f => f.name as string),
    [defaultFieldsArr, fieldConfig]
  );

  // UI
  return (
    <div>
      <PageBreadcrumb pageTitle={`${entityName.charAt(0).toUpperCase() + entityName.slice(1)} List`} />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[1100px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
               {pageHeading}
            </h3>
          </div>
          <DataTable<any>
            columns={dynamicColumns}
            data={data}
            loading={loading}
            deleting={deleteLoading}
            updating={updateLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loadMore={loadMore}
            setConfigModal={setIsConfigModalOpen}
            renderImportModal={renderImportModal}
            isImportModal={true}
            renderCreateModal={renderCreateModal}
            renderEditModal={renderEditModal}
            height="500px"
            entity={entityName}
            isredirectEdit={isredirect}
            isredirectCreate={isredirect}
            fieldConfig={fieldConfig}
          />
        </div>
      </div>
      <ConfigureColumnsModal
        tableId={`${entityName}`}
        entity={entityName}
        isOpen={isConfigModalOpen}
        onOpenChange={setIsConfigModalOpen}
        allFields={allFields}
        setData={handleSetData}
        selectedFields={selectedFields}
        onChangeSelectedFields={setSelectedFields}
        fieldConfig={fieldConfig as any}
        defaultFieldsArr={defaultFields}

      />
    </div>
  );
} 