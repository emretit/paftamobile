
import React, { useState } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderForm from "@/components/orders/OrderForm";
import InvoiceView from "@/components/orders/InvoiceView";

interface OrdersListProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const OrdersList = ({ isCollapsed, setIsCollapsed }: OrdersListProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("orders");
  
  return (
    <DefaultLayout
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
      title="Siparişler"
      subtitle="Müşteri siparişlerini yönetin ve takip edin"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri
          </Button>
        </div>
        <div>
          <Button onClick={() => navigate("/orders/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Yeni Sipariş
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="orders">Tüm Siparişler</TabsTrigger>
            <TabsTrigger value="pending">Bekleyen Siparişler</TabsTrigger>
            <TabsTrigger value="completed">Tamamlanan Siparişler</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders" className="p-4">
            <div className="text-center p-8 text-muted-foreground">
              <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">Henüz sipariş bulunmuyor</h3>
              <p>Yeni sipariş eklemek için "Yeni Sipariş" butonunu kullanabilirsiniz.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="pending" className="p-4">
            <div className="text-center p-8 text-muted-foreground">
              <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">Bekleyen sipariş bulunmuyor</h3>
              <p>Tüm siparişleriniz tamamlanmış durumda.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="p-4">
            <div className="text-center p-8 text-muted-foreground">
              <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <h3 className="text-lg font-medium mb-2">Tamamlanan sipariş bulunmuyor</h3>
              <p>Henüz tamamlanmış sipariş bulunmamaktadır.</p>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </DefaultLayout>
  );
};

export default OrdersList;
