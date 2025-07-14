// src/components/ui/tabs/TabsContext.tsx
import { createContext, useContext } from 'react';

interface TabsContextType {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
}

export const TabsContext = createContext<TabsContextType | null>(null);

export const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('useTabsContext must be used within Tabs');
  return context;
};
