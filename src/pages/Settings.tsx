
import { useState } from "react";
import Navbar from "@/components/Navbar";
import { 
  CustomTabs, 
  CustomTabsContent, 
  CustomTabsList, 
  CustomTabsTrigger 
} from "@/components/ui/custom-tabs";
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
          
          <CustomTabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <CustomTabsList className="grid grid-cols-3 w-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-1 shadow-sm">
              <CustomTabsTrigger value="users" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Kullanıcılar</CustomTabsTrigger>
              <CustomTabsTrigger value="roles" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Roller & İzinler</CustomTabsTrigger>
              <CustomTabsTrigger value="system" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Sistem Ayarları</CustomTabsTrigger>
            </CustomTabsList>

            <CustomTabsContent value="users">
              <UserManagement />
            </CustomTabsContent>

            <CustomTabsContent value="roles">
              <RoleManagement />
            </CustomTabsContent>

            <CustomTabsContent value="system">
              <SystemSettings />
            </CustomTabsContent>
          </CustomTabs>
        </div>
      </main>
    </div>
  );
};

export default Settings;
