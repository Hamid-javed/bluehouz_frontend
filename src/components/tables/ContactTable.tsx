// File: src/components/tables/ContactTable.tsx

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useEnumOptions } from '@/hooks/useEnumOptions';
import { useEntityGetAll } from '@/hooks/useEntityGetAll';

type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  contactTypeId?: string;
};

export default function ContactTable() {
  const router = useRouter();

  const { data: contacts, loading } = useEntityGetAll<Contact>('contact');
  const { map: contactTypeMap, loading: enumLoading } = useEnumOptions('contactType');
  console.log(contacts)
  const handleRowClick = (id: string) => {
    router.push(`/contact/${id}`);
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[600px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Name</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Email</TableCell>
                <TableCell isHeader className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">Contact Type</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {loading || enumLoading ? (
                <TableRow>
                  <td colSpan={3} className="px-5 py-4 text-center text-theme-sm">Loading...</td>
                </TableRow>
              ) : (
                contacts.map(contact => (
                  <tr
                    key={contact.id}
                    className="cursor-pointer hover:bg-gray-50 dark:hover:bg-white/[0.05]"
                    onClick={() => handleRowClick(contact.id)}
                  >
                    <td className="px-5 py-4 text-start text-theme-sm">
                      {contact.firstName} {contact.lastName}
                    </td>
                    <td className="px-5 py-4 text-start text-theme-sm">
                      {contact.email}
                    </td>
                    <td className="px-5 py-4 text-start text-theme-sm">
                      {contactTypeMap[contact.contactTypeId ?? ''] ?? '-'}
                    </td>
                  </tr>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
