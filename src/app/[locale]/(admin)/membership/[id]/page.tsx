// File: src/app/(admin)/membership/[id]/page.tsx

'use client'

import React from 'react'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import MembershipForm from '@/components/entities/membership/MembershipForm'
import { useParams } from 'next/navigation'

// Import your tab UI components
import Tabs from '@/components/ui/tabs/Tabs'
import TabList from '@/components/ui/tabs/TabList'
import Tab from '@/components/ui/tabs/Tab'
import TabPanel from '@/components/ui/tabs/TabPanel'

// Example: Import icons for tabs (optional)
import { UsersIcon, FolderIcon, LinkIcon, CheckCircleIcon, BriefcaseIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'

// Placeholder components for now, can be replaced with actual tables/files/tasks later
import ComingSoon from '@/components/common/ComingSoon'

export default function MembershipDetailPage() {
  const params = useParams();
  const membershipId = typeof params?.id === 'string' ? params.id : '';
  const isCreateMode = membershipId === 'new';

  return (
    <div>
      <PageBreadcrumb pageTitle={isCreateMode ? "New Membership" : "Edit Membership"} />

      <Tabs>
        <TabList>
          <Tab index={0}><UsersIcon className="w-5 h-5" /> Overview</Tab>
          <Tab index={1}><LinkIcon className="w-5 h-5" /> Linked Entities</Tab>
          <Tab index={2}><CheckCircleIcon className="w-5 h-5" /> Tasks</Tab>
          <Tab index={3}><BriefcaseIcon className="w-5 h-5" /> Cases</Tab>
          <Tab index={4}><FolderIcon className="w-5 h-5" /> Files</Tab>
        </TabList>

        <TabPanel index={0}>
          <div className="space-y-6">
            <MembershipForm
              membershipId={isCreateMode ? undefined : membershipId}
              submitLabel={isCreateMode ? 'Create Membership' : 'Save Membership'}
            />
          </div>
        </TabPanel>

        <TabPanel index={1}>
          <ComingSoon /> {/* Could be a related Users table or similar */}
        </TabPanel>

        <TabPanel index={2}>
          <ComingSoon />
        </TabPanel>

        <TabPanel index={3}>
          <ComingSoon />
        </TabPanel>

        <TabPanel index={4}>
          <ComingSoon /> {/* Could be a MembershipFiles component in the future */}
        </TabPanel>
      </Tabs>
    </div>
  );
}
