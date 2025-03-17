
import { useState } from "react";
import DefaultLayout from "@/components/layouts/DefaultLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter, Users } from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { useOpportunities } from "@/hooks/useOpportunities";
import OpportunitiesKanban from "@/components/opportunities/OpportunitiesKanban";
import OpportunityDetailSheet from "@/components/opportunities/OpportunityDetailSheet";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { opportunityPriorityLabels, opportunityStatusColors, opportunityStatusLabels } from "@/types/crm";
import { format } from "date-fns";

interface OpportunitiesPageProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const Opportunities = ({ isCollapsed, setIsCollapsed }: OpportunitiesPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "table">("kanban");

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
    handleCreateOpportunity
  } = useOpportunities(searchQuery, selectedEmployee, selectedCustomer);

  // Handle clicking on an opportunity
  const handleOpportunityClick = (opportunity: any) => {
    setSelectedOpportunity(opportunity);
    setIsDetailOpen(true);
  };

  return (
    <DefaultLayout isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed}>
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Fırsatlar</h1>
            <p className="text-gray-600">Tüm satış fırsatlarını yönetin ve takip edin</p>
          </div>
          <div className="flex space-x-2 mt-4 md:mt-0">
            <Button
              variant="default"
              className="bg-red-800 hover:bg-red-900 text-white"
              onClick={() => handleCreateOpportunity()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Yeni Fırsat
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Fırsat ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-300 w-full"
              />
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <Select value={selectedEmployee || ""} onValueChange={value => setSelectedEmployee(value || null)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sorumlu Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm Sorumlular</SelectItem>
                  {/* Would be populated from employees data */}
                  <SelectItem value="1">Ahmet Yılmaz</SelectItem>
                  <SelectItem value="2">Ayşe Kaya</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedCustomer || ""} onValueChange={value => setSelectedCustomer(value || null)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Müşteri Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Tüm Müşteriler</SelectItem>
                  {/* Would be populated from customers data */}
                  <SelectItem value="1">ABC Şirketi</SelectItem>
                  <SelectItem value="2">XYZ Ltd.</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="outline" size="sm" className="shrink-0">
                <Filter className="mr-2 h-4 w-4" />
                Filtrele
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="kanban" className="space-y-4" value={viewMode} onValueChange={(value) => setViewMode(value as "kanban" | "table")}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="kanban">Kanban Görünümü</TabsTrigger>
              <TabsTrigger value="table">Tablo Görünümü</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="kanban" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10">Fırsatlar yükleniyor...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-600">Bir hata oluştu.</div>
            ) : (
              <div className="pb-10 overflow-x-auto">
                <OpportunitiesKanban
                  opportunities={opportunities}
                  onDragEnd={handleDragEnd}
                  onOpportunityClick={handleOpportunityClick}
                  onOpportunitySelect={setSelectedItems}
                  selectedOpportunities={selectedItems}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="table" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-10">Fırsatlar yükleniyor...</div>
            ) : error ? (
              <div className="text-center py-10 text-red-600">Bir hata oluştu.</div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Başlık</TableHead>
                      <TableHead>Müşteri</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Öncelik</TableHead>
                      <TableHead>Değer</TableHead>
                      <TableHead>Sorumlu</TableHead>
                      <TableHead>Tahmini Kapanış</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.values(opportunities).flat().map((opportunity) => (
                      <TableRow 
                        key={opportunity.id} 
                        className="cursor-pointer hover:bg-gray-50"
                        onClick={() => handleOpportunityClick(opportunity)}
                      >
                        <TableCell className="font-medium">{opportunity.title}</TableCell>
                        <TableCell>{opportunity.customer?.name || "-"}</TableCell>
                        <TableCell>
                          <Badge className={opportunityStatusColors[opportunity.status]}>
                            {opportunityStatusLabels[opportunity.status]}
                          </Badge>
                        </TableCell>
                        <TableCell>{opportunityPriorityLabels[opportunity.priority]}</TableCell>
                        <TableCell>
                          {new Intl.NumberFormat('tr-TR', { 
                            style: 'currency', 
                            currency: 'TRY' 
                          }).format(opportunity.value)}
                        </TableCell>
                        <TableCell>
                          {opportunity.employee ? 
                            `${opportunity.employee.first_name} ${opportunity.employee.last_name}` : 
                            "-"}
                        </TableCell>
                        <TableCell>
                          {opportunity.expected_close_date ? 
                            format(new Date(opportunity.expected_close_date), 'dd MMM yyyy') : 
                            "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {Object.values(opportunities).flat().length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                          Fırsat bulunamadı
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      <OpportunityDetailSheet
        opportunity={selectedOpportunity}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </DefaultLayout>
  );
};

export default Opportunities;
