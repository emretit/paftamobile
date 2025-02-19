
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
      <TabsList>
        <TabsTrigger value="general">Genel Ayarlar</TabsTrigger>
        <TabsTrigger value="company">Şirket Bilgileri</TabsTrigger>
        <TabsTrigger value="audit">Denetim Günlüğü</TabsTrigger>
      </TabsList>

      <TabsContent value="general">
        <GeneralSettingsTab />
      </TabsContent>

      <TabsContent value="company">
        <CompanyInfoTab />
      </TabsContent>

      <TabsContent value="audit">
        <AuditLogsTab />
      </TabsContent>
    </Tabs>
  );
};
