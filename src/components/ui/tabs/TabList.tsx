// src/components/ui/tabs/TabList.tsx
import React, { ReactNode } from 'react';

interface TabListProps {
  children: ReactNode;
}

const TabList: React.FC<TabListProps> = ({ children }) => {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800">
      <nav className="flex space-x-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-600">
        {children}
      </nav>
    </div>
  );
};

export default TabList;
