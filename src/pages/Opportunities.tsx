
import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { TopBar } from "@/components/TopBar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useOpportunities } from "@/hooks/useOpportunities";
import OpportunitiesKanban from "@/components/opportunities/OpportunitiesKanban";
import OpportunityFilterBar from "@/components/opportunities/OpportunityFilterBar";
import { supabase } from "@/integrations/supabase/client";

interface OpportunitiesPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Opportunities = ({ isCollapsed, setIsCollapsed }: OpportunitiesPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [employees, setEmployees] = useState<{id: string; name: string}[]>([]);
  const [customers, setCustomers] = useState<{id: string; name: string}[]>([]);
  
  const {
    opportunities,
    isLoading,
    error,
    selectedOpportunity,
    setSelectedOpportunity,
    isDetailOpen,
    setIsDetailOpen,
    selectedItems,
    setSelectedItems,
    handleDragEnd,
    handleCreateOpportunity,
    handleUpdateOpportunity,
    handleDeleteOpportunity
  } = useOpportunities(searchQuery, selectedEmployee, selectedCustomer);

  // Fetch employees and customers for filters
  useEffect(() => {
    const fetchEmployees = async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("id, first_name, last_name");
      
      if (!error && data) {
        setEmployees(
          data.map(emp => ({
            id: emp.id,
            name: `${emp.first_name} ${emp.last_name}`
          }))
        );
      }
    };

    const fetchCustomers = async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("id, name");
      
      if (!error && data) {
        setCustomers(
          data.map(customer => ({
            id: customer.id,
            name: customer.name
          }))
        );
      }
    };

    fetchEmployees();
    fetchCustomers();
  }, []);

  const handleOpportunityClick = (opportunity: any) => {
    setSelectedOpportunity(opportunity);
    setIsDetailOpen(true);
  };

  const handleOpportunitySelect = (opportunity: any) => {
    setSelectedItems(prev => {
      if (prev.some(o => o.id === opportunity.id)) {
        return prev.filter(o => o.id !== opportunity.id);
      }
      return [...prev, opportunity];
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"
        }`}
      >
        <TopBar />
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Fırsatlar</h1>
              <p className="text-gray-600">
                Tüm satış fırsatlarını yönetin ve takip edin
              </p>
            </div>
            
            <Button 
              onClick={() => {
                // Add new opportunity functionality here
              }}
              className="bg-red-800 hover:bg-red-900 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Fırsat
            </Button>
          </div>
          
          <OpportunityFilterBar
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedEmployee={selectedEmployee}
            setSelectedEmployee={setSelectedEmployee}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            employees={employees}
            customers={customers}
          />
          
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <p>Yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
              <p>Fırsatlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.</p>
            </div>
          ) : (
            <OpportunitiesKanban
              opportunities={opportunities}
              onDragEnd={handleDragEnd}
              onOpportunityClick={handleOpportunityClick}
              onOpportunitySelect={handleOpportunitySelect}
              selectedOpportunities={selectedItems}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Opportunities;
