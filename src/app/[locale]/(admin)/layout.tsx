//File: bluehouz_frontend\src\app\[locale]\(admin)\layout.tsx

'use client';

import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { useSidebar } from '@/context/SidebarContext';
import AppHeader from '@/layout/AppHeader';
import AppSidebar from '@/layout/AppSidebar';
import Backdrop from '@/layout/Backdrop';
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, fetchEntityMeLoading } = useAuth();
  const router = useRouter();
  const [check , setCheck] = useState(true)

  useEffect(() => {
    if (!isAuthenticated && !fetchEntityMeLoading) {
      router.push('/signin'); // redirect if not authenticated
    }else if(isAuthenticated){
      setCheck(false)
    }
  }, [ router ,isAuthenticated , fetchEntityMeLoading]);

  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? 'ml-0'
    : isExpanded || isHovered
      ? 'lg:ml-[290px]'
      : 'lg:ml-[90px]';

      if (check) return null

  return (
    <div className="min-h-screen xl:flex">
      {/* Sidebar and Backdrop */}
      <AppSidebar />
      <Backdrop />
      {/* Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        {/* Header */}
        <AppHeader />
        {/* Page Content */}
        <div className="p-4 mx-auto max-w-(--breakpoint-2xl) md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
