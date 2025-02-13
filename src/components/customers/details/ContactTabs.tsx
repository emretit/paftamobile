
import { Activity, Receipt, FileText, CreditCard, FileStack } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContactInfo } from "./ContactInfo";
import { FinancialInfo } from "./FinancialInfo";
import { HistoryCard } from "./HistoryCard";
import { Customer } from "@/types/customer";

interface ContactTabsProps {
  customer: Customer;
}

export const ContactTabs = ({ customer }: ContactTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList className="bg-white border">
        <TabsTrigger value="overview">Genel Bilgiler</TabsTrigger>
        <TabsTrigger value="activities" className="flex items-center gap-1">
          <Activity className="h-4 w-4" />
          Aktiviteler
        </TabsTrigger>
        <TabsTrigger value="service-receipts" className="flex items-center gap-1">
          <Receipt className="h-4 w-4" />
          Servis Fişleri
        </TabsTrigger>
        <TabsTrigger value="offers" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          Teklifler
        </TabsTrigger>
        <TabsTrigger value="invoices" className="flex items-center gap-1">
          <Receipt className="h-4 w-4" />
          Faturalar
        </TabsTrigger>
        <TabsTrigger value="transactions" className="flex items-center gap-1">
          <CreditCard className="h-4 w-4" />
          Cari Hareketler
        </TabsTrigger>
        <TabsTrigger value="contracts" className="flex items-center gap-1">
          <FileStack className="h-4 w-4" />
          Sözleşmeler
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ContactInfo customer={customer} />
            <FinancialInfo customer={customer} />
          </div>
          <div>
            <HistoryCard customer={customer} />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="activities">
        <Card className="p-6">
          <p className="text-gray-500">Aktiviteler yakında eklenecek.</p>
        </Card>
      </TabsContent>

      <TabsContent value="service-receipts">
        <Card className="p-6">
          <p className="text-gray-500">Servis fişleri yakında eklenecek.</p>
        </Card>
      </TabsContent>

      <TabsContent value="offers">
        <Card className="p-6">
          <p className="text-gray-500">Teklifler yakında eklenecek.</p>
        </Card>
      </TabsContent>

      <TabsContent value="invoices">
        <Card className="p-6">
          <p className="text-gray-500">Faturalar yakında eklenecek.</p>
        </Card>
      </TabsContent>

      <TabsContent value="transactions">
        <Card className="p-6">
          <p className="text-gray-500">Cari hareketler yakında eklenecek.</p>
        </Card>
      </TabsContent>

      <TabsContent value="contracts">
        <Card className="p-6">
          <p className="text-gray-500">Sözleşmeler yakında eklenecek.</p>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
