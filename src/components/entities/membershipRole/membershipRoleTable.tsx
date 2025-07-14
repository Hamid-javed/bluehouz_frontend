//File: bluehouz_frontend\src\components\entities\membershipRole\membershipRoleTable.tsx

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
import { membershipRoleFieldConfig } from '@shared/config/membershipRoleFieldConfig'
import { generateColumnsFromFieldConfig } from '@/lib/generateColoumn'

interface MembershipRoleTableProps {
  roleId: string
}

type MembershipRole = {
  id: string
  roleId: string
  membershipId: string
  createdAt: string
}

type DisplayField = {
  accessorKey: keyof MembershipRole
  header: string
}

export default function MembershipRoleTable({ roleId }: MembershipRoleTableProps) {
  const t = useTranslations()
  const { getFieldHeader } = useFieldHeader(membershipRoleFieldConfig)

  const [entries, setEntries] = useState<MembershipRole[]>([])
  const [selectedFields, setSelectedFields] = useState<DisplayField[]>([])
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [formeditValues, setFormEditValues] = useState<Record<string, any>>({})

  const allColumns = generateColumnsFromFieldConfig(membershipRoleFieldConfig)
  const allFields: DisplayField[] = allColumns
    .filter((col): col is ColumnDef<MembershipRole> & { accessorKey: string } => 'accessorKey' in col)
    .map((col) => ({
      accessorKey: col.accessorKey as keyof MembershipRole,
      header: getFieldHeader(col.accessorKey as string),
    }))

  const defaultFieldsArr = ['membershipId', 'createdAt'] as (keyof MembershipRole)[]
  useEffect(() => {
    setSelectedFields(
      allFields.filter((field) => defaultFieldsArr.includes(field.accessorKey))
    )
  }, [])

  const dynamicColumns: ColumnDef<MembershipRole>[] = selectedFields.map((field) => ({
    accessorKey: field.accessorKey,
    header: getFieldHeader(field.accessorKey),
    cell: (info) => info.getValue(),
  }))

  const { data, loading } = useEntityGetAll<MembershipRole>('membershipRole', { roleId })
  const { deleteEntity } = useEntityDelete('membershipRole')

  const handleDelete = (entry: MembershipRole) => {
    deleteEntity(entry.id)
    setEntries((prev) => prev.filter((e) => e.id !== entry.id))
  }

  const loadMore = async (): Promise<MembershipRole[]> => {
    await new Promise((r) => setTimeout(r, 1000))
    return []
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    Papa.parse<MembershipRole>(file, {
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
      title="Import MembershipRoles"
      headers={allFields.map((f) => f.accessorKey)}
      exampleRow={allFields.map((f) => {
        if (f.accessorKey === 'roleId') return roleId
        if (f.accessorKey === 'membershipId') return 'membership1'
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
      <PageBreadcrumb pageTitle="Membership Role List" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[100%]">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
              Manage Membership Roles
            </h3>
          </div>
          <DataTable
            columns={dynamicColumns}
            data={entries}
            loading={loading}
            onEdit={handleEdit}
            fieldConfig={membershipRoleFieldConfig}
            onDelete={handleDelete}
            loadMore={loadMore}
            setConfigModal={setIsConfigModalOpen}
            renderImportModal={renderImportModal}
            height="500px"
            entity="membershipRole"
            isredirectEdit={true}
            isredirectCreate={true}
            createUrl={`/membershipRole/new?roleId=${roleId}`}
            tableId="membership-role-list"
          />
        </div>
      </div>
      <ConfigureColumnsModal
        tableId="membership-role-list"
        isOpen={isConfigModalOpen}
        onOpenChange={setIsConfigModalOpen}
        allFields={allFields}
        selectedFields={selectedFields}
        onChangeSelectedFields={setSelectedFields}
        fieldConfig={membershipRoleFieldConfig}
        defaultFieldsArr={defaultFieldsArr}
      />
    </div>
  )
}
