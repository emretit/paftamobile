
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Proposal, proposalStatusColors, proposalStatusLabels } from "@/types/proposal";
import { 
  Calendar, 
  Building, 
  User, 
  CreditCard, 
  FileText, 
  Maximize2 
} from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ProposalDetailSidePanelProps {
  proposal: Proposal;
  onShowFullView: () => void;
}

const ProposalDetailSidePanel = ({ proposal, onShowFullView }: ProposalDetailSidePanelProps) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMM yyyy", { locale: tr });
    } catch (error) {
      return "-";
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: proposal.currency || "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Teklif Özeti</CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onShowFullView}
            className="flex items-center"
          >
            <Maximize2 className="h-4 w-4 mr-2" />
            Tam Görünüm
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Teklif No
            </span>
            <span className="font-medium">#{proposal.number}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center">
              <Building className="h-4 w-4 mr-2" />
              Müşteri
            </span>
            <span className="font-medium">
              {proposal.customer?.name || proposal.customer_name || "-"}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center">
              <User className="h-4 w-4 mr-2" />
              Satış Temsilcisi
            </span>
            <span className="font-medium">
              {proposal.employee 
                ? `${proposal.employee.first_name} ${proposal.employee.last_name}` 
                : proposal.employee_name || "-"}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Oluşturma Tarihi
            </span>
            <span className="font-medium">{formatDate(proposal.created_at)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Geçerlilik Tarihi
            </span>
            <span className="font-medium">{formatDate(proposal.valid_until)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center">
              <CreditCard className="h-4 w-4 mr-2" />
              Toplam Tutar
            </span>
            <span className="font-medium">
              {formatMoney(proposal.total_amount || proposal.total_value || 0)}
            </span>
          </div>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Durum</h3>
          <Badge className={`${proposalStatusColors[proposal.status]} w-full justify-center`}>
            {proposalStatusLabels[proposal.status]}
          </Badge>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Ödeme Şartları</h3>
          <p className="text-sm text-muted-foreground">
            {proposal.payment_terms || "Belirtilmemiş"}
          </p>
        </div>
        
        <div className="space-y-2">
          <h3 className="text-sm font-medium">Teslimat Şartları</h3>
          <p className="text-sm text-muted-foreground">
            {proposal.delivery_terms || "Belirtilmemiş"}
          </p>
        </div>
        
        {proposal.description && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Açıklama</h3>
            <p className="text-sm text-muted-foreground">
              {proposal.description}
            </p>
          </div>
        )}
        
        {proposal.notes && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Notlar</h3>
            <p className="text-sm text-muted-foreground">
              {proposal.notes}
            </p>
          </div>
        )}
        
        <Separator />
        
        <div className="pt-2 flex space-x-2">
          <Button className="w-full">Düzenle</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProposalDetailSidePanel;
