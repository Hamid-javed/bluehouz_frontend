import React, { useState } from 'react';
import Link from 'next/link';
import { useEntityGetAll } from '@/hooks/useEntityGetAll';
import { useEntityDelete } from '@/hooks/useEntityDelete';
import { DocumentTemplate } from '@shared/types/documentTemplate'; // Corrected import path
import { DataTable } from '@/components/tables/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

const columnHelper = createColumnHelper<DocumentTemplate>();

const DocumentTemplateTable: React.FC = () => {
  const { data: templates, loading, refetch } = useEntityGetAll<DocumentTemplate>(
    'document-templates',
    { organizationId: 'mockOrgId' }, // Assuming organizationId is needed and mocked for now
    false,
    '/api' // Specify the base path for document templates
  );

  const { deleteEntity, loading: isDeleting } = useEntityDelete(
    'document-templates',
    '/api' // Specify the base path for document templates
  );

  const handleDelete = async (row: DocumentTemplate) => {
    await deleteEntity(row.id);
    refetch();
  };

  const columns = [
    columnHelper.accessor('name', {
      header: () => 'Template Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('entityType', {
      header: () => 'Applies To',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('description', {
      header: () => 'Description',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('createdAt', {
      header: () => 'Created At',
      cell: info => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: 'actions',
      header: () => 'Actions',
      cell: props => (
        <div className="flex items-center space-x-3.5">
          <Link href={`/admin/document-templates/${props.row.original.id}`}
            className="hover:text-primary"
            title="Edit"
          >
            <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.4725 8.16667C17.4725 8.35833 17.3883 8.525 17.2217 8.69167L15.0217 10.8917C14.855 11.0583 14.6883 11.1417 14.4967 11.1417C14.305 11.1417 14.1383 11.0583 13.9717 10.8917L11.7717 8.69167C11.605 8.525 11.5217 8.35833 11.5217 8.16667C11.5217 7.975 11.605 7.80833 11.7717 7.64167L13.9717 5.44167C14.1383 5.275 14.305 5.19167 14.4967 5.19167C14.6883 5.19167 14.855 5.275 15.0217 5.44167L17.2217 7.64167C17.3883 7.80833 17.4725 7.975 17.4725 8.16667ZM0.972502 17.4917V17.075L9.7725 8.28334C9.93917 8.11667 10.0225 7.95 10.0225 7.75834C10.0225 7.56667 9.93917 7.4 9.7725 7.23334L7.5725 5.03334C7.40584 4.86667 7.23917 4.78334 7.0475 4.78334C6.85584 4.78334 6.68917 4.86667 6.5225 5.03334L0.972502 10.5833V17.4917ZM3.1725 12.7833L5.3725 10.5833L10.0225 15.2333L7.8225 17.4333L3.1725 12.7833Z" fill=""/>
            </svg>
          </Link>

          <Dialog>
            <DialogTrigger asChild>
              <button
                className="hover:text-primary"
                title="Delete"
                disabled={isDeleting}
              >
                <svg className="fill-current" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5 4.5H12.25V3C12.25 2.30964 11.6904 1.75 11 1.75H7C6.30964 1.75 5.75 2.30964 5.75 3V4.5H2.5C2.08579 4.5 1.75 4.83579 1.75 5.25V6C1.75 6.41421 2.08579 6.75 2.5 6.75H3V15.25C3 15.9404 3.55964 16.5 4.25 16.5H13.75C14.4404 16.5 15 15.9404 15 15.25V6.75H15.5C15.9142 6.75 16.25 6.41421 16.25 6V5.25C16.25 4.83579 15.9142 4.5 15.5 4.5ZM7.25 3C7.25 2.72386 7.47386 2.5 7.75 2.5H10.25C10.5261 2.5 10.75 2.72386 10.75 3V4.5H7.25V3ZM4.5 6.75H13.5V15.25C13.5 15.5261 13.2761 15.75 13 15.75H5C4.72386 15.75 4.5 15.5261 4.5 15.25V6.75Z" fill=""/>
                </svg>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Are you absolutely sure?</DialogTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  This action cannot be undone. This will permanently delete your
                  document template.
                </p>
              </DialogHeader>
              <DialogFooter>
                <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300" onClick={() => { /* Close dialog */ }}>Cancel</button>
                <button className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700" onClick={() => handleDelete(props.row.original)}>
                  Continue
                </button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ),
    }),
  ];

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          All Document Templates
        </h4>
        <Link href="/admin/document-templates/create" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10">
          Add New Template
        </Link>
      </div>
      <DataTable data={templates} columns={columns} loading={loading} onDelete={handleDelete} />
    </div>
  );
};

export default DocumentTemplateTable; 