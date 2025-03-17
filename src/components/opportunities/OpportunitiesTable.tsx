
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
          {[1, 2, 3, 4, 5].map((index) => (
            <TableRow key={index}>
              <TableCell><Skeleton className="h-4 w-48" /></TableCell>
              <TableCell><Skeleton className="h-4 w-32" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-8 w-8 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-4 w-24" /></TableCell>
              <TableCell><Skeleton className="h-4 w-4" /></TableCell>
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
              <TableCell className="font-medium">{opportunity.title}</TableCell>
              <TableCell>
                {opportunity.customer ? (
                  <div className="flex flex-col">
                    <span>{opportunity.customer.name}</span>
                    {opportunity.customer.company && (
                      <span className="text-xs text-gray-500">{opportunity.customer.company}</span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell>
                <Badge className={opportunityStatusColors[opportunity.status]}>
                  {opportunity.status === 'new' ? 'Yeni' : 
                   opportunity.status === 'first_contact' ? 'İlk Görüşme' : 
                   opportunity.status === 'site_visit' ? 'Ziyaret Yapıldı' : 
                   opportunity.status === 'preparing_proposal' ? 'Teklif Hazırlanıyor' : 
                   opportunity.status === 'proposal_sent' ? 'Teklif Gönderildi' : 
                   opportunity.status === 'accepted' ? 'Kabul Edildi' : 
                   opportunity.status === 'lost' ? 'Kaybedildi' : opportunity.status}
                </Badge>
              </TableCell>
              <TableCell>{formatCurrency(opportunity.value)}</TableCell>
              <TableCell>
                <Badge variant="outline" className={
                  opportunity.priority === 'high' ? 'border-red-500 text-red-500' : 
                  opportunity.priority === 'medium' ? 'border-yellow-500 text-yellow-500' : 
                  'border-green-500 text-green-500'
                }>
                  {opportunity.priority === 'high' ? 'Yüksek' : 
                   opportunity.priority === 'medium' ? 'Orta' : 'Düşük'}
                </Badge>
              </TableCell>
              <TableCell>
                {opportunity.employee ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      {opportunity.employee.avatar_url && (
                        <AvatarImage src={opportunity.employee.avatar_url} alt={`${opportunity.employee.first_name} ${opportunity.employee.last_name}`} />
                      )}
                      <AvatarFallback>
                        {opportunity.employee.first_name?.[0]}
                        {opportunity.employee.last_name?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">
                      {opportunity.employee.first_name} {opportunity.employee.last_name}
                    </span>
                  </div>
                ) : (
                  <span className="text-gray-500">-</span>
                )}
              </TableCell>
              <TableCell>
                {opportunity.expected_close_date ? 
                  format(new Date(opportunity.expected_close_date), "dd MMM yyyy", { locale: tr }) : 
                  <span className="text-gray-500">-</span>
                }
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
