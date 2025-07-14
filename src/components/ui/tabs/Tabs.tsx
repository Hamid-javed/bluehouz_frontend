// src/components/ui/tabs/Tabs.tsx
import React, { useState, ReactNode } from 'react';
import { TabsContext } from './TabsContext';

interface TabsProps {
  children: ReactNode;
}

const Tabs: React.FC<TabsProps> = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <TabsContext.Provider value={{ activeIndex, setActiveIndex }}>
      <div>{children}</div>
    </TabsContext.Provider>
  );
};

export default Tabs;
