
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";

export const ExchangeRateLoading: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-3">
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        ))}
      </div>
      
      <Skeleton className="h-64 w-full rounded-md" />
    </div>
  );
};

export default ExchangeRateLoading;
