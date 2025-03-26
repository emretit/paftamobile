
import React from "react";
import { QueryClient, QueryClientProvider as ReactQueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export const QueryClientProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ReactQueryClientProvider client={queryClient}>
      {children}
    </ReactQueryClientProvider>
  );
};
