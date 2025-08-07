
import { useState } from "react";
import { 
  CustomTabs, 
  CustomTabsContent, 
  CustomTabsList, 
  CustomTabsTrigger 
} from "@/components/ui/custom-tabs";
import { CompanySettingsTab } from "./CompanySettingsTab";
import { AuditLogsTab } from "./AuditLogsTab";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useAuditLogs } from "@/hooks/useAuditLogs";

export const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState("settings");
  const { isLoading: settingsLoading } = useCompanySettings();
  const { isLoading: logsLoading } = useAuditLogs();

  if (settingsLoading || logsLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <CustomTabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <CustomTabsList className="w-full grid grid-cols-2">
        <CustomTabsTrigger value="settings">Ayarlar</CustomTabsTrigger>
        <CustomTabsTrigger value="audit">Denetim Günlüğü</CustomTabsTrigger>
      </CustomTabsList>

      <CustomTabsContent value="settings">
        <CompanySettingsTab />
      </CustomTabsContent>

      <CustomTabsContent value="audit">
        <AuditLogsTab />
      </CustomTabsContent>
    </CustomTabs>
  );
};
