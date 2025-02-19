
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserManagement } from "@/components/settings/UserManagement";
import { RoleManagement } from "@/components/settings/RoleManagement";
import { SystemSettings } from "@/components/settings/SystemSettings";

interface SettingsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Settings = ({ isCollapsed, setIsCollapsed }: SettingsProps) => {
  const [activeTab, setActiveTab] = useState("users");

  return (
    <div className="min-h-screen bg-white">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} p-8`}>
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Ayarlar & Yönetim</h1>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList>
              <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
              <TabsTrigger value="roles">Roller & İzinler</TabsTrigger>
              <TabsTrigger value="system">Sistem Ayarları</TabsTrigger>
            </TabsList>

            <TabsContent value="users">
              <UserManagement />
            </TabsContent>

            <TabsContent value="roles">
              <RoleManagement />
            </TabsContent>

            <TabsContent value="system">
              <SystemSettings />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
