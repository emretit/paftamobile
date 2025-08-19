
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
  // Metinleri kısalt
  const shortenText = (text: string, maxLength: number = 25) => {
    if (!text) return "";
    
    if (text.length <= maxLength) return text;
    
    return text.substring(0, maxLength - 3) + "...";
  };

  // Firma ismini kısalt
  const getShortenedCompanyName = (companyName: string) => {
    return shortenText(companyName, 20);
  };

  // Firma şirket bilgisini kısalt
  const getShortenedCompanyInfo = (companyInfo: string) => {
    return shortenText(companyInfo, 18);
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
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Başlık</TableHead>
            <TableHead>Müşteri</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Değer</TableHead>
            <TableHead>Öncelik</TableHead>
            <TableHead>Sorumlu</TableHead>
            <TableHead>Beklenen Kapanış</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 5 }).map((_, index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-20" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8" /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Başlık</TableHead>
          <TableHead>Müşteri</TableHead>
          <TableHead>Durum</TableHead>
          <TableHead>Değer</TableHead>
          <TableHead>Öncelik</TableHead>
          <TableHead>Sorumlu</TableHead>
          <TableHead>Beklenen Kapanış</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredOpportunities.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-gray-500">
              Bu kriterlere uygun fırsat bulunamadı
            </TableCell>
          </TableRow>
        ) : (
          filteredOpportunities.map((opportunity) => (
            <TableRow key={opportunity.id} onClick={() => onSelectOpportunity(opportunity)} className="cursor-pointer hover:bg-gray-50">
              <TableCell className="font-medium">{shortenText(opportunity.title, 30)}</TableCell>
              <TableCell>
                {opportunity.customer ? (
                  <div className="flex flex-col">
                    <span title={opportunity.customer.name}>
                      {getShortenedCompanyName(opportunity.customer.name)}
                    </span>
                    {opportunity.customer.company && (
                      <span className="text-xs text-gray-500" title={opportunity.customer.company}>
                        {getShortenedCompanyInfo(opportunity.customer.company)}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={`${opportunityStatusColors[opportunity.status] || 'bg-gray-100 text-gray-800'}`}
                >
                  {opportunity.status === 'new' && 'Yeni'}
                  {opportunity.status === 'first_contact' && 'İlk Görüşme'}
                  {opportunity.status === 'site_visit' && 'Ziyaret Yapıldı'}
                  {opportunity.status === 'preparing_proposal' && 'Teklif Hazırlanıyor'}
                  {opportunity.status === 'proposal_sent' && 'Teklif Gönderildi'}
                  {opportunity.status === 'accepted' && 'Kabul Edildi'}
                  {opportunity.status === 'lost' && 'Kaybedildi'}
                </Badge>
              </TableCell>
              <TableCell>
                {opportunity.value ? formatCurrency(opportunity.value, opportunity.currency || 'TRY') : '-'}
              </TableCell>
              <TableCell>
                <Badge 
                  variant="outline" 
                  className={
                    opportunity.priority === 'high' ? 'bg-red-100 text-red-800' :
                    opportunity.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    opportunity.priority === 'low' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }
                >
                  {opportunity.priority === 'high' && 'Yüksek'}
                  {opportunity.priority === 'medium' && 'Orta'}
                  {opportunity.priority === 'low' && 'Düşük'}
                  {!opportunity.priority && '-'}
                </Badge>
              </TableCell>
              <TableCell>
                {opportunity.employee ? (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {opportunity.employee.first_name?.[0]}
                        {opportunity.employee.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">
                      {opportunity.employee.first_name} {opportunity.employee.last_name}
                    </span>
                  </div>
                ) : (
                  <span className="text-muted-foreground text-sm">Atanmamış</span>
                )}
              </TableCell>
              <TableCell>
                {opportunity.expected_close_date ? (
                  format(new Date(opportunity.expected_close_date), "dd MMM yyyy", { locale: tr })
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectOpportunity(opportunity);
                    }}
                    className="h-8 w-8"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={(e) => e.stopPropagation()}
                    className="h-8 w-8"
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
  );
};

export default OpportunitiesTable;
