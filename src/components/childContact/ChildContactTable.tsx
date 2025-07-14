'use client';

import React, { useEffect, useState } from "react";
import { DataTable } from '@/components/tables/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { useEntityGetAll } from "@/hooks/useEntityGetAll";
import { useEntityPost } from "@/hooks/useEntityPost";
import { useEntityDelete } from "@/hooks/useEntityDelete";
import CreateModal from "@/components/ui/modal/CreateModal";
import { ImportModal } from "@/components/ui/modal/ImportModal";
import { ConfigureColumnsModal } from "@/components/ui/modal/ConfigureModal";
import { FieldConfig, useFieldHeader } from "@/hooks/useFieldHeader";
import { contactFieldConfig } from "@shared/config/contactFieldConfig";
import { generateColumnsFromFieldConfig } from '@/lib/generateColoumn';
import { useRouter } from "next/navigation";
import Papa from 'papaparse';

const selectedFieldNamesCreate = ['parentContactId', 'childContactId', 'role', 'addressTypeId'];
const selectedFieldNames = ['parentContactId', 'childContactId', 'role', 'addressTypeId', 'createdAt'];
const columns = generateColumnsFromFieldConfig(contactFieldConfig)
  .filter(col => selectedFieldNames.includes((col as any).accessorKey));

type ChildContact = {
  id: string;
  parentContactId: string;
  childContactId: string;
  role?: string;
  addressTypeId?: string;
  createdAt: string;
};

type DisplayField = {
  accessorKey: keyof ChildContact;
  header: string;
};

const allFields: DisplayField[] = columns.map((col) => col as DisplayField);

interface Props {
  t: ReturnType<typeof import('next-intl').useTranslations>;
  parentContactId: string;
}

export default function ChildContactTable({ t, parentContactId }: Props) {
  const router = useRouter();
  const { getFieldHeader } = useFieldHeader(contactFieldConfig as FieldConfig<{ [x: string]: {} }>[]);
  const [childContacts, setChildContacts] = useState<ChildContact[]>([]);
  const [selectedFields, setSelectedFields] = useState<DisplayField[]>([
    { accessorKey: 'parentContactId', header: getFieldHeader(t('parentContactId')) },
    {
      accessorKey: 'childContactId', header: getFieldHeader(t('childContactId')) },
    { accessorKey: 'role', header: getFieldHeader(t('role')) }
  ]);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [selectedChildContact, setSelectedChildContact] = useState<ChildContact | null>(null);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const dynamicColumns: ColumnDef<any>[] = selectedFields.map((field) => ({
    accessorKey: field.accessorKey,
    header: getFieldHeader(t(field.accessorKey)),
    cell: (info) => info.getValue(),
  }));

  const { data: childContactData, loading } = useEntityGetAll<ChildContact>('childContact');
  const { postEntity, loading: creating } = useEntityPost<ChildContact>('childContact');
  const { deleteEntity } = useEntityDelete('childContact');

  const handleDelete = (childContact: ChildContact) => {
    deleteEntity(childContact.id);
    setChildContacts(prev => prev.filter(cc => cc.id !== childContact.id));
  };

  const loadMore = async (): Promise<ChildContact[]> => {
    await new Promise((r) => setTimeout(r, 1000));
    return [];
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse<ChildContact>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: Papa.ParseResult<ChildContact>) => {
        setChildContacts((prev) => [...prev, ...results.data]);
      },
    });
  };

  useEffect(() => {
    if (childContactData) {
      // Optional: filter data by parentContactId if needed
      setChildContacts(childContactData.filter(contact => contact.parentContactId === parentContactId));
    }
  }, [childContactData, parentContactId]);

  const handleEdit = (id: string) => {
    router.push(`/childContact/${id}`);
  };

  const renderCreateModal = (open: boolean, setOpen: (v: boolean) => void) => (
   <CreateModal
  open={open}
  setOpen={setOpen}
  title={selectedChildContact ? 'Edit Child Contact' : 'Create New Child Contact'}
  fieldConfig={contactFieldConfig as any}
  formValues={formValues}
  setFormValues={setFormValues}
  errors={errors}
  setErrors={setErrors}
  creating={creating}
  postEntity={postEntity as any}
  setData={setChildContacts}
  isProperty={true}
  isedit={!!selectedChildContact}
  updatedData={{}} 
  formeditValues={{}} 
  setFormEditValues={() => {}} 
  replaceEntity={() => Promise.resolve()}
  t={t}
/>

  );

  const renderImportModal = (open: boolean, setOpen: (v: boolean) => void) => (
    <ImportModal
      open={open}
      setOpen={setOpen}
      title="Import Child Contacts"
      headers={['id', 'parentContactId', 'childContactId', 'role', 'addressTypeId', 'createdAt']}
      exampleRow={['', 'parent-id', 'child-id', 'Friend', 'home', '2025-01-01']}
      onUpload={(file) => {
        handleImport({ target: { files: [file] } } as any);
      }}
    />
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
          Manage Child Contacts
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsConfigModalOpen(true)}
            className="px-4 py-2 border border-brand-500 text-brand-500 rounded hover:bg-brand-50"
          >
            ⚙️ Configure
          </button>
        </div>
      </div>
      <DataTable
        columns={dynamicColumns}
        data={childContacts}
        loading={loading}
        onEdit={handleEdit}
        onDelete={handleDelete}
        loadMore={loadMore}
        renderCreateModal={renderCreateModal}
        renderImportModal={renderImportModal}
        height="500px"
        // redirect={true}
        iscreatModal={true}
      />
      <ConfigureColumnsModal
      tableId="contact-list"
      entity="contact"
      isOpen={isConfigModalOpen}
      onOpenChange={setIsConfigModalOpen}
      setData={() => {}} 
      allFields={allFields}
      selectedFields={selectedFields}
      onChangeSelectedFields={setSelectedFields as unknown as (fields: any[]) => void}
      fieldConfig={contactFieldConfig as any}
      defaultFieldsArr={['name', 'email', 'phone']}
      />
    </div>
  );
}
