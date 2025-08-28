
import React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Opportunity, 
  opportunityStatusColors 
} from "@/types/crm";
import { OpportunityStatusCell } from "./table/OpportunityStatusCell";
import { useOpportunityStatusUpdate } from "./hooks/useOpportunityStatusUpdate";

interface OpportunitiesTableProps {
  opportunities: Opportunity[];
  isLoading: boolean;
  onSelectOpportunity: (opportunity: Opportunity) => void;
  searchQuery?: string;
  statusFilter?: string;
  priorityFilter?: string;
}

const OpportunitiesTable = ({
  opportunities,
  isLoading,
  onSelectOpportunity,
  searchQuery = "",
  statusFilter = "all",
  priorityFilter = null
}: OpportunitiesTableProps) => {
  const { updateOpportunityStatus } = useOpportunityStatusUpdate();

  // Metinleri kısalt
  const shortenText = (text: string, maxLength: number = 25) => {
    if (!text) return "";
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - 3) + "...";
  };

  // Firma ismini kısalt
  const getShortenedCompanyName = (companyName: string) => {
    return shortenText(companyName, 35);
  };

  // Firma şirket bilgisini kısalt
  const getShortenedCompanyInfo = (companyInfo: string) => {
    return shortenText(companyInfo, 30);
  };

  // Filter opportunities based on criteria
  const filteredOpportunities = opportunities.filter(opportunity => {
    const matchesSearch = !searchQuery || 
      opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (opportunity.description && opportunity.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (opportunity.customer?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase());
      
    const matchesStatus = statusFilter === "all" || opportunity.status === statusFilter;
    const matchesPriority = !priorityFilter || opportunity.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const formatCurrency = (amount: number, currency: string = "TRY") => {
    return new Intl.NumberFormat('tr-TR', { 
      style: 'currency', 
      currency: currency 
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200/60 overflow-hidden bg-white/80 backdrop-blur-sm">
        <Table>
          <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100/80">
            <TableRow className="border-b border-gray-200/60 hover:bg-transparent">
              <TableHead className="font-semibold text-gray-700 py-4">Başlık</TableHead>
              <TableHead className="font-semibold text-gray-700">Müşteri</TableHead>
              <TableHead className="font-semibold text-gray-700">Durum</TableHead>
              <TableHead className="font-semibold text-gray-700">Değer</TableHead>
              <TableHead className="font-semibold text-gray-700">Para Birimi</TableHead>
              <TableHead className="font-semibold text-gray-700">Öncelik</TableHead>
              <TableHead className="font-semibold text-gray-700">Sorumlu</TableHead>
              <TableHead className="font-semibold text-gray-700">Beklenen Kapanış</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index} className="border-b border-gray-100/60 hover:bg-gray-50/50 transition-colors">
                <TableCell className="py-4"><Skeleton className="h-4 w-32 bg-gray-200/60" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24 bg-gray-200/60" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20 bg-gray-200/60" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16 bg-gray-200/60" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16 bg-gray-200/60" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16 bg-gray-200/60" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24 bg-gray-200/60" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20 bg-gray-200/60" /></TableCell>
                <TableCell><Skeleton className="h-8 w-8 bg-gray-200/60" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200/60 overflow-hidden bg-white/80 backdrop-blur-sm">
      <Table>
        <TableHeader className="bg-gradient-to-r from-gray-50 to-gray-100/80">
          <TableRow className="border-b border-gray-200/60 hover:bg-transparent">
            <TableHead className="w-[18%] font-semibold text-gray-700 py-4 px-6">Başlık</TableHead>
            <TableHead className="w-[25%] font-semibold text-gray-700 px-6">Müşteri</TableHead>
            <TableHead className="w-[8%] font-semibold text-gray-700 px-6">Durum</TableHead>
            <TableHead className="w-[8%] font-semibold text-gray-700 px-6">Değer</TableHead>
            <TableHead className="w-[6%] font-semibold text-gray-700 px-6">Para Birimi</TableHead>
            <TableHead className="w-[8%] font-semibold text-gray-700 px-6">Öncelik</TableHead>
            <TableHead className="w-[12%] font-semibold text-gray-700 px-6">Sorumlu</TableHead>
            <TableHead className="w-[9%] font-semibold text-gray-700 px-6">Beklenen Kapanış</TableHead>
            <TableHead className="w-[6%] px-6"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredOpportunities.length === 0 ? (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={9} className="text-center py-12 text-gray-500">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <Eye className="h-8 w-8 text-gray-400" />
                  </div>
                  <span className="text-lg font-medium">Bu kriterlere uygun fırsat bulunamadı</span>
                  <span className="text-sm text-gray-400">Filtrelerinizi değiştirmeyi deneyin</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            filteredOpportunities.map((opportunity, index) => (
              <TableRow 
                key={opportunity.id} 
                onClick={() => onSelectOpportunity(opportunity)} 
                className="border-b border-gray-100/60 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-indigo-50/30 cursor-pointer transition-all duration-200 group"
              >
                <TableCell className="font-medium py-4 px-6 text-gray-900 group-hover:text-blue-900">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full opacity-60"></div>
                    <span className="truncate" title={opportunity.title}>
                      {shortenText(opportunity.title, 30)}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6">
                  {opportunity.customer ? (
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-gray-900 truncate" title={opportunity.customer.name}>
                        {getShortenedCompanyName(opportunity.customer.name)}
                      </span>
                      {opportunity.customer.company && (
                        <span className="text-xs text-gray-500 truncate" title={opportunity.customer.company}>
                          {getShortenedCompanyInfo(opportunity.customer.company)}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Müşteri yok</span>
                  )}
                </TableCell>
                <TableCell className="text-center px-6">
                  <OpportunityStatusCell 
                    status={opportunity.status}
                    opportunityId={opportunity.id}
                    onStatusChange={updateOpportunityStatus}
                  />
                </TableCell>
                <TableCell className="text-center px-6">
                  {opportunity.value ? (
                    <span className="font-semibold text-gray-900">
                      {formatCurrency(opportunity.value, opportunity.currency || 'TRY')}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center px-6">
                  {opportunity.currency ? (
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border-blue-200 font-medium">
                      {opportunity.currency === 'TRY' ? '₺' : 
                       opportunity.currency === 'USD' ? '$' : 
                       opportunity.currency === 'EUR' ? '€' : 
                       opportunity.currency === 'GBP' ? '£' : 
                       opportunity.currency}
                    </Badge>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center px-6">
                  <Badge 
                    variant="outline" 
                    className={
                      opportunity.priority === 'high' ? 'bg-gradient-to-r from-red-50 to-pink-50 text-red-700 border-red-200 font-medium' :
                      opportunity.priority === 'medium' ? 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-700 border-amber-200 font-medium' :
                      opportunity.priority === 'low' ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border-emerald-200 font-medium' :
                      'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-600 border-gray-200'
                    }
                  >
                    {opportunity.priority === 'high' && 'Yüksek'}
                    {opportunity.priority === 'medium' && 'Orta'}
                    {opportunity.priority === 'low' && 'Düşük'}
                    {!opportunity.priority && 'Belirtilmemiş'}
                  </Badge>
                </TableCell>
                <TableCell className="px-6">
                  {opportunity.employee ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border-2 border-white shadow-sm">
                        <AvatarFallback className="bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-semibold text-xs">
                          {opportunity.employee.first_name?.[0]}
                          {opportunity.employee.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 truncate">
                          {opportunity.employee.first_name} {opportunity.employee.last_name}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border-2 border-gray-200">
                        <AvatarFallback className="bg-gray-100 text-gray-400">
                          ?
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-400 italic">Atanmamış</span>
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-center px-6">
                  {opportunity.expected_close_date ? (
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {format(new Date(opportunity.expected_close_date), "dd MMM", { locale: tr })}
                      </span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(opportunity.expected_close_date), "yyyy", { locale: tr })}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Belirtilmemiş</span>
                  )}
                </TableCell>
                <TableCell className="px-6">
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectOpportunity(opportunity);
                      }}
                      className="h-8 w-8 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => e.stopPropagation()}
                      className="h-8 w-8 hover:bg-gray-100 hover:text-gray-700 transition-colors"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default OpportunitiesTable;
