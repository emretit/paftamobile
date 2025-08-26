
import React, { useState } from "react";
import { useAuth } from "./auth/AuthContext";
import OrgSwitcher from "./components/OrgSwitcher";
import { AppProviders } from "./providers/AppProviders";
import { AppRoutes } from "./routes";

function App() {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <AppProviders>
      <AppRoutes isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
    </AppProviders>
  );
}

export default App;
