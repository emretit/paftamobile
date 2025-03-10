
import { useState } from "react";
import { 
  CustomTabs, 
  CustomTabsContent, 
  CustomTabsList, 
  CustomTabsTrigger 
} from "@/components/ui/custom-tabs";
import { RequestsTable } from "@/components/purchase/requests/RequestsTable";
import DefaultLayout from "@/components/layouts/DefaultLayout";

interface PurchaseManagementProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const PurchaseManagement = ({ isCollapsed, setIsCollapsed }: PurchaseManagementProps) => {
  const [activeTab, setActiveTab] = useState("requests");

  return (
    <DefaultLayout
      title="Satın Alma Yönetimi"
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      <div className="container mx-auto py-6">
        <CustomTabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CustomTabsList className="grid grid-cols-3 w-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-1 shadow-sm">
            <CustomTabsTrigger value="requests" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Satın Alma Talepleri</CustomTabsTrigger>
            <CustomTabsTrigger value="orders" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Satın Alma Siparişleri</CustomTabsTrigger>
            <CustomTabsTrigger value="invoices" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Faturalar</CustomTabsTrigger>
          </CustomTabsList>
          
          <CustomTabsContent value="requests">
            <RequestsTable />
          </CustomTabsContent>
          
          <CustomTabsContent value="orders">
            <div className="p-8 text-center">
              <p>Sipariş sayfası yakında eklenecek.</p>
            </div>
          </CustomTabsContent>
          
          <CustomTabsContent value="invoices">
            <div className="p-8 text-center">
              <p>Fatura sayfası yakında eklenecek.</p>
            </div>
          </CustomTabsContent>
        </CustomTabs>
      </div>
    </DefaultLayout>
  );
};

export default PurchaseManagement;
