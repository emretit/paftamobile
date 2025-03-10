
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
      <CustomTabsList className="grid grid-cols-7 w-full bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 p-1 shadow-sm">
        <CustomTabsTrigger value="overview" className="flex items-center justify-center space-x-2 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">Genel Bilgiler</CustomTabsTrigger>
        <CustomTabsTrigger value="payments" className="flex items-center justify-center gap-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
          <CreditCard className="h-4 w-4" />
          <span className="hidden md:inline">Cari Hareketler</span>
        </CustomTabsTrigger>
        <CustomTabsTrigger value="activities" className="flex items-center justify-center gap-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
          <Activity className="h-4 w-4" />
          <span className="hidden md:inline">Aktiviteler</span>
        </CustomTabsTrigger>
        <CustomTabsTrigger value="service-receipts" className="flex items-center justify-center gap-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
          <Receipt className="h-4 w-4" />
          <span className="hidden md:inline">Servis Fişleri</span>
        </CustomTabsTrigger>
        <CustomTabsTrigger value="offers" className="flex items-center justify-center gap-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
          <FileText className="h-4 w-4" />
          <span className="hidden md:inline">Teklifler</span>
        </CustomTabsTrigger>
        <CustomTabsTrigger value="invoices" className="flex items-center justify-center gap-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
          <Receipt className="h-4 w-4" />
          <span className="hidden md:inline">Faturalar</span>
        </CustomTabsTrigger>
        <CustomTabsTrigger value="contracts" className="flex items-center justify-center gap-1 rounded-lg data-[state=active]:bg-primary data-[state=active]:text-white transition-all duration-200">
          <FileStack className="h-4 w-4" />
          <span className="hidden md:inline">Sözleşmeler</span>
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
