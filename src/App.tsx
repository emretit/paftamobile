
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppRoutes } from "./routes";
import { ToastProvider } from "./components/toast/ToastProvider";

const queryClient = new QueryClient();

function App() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <ToastProvider />
    </QueryClientProvider>
  );
}

export default App;
