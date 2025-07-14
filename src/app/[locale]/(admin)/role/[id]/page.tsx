//File: bluehouz_frontend\src\app\[locale]\(admin)\role\[id]\page.tsx

'use client'

import React from 'react'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { useParams } from 'next/navigation'

import Tabs from '@/components/ui/tabs/Tabs'
import TabList from '@/components/ui/tabs/TabList'
import Tab from '@/components/ui/tabs/Tab'
import TabPanel from '@/components/ui/tabs/TabPanel'

import RoleForm from '@/components/entities/role/RoleForm'
import RolePermissionTable from '@/components/entities/rolePermission/RolePermissionTable'
import MembershipRoleTable from '@/components/entities/membershipRole/membershipRoleTable'
import ComingSoon from '@/components/common/ComingSoon'

import {
  UsersIcon,
  KeyIcon,
  ShieldCheckIcon,
  FolderIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'

export default function RoleDetailPage() {
  const params = useParams()
  const roleId = typeof params?.id === 'string' ? params.id : ''
  const isCreateMode = roleId === 'new'

  return (
    <div>
      <PageBreadcrumb pageTitle={isCreateMode ? 'New Role' : 'Edit Role'} />
      <Tabs>
        <TabList>
          <Tab index={0}><KeyIcon className="w-5 h-5" /> Overview</Tab>
          <Tab index={1}><ShieldCheckIcon className="w-5 h-5" /> Permissions</Tab>
          <Tab index={2}><UsersIcon className="w-5 h-5" /> Memberships</Tab>
          <Tab index={3}><ClipboardDocumentIcon className="w-5 h-5" /> Audit</Tab>
          <Tab index={4}><FolderIcon className="w-5 h-5" /> Files</Tab>
        </TabList>

        <TabPanel index={0}>
          <div className="space-y-6">
            <RoleForm
              roleId={isCreateMode ? undefined : roleId}
              submitLabel={isCreateMode ? 'Create Role' : 'Save Role'}
            />
          </div>
        </TabPanel>

        <TabPanel index={1}>
          {isCreateMode ? (
            <p className="text-gray-500">You can assign permissions after the role is created.</p>
          ) : (
            <RolePermissionTable roleId={roleId} />
          )}
        </TabPanel>

        <TabPanel index={2}>
          {isCreateMode ? (
            <p className="text-gray-500">You can assign memberships after the role is created.</p>
          ) : (
            <MembershipRoleTable roleId={roleId} />
          )}
        </TabPanel>

        <TabPanel index={3}>
          <ComingSoon />
        </TabPanel>

        <TabPanel index={4}>
          <ComingSoon />
        </TabPanel>
      </Tabs>
    </div>
  )
}
