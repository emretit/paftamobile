
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
      <CustomTabsList className="grid grid-cols-3 w-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-1 shadow-sm">
        <CustomTabsTrigger value="general" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Genel Ayarlar</CustomTabsTrigger>
        <CustomTabsTrigger value="company" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Şirket Bilgileri</CustomTabsTrigger>
        <CustomTabsTrigger value="audit" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Denetim Günlüğü</CustomTabsTrigger>
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
