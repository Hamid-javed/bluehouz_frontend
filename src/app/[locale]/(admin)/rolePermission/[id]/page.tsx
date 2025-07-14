//File: bluehouz_frontend\src\app\[locale]\(admin)\rolePermission\[id]\page.tsx

'use client';

import React from 'react';
import RolePermissionForm from '@/components/entities/rolePermission/RolePermissionForm';
import { useParams } from 'next/navigation';

export default function RolePermissionPage() {
  const params = useParams();
  const rolePermissionId = params?.id as string;

  return (
    <div className="p-6">
      <RolePermissionForm rolePermissionId={rolePermissionId} />
    </div>
  );
}
