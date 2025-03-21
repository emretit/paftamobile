
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Proposal, proposalStatusColors, proposalStatusLabels } from "@/types/proposal";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface ProposalDetailFullViewProps {
  proposal: Proposal;
}

const ProposalDetailFullView = ({ proposal }: ProposalDetailFullViewProps) => {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: tr });
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
        <CardTitle>Teklif Detayları</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="items">
          <TabsList className="mb-4">
            <TabsTrigger value="items">Teklif Kalemleri</TabsTrigger>
            <TabsTrigger value="details">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="history">Tarihçe</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <div className="bg-muted/40 p-3 rounded-md">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Ürün/Hizmet</th>
                    <th className="text-right py-2">Miktar</th>
                    <th className="text-right py-2">Birim Fiyat</th>
                    <th className="text-right py-2">KDV</th>
                    <th className="text-right py-2">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {proposal.items && proposal.items.length > 0 ? (
                    proposal.items.map((item, index) => (
                      <tr key={item.id || index} className="border-b border-border/50">
                        <td className="py-2">
                          <div>
                            <div className="font-medium">{item.name}</div>
                            {item.description && (
                              <div className="text-xs text-muted-foreground">{item.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="text-right py-2">{item.quantity}</td>
                        <td className="text-right py-2">
                          {formatMoney(item.unit_price)}
                        </td>
                        <td className="text-right py-2">%{item.tax_rate || 0}</td>
                        <td className="text-right py-2">
                          {formatMoney(item.total_price)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="text-center py-4 text-gray-500">
                        Bu teklifte henüz kalem bulunmuyor
                      </td>
                    </tr>
                  )}
                </tbody>
                {proposal.items && proposal.items.length > 0 && (
                  <tfoot>
                    <tr className="border-t border-border">
                      <td colSpan={4} className="text-right py-2 font-medium">
                        Toplam:
                      </td>
                      <td className="text-right py-2 font-medium">
                        {formatMoney(proposal.total_amount || proposal.total_value || 0)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Müşteri Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {proposal.customer ? (
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {proposal.customer.name?.substring(0, 1) || 'C'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{proposal.customer.name}</div>
                        {proposal.customer.company && (
                          <div className="text-sm text-muted-foreground">{proposal.customer.company}</div>
                        )}
                        {proposal.customer.email && (
                          <div className="text-sm text-muted-foreground">{proposal.customer.email}</div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      {proposal.customer_name || "Müşteri bilgisi bulunmuyor"}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Teklif Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Teklif No:</span>
                    <span className="font-medium">#{proposal.number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Oluşturma Tarihi:</span>
                    <span className="font-medium">{formatDate(proposal.created_at)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Geçerlilik Tarihi:</span>
                    <span className="font-medium">{formatDate(proposal.valid_until)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Durum:</span>
                    <Badge className={proposalStatusColors[proposal.status]}>
                      {proposalStatusLabels[proposal.status]}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Toplam Tutar:</span>
                    <span className="font-medium">
                      {formatMoney(proposal.total_amount || proposal.total_value || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Teklif Özellikleri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">Ödeme Şartları</h3>
                    <p className="text-sm text-muted-foreground">
                      {proposal.payment_terms || "Belirtilmemiş"}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">Teslimat Şartları</h3>
                    <p className="text-sm text-muted-foreground">
                      {proposal.delivery_terms || "Belirtilmemiş"}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Açıklama</h3>
                  <p className="text-sm text-muted-foreground">
                    {proposal.description || "Açıklama bulunmuyor"}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Notlar</h3>
                  <p className="text-sm text-muted-foreground">
                    {proposal.notes || "Not bulunmuyor"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Satış Temsilcisi</CardTitle>
              </CardHeader>
              <CardContent>
                {proposal.employee ? (
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>
                        {proposal.employee.first_name?.[0]}
                        {proposal.employee.last_name?.[0]}
                      </AvatarFallback>
                      {proposal.employee.avatar_url && (
                        <AvatarImage src={proposal.employee.avatar_url} />
                      )}
                    </Avatar>
                    <div>
                      <div className="font-medium">
                        {proposal.employee.first_name} {proposal.employee.last_name}
                      </div>
                      {proposal.employee.email && (
                        <div className="text-sm text-muted-foreground">{proposal.employee.email}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">
                    {proposal.employee_name || "Temsilci bilgisi bulunmuyor"}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12 text-muted-foreground">
                  Bu teklif için tarihçe bilgisi henüz bulunmamaktadır.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ProposalDetailFullView;
