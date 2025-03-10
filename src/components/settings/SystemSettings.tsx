
import { useState } from "react";
import { 
  CustomTabs, 
  CustomTabsContent, 
  CustomTabsList, 
  CustomTabsTrigger 
} from "@/components/ui/custom-tabs";
import { GeneralSettingsTab } from "./GeneralSettingsTab";
import { CompanyInfoTab } from "./CompanyInfoTab";
import { AuditLogsTab } from "./AuditLogsTab";
import { useCompanySettings } from "@/hooks/useCompanySettings";
import { useAuditLogs } from "@/hooks/useAuditLogs";

export const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState("general");
  const { isLoading: settingsLoading } = useCompanySettings();
  const { isLoading: logsLoading } = useAuditLogs();

  if (settingsLoading || logsLoading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <CustomTabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <CustomTabsList>
        <CustomTabsTrigger value="general">Genel Ayarlar</CustomTabsTrigger>
        <CustomTabsTrigger value="company">Şirket Bilgileri</CustomTabsTrigger>
        <CustomTabsTrigger value="audit">Denetim Günlüğü</CustomTabsTrigger>
      </CustomTabsList>

      <CustomTabsContent value="general">
        <GeneralSettingsTab />
      </CustomTabsContent>

      <CustomTabsContent value="company">
        <CompanyInfoTab />
      </CustomTabsContent>

      <CustomTabsContent value="audit">
        <AuditLogsTab />
      </CustomTabsContent>
    </CustomTabs>
  );
};
