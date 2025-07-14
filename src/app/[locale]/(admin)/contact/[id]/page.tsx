// File: bluehouz_frontend\src\app\[locale]\(admin)\contact\[id]\page.tsx

'use client'

import React from 'react'
import PageBreadcrumb from '@/components/common/PageBreadCrumb'
import ContactForm from '@/components/entities/contact/ContactForm'
import { useParams } from 'next/navigation'

// Import your tab UI components
import Tabs from '@/components/ui/tabs/Tabs'
import TabList from '@/components/ui/tabs/TabList'
import Tab from '@/components/ui/tabs/Tab'
import TabPanel from '@/components/ui/tabs/TabPanel'

// Import the actual ContactFiles component
import ContactFiles from '@/components/contact/ContactFiles'

// Import the ChildContactTable from the correct path
import ChildContactTable from '@/components/childContact/ChildContactTable'

// Import the placeholder "Coming Soon" component
import ComingSoon from '@/components/common/ComingSoon'

// Example: Import icons for tabs (optional)
import { UsersIcon, FolderIcon, LinkIcon, CheckCircleIcon, BriefcaseIcon } from '@heroicons/react/24/outline'
import { useTranslations } from 'next-intl'

export default function ContactDetailPage() {
  const params = useParams()
  const contactId = typeof params?.id === 'string' ? params.id : '';
  const isCreateMode = contactId === 'new';
  const tChildContact = useTranslations('childContact');

  return (
    <div>
      <PageBreadcrumb pageTitle={isCreateMode ? "New Contact" : "Edit Contact"} />
      <Tabs>
        {/* Tab Navigation */}
        <TabList>
          <Tab index={0}><UsersIcon className="w-5 h-5" /> Overview</Tab>
          <Tab index={1}><LinkIcon className="w-5 h-5" /> Child Contacts</Tab>
          <Tab index={2}><CheckCircleIcon className="w-5 h-5" /> Tasks</Tab>
          <Tab index={3}><BriefcaseIcon className="w-5 h-5" /> Cases</Tab>
          <Tab index={4}><FolderIcon className="w-5 h-5" /> Files</Tab>
        </TabList>

        {/* Tab Content */}
        <TabPanel index={0}>
          <div className="space-y-6">
            <ContactForm
              contactId={isCreateMode ? undefined : contactId}
              submitLabel={isCreateMode ? 'Create Contact' : 'Save Contact'}
            />
          </div>
        </TabPanel>

        <TabPanel index={1}>
          <ChildContactTable parentContactId={contactId} t={tChildContact} />
        </TabPanel>

        <TabPanel index={2}>
          <ComingSoon />
        </TabPanel>

        <TabPanel index={3}>
          <ComingSoon />
        </TabPanel>

        <TabPanel index={4}>
          <ContactFiles contactId={contactId} />
        </TabPanel>
      </Tabs>
    </div>
  )
}
