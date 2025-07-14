// src/components/ui/tabs/Tab.tsx
import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { useTabsContext } from './TabsContext';

interface TabProps {
  index: number;
  children: ReactNode;
}

const Tab: React.FC<TabProps> = ({ index, children }) => {
  const { activeIndex, setActiveIndex } = useTabsContext();

  return (
    <button
      className={clsx(
        'inline-flex items-center gap-2 border-b-2 px-2.5 py-2 text-sm font-medium transition-colors duration-200',
        index === activeIndex
          ? 'text-brand-500 border-brand-500 dark:text-brand-400 dark:border-brand-400'
          : 'text-gray-500 border-transparent hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
      )}
      onClick={() => setActiveIndex(index)}
    >
      {children}
    </button>
  );
};

export default Tab;
