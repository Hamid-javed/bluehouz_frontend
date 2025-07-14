// src/components/ui/tabs/TabPanel.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { useTabsContext } from './TabsContext';

interface TabPanelProps {
  index: number;
  children: ReactNode;
}

const TabPanel: React.FC<TabPanelProps> = ({ index, children }) => {
  const { activeIndex } = useTabsContext();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (activeIndex === index && !isLoaded) {
      setIsLoaded(true); // load this panel's data on first open
    }
  }, [activeIndex, index, isLoaded]);

  if (activeIndex !== index && !isLoaded) return null;

  return (
    <div className="mt-4">
      {activeIndex === index && children}
    </div>
  );
};

export default TabPanel;
