// File: bluehouz_frontend/src/components/entities/rolePermission/RolePermissionTable.tsx

'use client'

import React, { useEffect, useState } from 'react'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { DataTable } from '@/components/tables/DataTable'
import { ColumnDef } from '@tanstack/react-table'
import { useEntityGetAll } from '@/hooks/useEntityGetAll'
import { useEntityDelete } from '@/hooks/useEntityDelete'
import { useTranslations } from 'next-intl'
import { useFieldHeader } from '@/hooks/useFieldHeader'
import { ConfigureColumnsModal } from '@/components/ui/modal/ConfigureModal'
import { ImportModal } from '@/components/ui/modal/ImportModal'
import Papa from 'papaparse'
import { rolePermissionFieldConfig } from '@shared/config/rolePermissionFieldConfig'
import { generateColumnsFromFieldConfig } from '@/lib/generateColoumn'

interface RolePermissionTableProps {
  roleId: string
}

type RolePermission = {
  id: string
  roleId: string
  permissionId: string
  createdAt: string
}

type DisplayField = {
  accessorKey: keyof RolePermission
  header: string
}

export default function RolePermissionTable({ roleId }: RolePermissionTableProps) {
  const t = useTranslations()
  const { getFieldHeader } = useFieldHeader(rolePermissionFieldConfig)

  const [entries, setEntries] = useState<RolePermission[]>([])
  const [selectedFields, setSelectedFields] = useState<DisplayField[]>([])
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [formeditValues, setFormEditValues] = useState<Record<string, any>>({})

  const allColumns = generateColumnsFromFieldConfig(rolePermissionFieldConfig)
  const allFields: DisplayField[] = allColumns
    .filter((col): col is ColumnDef<RolePermission> & { accessorKey: string } => 'accessorKey' in col)
    .map((col) => ({
      accessorKey: col.accessorKey as keyof RolePermission,
      header: getFieldHeader(col.accessorKey as string),
    }))

  const defaultFieldsArr = ['roleId', 'permissionId'] as (keyof RolePermission)[]
  useEffect(() => {
    setSelectedFields(
      allFields.filter((field) => defaultFieldsArr.includes(field.accessorKey))
    )
  }, [])

  const dynamicColumns: ColumnDef<RolePermission>[] = selectedFields.map((field) => ({
    accessorKey: field.accessorKey,
    header: getFieldHeader(field.accessorKey),
    cell: (info) => info.getValue(),
  }))

  const { data, loading } = useEntityGetAll<RolePermission>('rolePermission', { roleId })
  const { deleteEntity } = useEntityDelete('rolePermission')

  const handleDelete = (entry: RolePermission) => {
    deleteEntity(entry.id)
    setEntries((prev) => prev.filter((e) => e.id !== entry.id))
  }

  const loadMore = async (): Promise<RolePermission[]> => {
    await new Promise((r) => setTimeout(r, 1000))
    return []
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse<RolePermission>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setEntries((prev) => [...prev, ...results.data])
      },
    })
  }

  const handleEdit = (row: object) => {
    setFormEditValues(row)
  }

  useEffect(() => {
    if (!data) return
    setEntries((prev) => {
      const existingIds = new Set(prev.map((e) => e.id))
      const filtered = data.filter((e) => !existingIds.has(e.id))
      return [...prev, ...filtered]
    })
  }, [data])

  const renderImportModal = (open: boolean, setOpen: (v: boolean) => void) => (
    <ImportModal
      open={open}
      setOpen={setOpen}
      title="Import RolePermissions"
      headers={allFields.map((f) => f.accessorKey)}
      exampleRow={allFields.map((f) => {
        if (f.accessorKey === 'roleId') return roleId
        if (f.accessorKey === 'permissionId') return 'perm1'
        if (f.accessorKey === 'createdAt') return new Date().toISOString()
        return ''
      })}
      onUpload={(file) => {
        handleImport({ target: { files: [file] } } as any)
      }}
    />
  )

  return (
    <div>
      <PageBreadcrumb pageTitle="Role Permission List" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[100%]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Manage Role Permissions
            </h3>
          </div>
          <DataTable
            columns={dynamicColumns}
            data={entries}
            loading={loading}
            onEdit={handleEdit}
            fieldConfig={rolePermissionFieldConfig}
            onDelete={handleDelete}
            loadMore={loadMore}
            setConfigModal={setIsConfigModalOpen}
            renderImportModal={renderImportModal}
            height="500px"
            entity="rolePermission"
            isredirectEdit={true}
            isredirectCreate={true}
            createUrl={`/rolePermission/new?roleId=${roleId}`}
            tableId="role-permission-list"
          />
        </div>
      </div>
      <ConfigureColumnsModal
        tableId="role-permission"
        isOpen={isConfigModalOpen}
        onOpenChange={setIsConfigModalOpen}
        allFields={allFields}
        selectedFields={selectedFields}
        onChangeSelectedFields={setSelectedFields}
        fieldConfig={rolePermissionFieldConfig}
        defaultFieldsArr={defaultFieldsArr}
      />
    </div>
  )
}
