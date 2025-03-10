import { Activity, Receipt, FileText, CreditCard, FileStack } from "lucide-react";
import { Card } from "@/components/ui/card";
import { 
  CustomTabs, 
  CustomTabsContent, 
  CustomTabsList, 
  CustomTabsTrigger 
} from "@/components/ui/custom-tabs";
import { ContactInfo } from "./ContactInfo";
import { FinancialInfo } from "./FinancialInfo";
import { HistoryCard } from "./HistoryCard";
import { PaymentsTab } from "./PaymentsTab";
import { Customer } from "@/types/customer";

interface ContactTabsProps {
  customer: Customer;
}

export const ContactTabs = ({ customer }: ContactTabsProps) => {
  return (
    <CustomTabs defaultValue="overview" className="space-y-4">
      <CustomTabsList className="bg-white border w-full">
        <CustomTabsTrigger value="overview">Genel Bilgiler</CustomTabsTrigger>
        <CustomTabsTrigger value="payments" className="flex items-center gap-1">
          <CreditCard className="h-4 w-4" />
          Cari Hareketler
        </CustomTabsTrigger>
        <CustomTabsTrigger value="activities" className="flex items-center gap-1">
          <Activity className="h-4 w-4" />
          Aktiviteler
        </CustomTabsTrigger>
        <CustomTabsTrigger value="service-receipts" className="flex items-center gap-1">
          <Receipt className="h-4 w-4" />
          Servis Fişleri
        </CustomTabsTrigger>
        <CustomTabsTrigger value="offers" className="flex items-center gap-1">
          <FileText className="h-4 w-4" />
          Teklifler
        </CustomTabsTrigger>
        <CustomTabsTrigger value="invoices" className="flex items-center gap-1">
          <Receipt className="h-4 w-4" />
          Faturalar
        </CustomTabsTrigger>
        <CustomTabsTrigger value="contracts" className="flex items-center gap-1">
          <FileStack className="h-4 w-4" />
          Sözleşmeler
        </CustomTabsTrigger>
      </CustomTabsList>

      <CustomTabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ContactInfo customer={customer} />
            <FinancialInfo customer={customer} />
          </div>
          <div>
            <HistoryCard customer={customer} />
          </div>
        </div>
      </CustomTabsContent>

      <CustomTabsContent value="payments">
        <PaymentsTab customer={customer} />
      </CustomTabsContent>

      <CustomTabsContent value="activities">
        <Card className="p-6">
          <p className="text-gray-500">Aktiviteler yakında eklenecek.</p>
        </Card>
      </CustomTabsContent>

      <CustomTabsContent value="service-receipts">
        <Card className="p-6">
          <p className="text-gray-500">Servis fişleri yakında eklenecek.</p>
        </Card>
      </CustomTabsContent>

      <CustomTabsContent value="offers">
        <Card className="p-6">
          <p className="text-gray-500">Teklifler yakında eklenecek.</p>
        </Card>
      </CustomTabsContent>

      <CustomTabsContent value="invoices">
        <Card className="p-6">
          <p className="text-gray-500">Faturalar yakında eklenecek.</p>
        </Card>
      </CustomTabsContent>

      <CustomTabsContent value="contracts">
        <Card className="p-6">
          <p className="text-gray-500">Sözleşmeler yakında eklenecek.</p>
        </Card>
      </CustomTabsContent>
    </CustomTabs>
  );
};
