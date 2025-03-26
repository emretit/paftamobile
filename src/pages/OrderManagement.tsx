
import { useState } from "react";
import { 
  CustomTabs, 
  CustomTabsContent, 
  CustomTabsList, 
  CustomTabsTrigger 
} from "@/components/ui/custom-tabs";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import OrdersTable from "@/components/orders/OrdersTable";
import OrderForm from "@/components/orders/OrderForm";
import { useSearchParams } from "react-router-dom";

interface OrderManagementProps {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const OrderManagement = ({ isCollapsed, setIsCollapsed }: OrderManagementProps) => {
  const [activeTab, setActiveTab] = useState("orders");
  const [searchParams] = useSearchParams();
  const proposalId = searchParams.get("proposalId");

  // If proposalId is present, show the new order form
  if (proposalId) {
    return (
      <DefaultLayout
        title="Yeni Sipariş Oluştur"
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      >
        <div className="container mx-auto py-6">
          <OrderForm proposalId={proposalId} />
        </div>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout
      title="Sipariş Yönetimi"
      isCollapsed={isCollapsed}
      setIsCollapsed={setIsCollapsed}
    >
      <div className="container mx-auto py-6">
        <CustomTabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <CustomTabsList className="w-full grid grid-cols-3">
            <CustomTabsTrigger value="orders">Siparişler</CustomTabsTrigger>
            <CustomTabsTrigger value="invoices">E-Faturalar</CustomTabsTrigger>
            <CustomTabsTrigger value="shipments">Sevkiyatlar</CustomTabsTrigger>
          </CustomTabsList>
          
          <CustomTabsContent value="orders">
            <OrdersTable />
          </CustomTabsContent>
          
          <CustomTabsContent value="invoices">
            <div className="mt-6">
              <InvoiceList />
            </div>
          </CustomTabsContent>
          
          <CustomTabsContent value="shipments">
            <div className="p-8 text-center">
              <p>Sevkiyat sayfası yakında eklenecek.</p>
            </div>
          </CustomTabsContent>
        </CustomTabs>
      </div>
    </DefaultLayout>
  );
};

export default OrderManagement;

// Import this at the top to avoid circular reference
const InvoiceList = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4">E-Faturalar</h2>
      <InvoiceTable />
    </div>
  );
};

const InvoiceTable = () => {
  const [filter, setFilter] = useState("all");
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <select 
            className="border border-gray-300 rounded-md text-sm py-1.5 px-3"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">Tüm Faturalar</option>
            <option value="pending">Bekleyen</option>
            <option value="paid">Ödendi</option>
            <option value="overdue">Gecikmiş</option>
          </select>
        </div>
        <button 
          className="bg-primary text-white px-4 py-2 rounded-md text-sm font-medium"
        >
          Yeni E-Fatura
        </button>
      </div>
      
      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="py-3 px-4 text-left">Fatura No</th>
            <th className="py-3 px-4 text-left">Müşteri</th>
            <th className="py-3 px-4 text-left">Tarih</th>
            <th className="py-3 px-4 text-left">Tutar</th>
            <th className="py-3 px-4 text-left">Durum</th>
            <th className="py-3 px-4 text-left">İşlemler</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {/* Example invoice rows */}
          <tr className="hover:bg-gray-50">
            <td className="py-3 px-4">E-2023/001</td>
            <td className="py-3 px-4">ABC Şirketi</td>
            <td className="py-3 px-4">01.04.2023</td>
            <td className="py-3 px-4">₺12,500.00</td>
            <td className="py-3 px-4">
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Ödendi</span>
            </td>
            <td className="py-3 px-4">
              <button className="text-blue-600 hover:text-blue-800 mr-2">Görüntüle</button>
              <button className="text-gray-600 hover:text-gray-800">İndir</button>
            </td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="py-3 px-4">E-2023/002</td>
            <td className="py-3 px-4">XYZ Ltd.</td>
            <td className="py-3 px-4">15.04.2023</td>
            <td className="py-3 px-4">₺8,750.00</td>
            <td className="py-3 px-4">
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Bekliyor</span>
            </td>
            <td className="py-3 px-4">
              <button className="text-blue-600 hover:text-blue-800 mr-2">Görüntüle</button>
              <button className="text-gray-600 hover:text-gray-800">İndir</button>
            </td>
          </tr>
          <tr className="hover:bg-gray-50">
            <td className="py-3 px-4">E-2023/003</td>
            <td className="py-3 px-4">LMN Holding</td>
            <td className="py-3 px-4">25.04.2023</td>
            <td className="py-3 px-4">₺21,350.00</td>
            <td className="py-3 px-4">
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Gecikmiş</span>
            </td>
            <td className="py-3 px-4">
              <button className="text-blue-600 hover:text-blue-800 mr-2">Görüntüle</button>
              <button className="text-gray-600 hover:text-gray-800">İndir</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
