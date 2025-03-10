
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
          <CustomTabsList className="w-full grid grid-cols-3">
            <CustomTabsTrigger value="requests">Satın Alma Talepleri</CustomTabsTrigger>
            <CustomTabsTrigger value="orders">Satın Alma Siparişleri</CustomTabsTrigger>
            <CustomTabsTrigger value="invoices">Faturalar</CustomTabsTrigger>
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
