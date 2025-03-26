
import React from "react";
import { QueryClientProvider } from "./QueryClientProvider";
import { ToastProvider } from "@/components/toast/ToastProvider";

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <QueryClientProvider>
      {children}
      <ToastProvider />
    </QueryClientProvider>
  );
};
