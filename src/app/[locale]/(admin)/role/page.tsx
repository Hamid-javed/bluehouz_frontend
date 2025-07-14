//File: bluehouz_frontend\src\app\[locale]\(admin)\role\page.tsx

'use client'

import React, { useEffect, useState } from 'react'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { DataTable } from '@/components/tables/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { useEntityGetAll } from '@/hooks/useEntityGetAll'
import { useEntityDelete } from '@/hooks/useEntityDelete'
import { useTranslations } from 'next-intl'
import { FieldConfig, useFieldHeader } from '@/hooks/useFieldHeader'
import { ConfigureColumnsModal } from '@/components/ui/modal/ConfigureModal'
import { ImportModal } from '@/components/ui/modal/ImportModal'
import Papa from 'papaparse'
import { roleFieldConfig } from '@shared/config/roleFieldConfig'
import { generateColumnsFromFieldConfig } from '@/lib/generateColoumn'

const selectedFieldNames = ['name', 'description', 'createdAt']
const columns = generateColumnsFromFieldConfig(roleFieldConfig)
  .filter(col => selectedFieldNames.includes((col as any).accessorKey))

type Role = {
  id: string
  name: string
  description: string
  createdAt: string
}

type DisplayField = {
  accessorKey: keyof Role
  header: string
}

const allFields: DisplayField[] = [
  {
    accessorKey: 'name',
    header: 'role.fields.name',
  },
  ...columns.map((col) => col as DisplayField)
]

export default function RolePage() {
  const t = useTranslations()
  const { getFieldHeader } = useFieldHeader(roleFieldConfig as FieldConfig<{ [x: string]: {} }>[])

  const [roles, setRoles] = useState<Role[]>([])
  const [selectedFields, setSelectedFields] = useState<DisplayField[]>([
    { accessorKey: 'name', header: getFieldHeader('name') },
    { accessorKey: 'description', header: getFieldHeader('description') },
  ])
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [formeditValues, setFormEditValues] = useState<Record<string, any>>({})

  const dynamicColumns: ColumnDef<Role>[] = selectedFields.map((field) => ({
    accessorKey: field.accessorKey,
    header: getFieldHeader(field.accessorKey),
    cell: (info) => info.getValue(),
  }))

  const { data: roleData, loading } = useEntityGetAll<Role>('role')
  const { deleteEntity } = useEntityDelete('role')

  const handleDelete = (role: Role) => {
    deleteEntity(role.id)
    setRoles(prev => prev.filter(p => p.id !== role.id))
  }

  const loadMore = async (): Promise<Role[]> => {
    await new Promise((r) => setTimeout(r, 1000))
    return []
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse<Role>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setRoles((prev) => [...prev, ...results.data])
      }
    })
  }

  const handleEdit = (row: object) => {
    setFormEditValues(row)
  }

  useEffect(() => {
    if (!roleData) return

    setRoles(prev => {
      const existingIds = new Set(prev.map(p => p.id))
      const filtered = roleData.filter(p => !existingIds.has(p.id))
      return [...prev, ...filtered]
    })
  }, [roleData])

  const renderImportModal = (open: boolean, setOpen: (v: boolean) => void) => (
    <ImportModal
      open={open}
      setOpen={setOpen}
      title="Import Roles"
      headers={['id', 'name', 'description', 'createdAt']}
      exampleRow={['', 'Admin', 'Full access', '2025-01-01T00:00:00Z']}
      onUpload={(file) => {
        handleImport({ target: { files: [file] } } as any)
      }}
    />
  )

  return (
    <div>
      <PageBreadcrumb pageTitle="Role List" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[1100px]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Manage Roles
            </h3>
          </div>
          <DataTable
            columns={dynamicColumns}
            data={roles}
            loading={loading}
            onEdit={handleEdit}
            fieldConfig={roleFieldConfig}
            onDelete={handleDelete}
            loadMore={loadMore}
            setConfigModal={setIsConfigModalOpen}
            renderImportModal={renderImportModal}
            height="500px"
            entity="role"
            isredirectEdit={true}
            isredirectCreate={true}
            // tableId="role-list"
          />
        </div>
      </div>
      <ConfigureColumnsModal
        tableId="role-list"
        isOpen={isConfigModalOpen}
        onOpenChange={setIsConfigModalOpen}
        allFields={allFields}
        selectedFields={selectedFields}
        onChangeSelectedFields={setSelectedFields}
        fieldConfig={roleFieldConfig}
        defaultFieldsArr={['name', 'description']}
      />
    </div>
  )
}
