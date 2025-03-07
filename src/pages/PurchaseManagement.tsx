
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="requests">Satın Alma Talepleri</TabsTrigger>
            <TabsTrigger value="orders">Satın Alma Siparişleri</TabsTrigger>
            <TabsTrigger value="invoices">Faturalar</TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests">
            <RequestsTable />
          </TabsContent>
          
          <TabsContent value="orders">
            <div className="p-8 text-center">
              <p>Sipariş sayfası yakında eklenecek.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="invoices">
            <div className="p-8 text-center">
              <p>Fatura sayfası yakında eklenecek.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DefaultLayout>
  );
};

export default PurchaseManagement;
