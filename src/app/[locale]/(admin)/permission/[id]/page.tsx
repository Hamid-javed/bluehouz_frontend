// File: bluehouz_frontend/src/app/[locale]/(admin)/permission/[id]/page.tsx

'use client'

import React from 'react'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import { useParams } from 'next/navigation'

// Import your tab UI components
import Tabs from '@/components/ui/tabs/Tabs'
import TabList from '@/components/ui/tabs/TabList'
import Tab from '@/components/ui/tabs/Tab'
import TabPanel from '@/components/ui/tabs/TabPanel'

// Import your permission form component
import PermissionForm from '@/components/entities/permission/PermissionForm'

// Import the placeholder "Coming Soon" component
import ComingSoon from '@/components/common/ComingSoon'

// Optional: import icons for tabs
import {
  LockClosedIcon,
  FolderIcon,
  CheckCircleIcon,
  UsersIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline'

export default function PermissionDetailPage() {
  const params = useParams()
  const permissionId = typeof params?.id === 'string' ? params.id : ''
  const isCreateMode = permissionId === 'new'

  return (
    <div>
      <PageBreadcrumb pageTitle={isCreateMode ? 'New Permission' : 'Edit Permission'} />
      <Tabs>
        {/* Tab Navigation */}
        <TabList>
          <Tab index={0}><LockClosedIcon className="w-5 h-5" /> Overview</Tab>
          <Tab index={1}><UsersIcon className="w-5 h-5" /> Roles</Tab>
          <Tab index={2}><CheckCircleIcon className="w-5 h-5" /> Tasks</Tab>
          <Tab index={3}><BriefcaseIcon className="w-5 h-5" /> Cases</Tab>
          <Tab index={4}><FolderIcon className="w-5 h-5" /> Files</Tab>
        </TabList>

        {/* Tab Content */}
        <TabPanel index={0}>
          <div className="space-y-6">
            <PermissionForm
              permissionId={isCreateMode ? undefined : permissionId}
              submitLabel={isCreateMode ? 'Create Permission' : 'Save Permission'}
            />
          </div>
        </TabPanel>

        <TabPanel index={1}>
          {/* Replace this with actual roles list or assignment logic */}
          <ComingSoon />
        </TabPanel>

        <TabPanel index={2}>
          <ComingSoon />
        </TabPanel>

        <TabPanel index={3}>
          <ComingSoon />
        </TabPanel>

        <TabPanel index={4}>
          {/* You can create a <PermissionFiles /> component if needed */}
          <ComingSoon />
        </TabPanel>
      </Tabs>
    </div>
  )
}
