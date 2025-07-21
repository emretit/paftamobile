
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Plus, FileDown } from "lucide-react";
import InvoiceManagementTab from "@/components/purchase/invoices/InvoiceManagementTab";

interface PurchaseInvoicesProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const PurchaseInvoices = ({ isCollapsed, setIsCollapsed }: PurchaseInvoicesProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex relative">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <div className="p-6 lg:p-8 max-w-[1600px] mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                Alış Faturaları
              </h1>
              <p className="text-gray-600">
                Alış faturalarının yönetimi
              </p>
            </div>
            <Button className="flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-primary to-primary/90">
              <Plus className="h-4 w-4" />
              <span>Yeni Fatura</span>
            </Button>
          </div>

          <InvoiceManagementTab />
        </div>
      </main>
    </div>
  );
};

export default PurchaseInvoices;
