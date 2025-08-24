// 🚀 INSTANT MODULE HELPER - Universal component for all dashboards
import React from 'react';
import { useFastModule } from '@/utils/consolidatedFastLoader';

export const createInstantModule = (moduleName: string) => {
  const InstantModule = ({ moduleName }: { moduleName: string }) => {
    const { component: Component, loading, error } = useFastModule(moduleName);
    
    if (error) {
      console.error(`[INSTANT_MODULE] ❌ Error loading ${moduleName}:`, error);
      return <div className="p-4 text-red-500">Error loading module</div>;
    }
    
    if (loading || !Component) {
      return (
        <div className="flex items-center justify-center h-32">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }
    
    console.log(`[INSTANT_MODULE] ⚡ ${moduleName} loaded INSTANTLY!`);
    return <Component />;
  };
  
  return <InstantModule moduleName={moduleName} />;
};