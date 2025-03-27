
import React from "react";
import { QueryClientProvider } from "./QueryClientProvider";
import { ToastProvider } from "@/components/toast/ToastProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider>
      <TooltipProvider>
        {children}
        <ToastProvider />
      </TooltipProvider>
    </QueryClientProvider>
  );
};
