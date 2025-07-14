//File: bluehouz_frontend\src\app\[locale]\(admin)\membershipRole\[id]\page.tsx

// File: bluehouz_frontend/src/app/[locale]/(admin)/membershipRole/[id]/page.tsx

'use client'

import React from 'react'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { useParams } from 'next/navigation'

import Tabs from '@/components/ui/tabs/Tabs'
import TabList from '@/components/ui/tabs/TabList'
import Tab from '@/components/ui/tabs/Tab'
import TabPanel from '@/components/ui/tabs/TabPanel'

import MembershipRoleForm from '@/components/entities/membershipRole/membershipRoleForm'
import ComingSoon from '@/components/common/ComingSoon'

import {
  UsersIcon,
  KeyIcon,
  ClipboardDocumentIcon,
  FolderIcon
} from '@heroicons/react/24/outline'

export default function MembershipRoleDetailPage() {
  const params = useParams()
  const membershipRoleId = typeof params?.id === 'string' ? params.id : ''
  const isCreateMode = membershipRoleId === 'new'

  return (
    <div>
      <PageBreadcrumb pageTitle={isCreateMode ? 'New Membership Role' : 'Edit Membership Role'} />
      <Tabs>
        <TabList>
          <Tab index={0}><KeyIcon className="w-5 h-5" /> Overview</Tab>
          <Tab index={1}><UsersIcon className="w-5 h-5" /> Memberships</Tab>
          <Tab index={2}><ClipboardDocumentIcon className="w-5 h-5" /> Audit</Tab>
          <Tab index={3}><FolderIcon className="w-5 h-5" /> Files</Tab>
        </TabList>

        <TabPanel index={0}>
          <div className="space-y-6">
            <MembershipRoleForm
              membershipRoleId={isCreateMode ? undefined : membershipRoleId}
              submitLabel={isCreateMode ? 'Create Membership Role' : 'Save Membership Role'}
            />
          </div>
        </TabPanel>

        <TabPanel index={1}>
          <ComingSoon />
        </TabPanel>

        <TabPanel index={2}>
          <ComingSoon />
        </TabPanel>

        <TabPanel index={3}>
          <ComingSoon />
        </TabPanel>
      </Tabs>
    </div>
  )
}
