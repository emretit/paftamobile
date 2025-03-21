
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Proposal, proposalStatusColors, proposalStatusLabels } from "@/types/proposal";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { ProposalItemsTab } from "./ProposalItemsTab";
import ProposalAttachments from "@/components/proposals/form/ProposalAttachments";

interface ProposalDetailFullViewProps {
  proposal: Proposal;
  isEditMode?: boolean;
}

const ProposalDetailFullView = ({ proposal, isEditMode = false }: ProposalDetailFullViewProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [activeTab, setActiveTab] = useState('items');
  
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    try {
      return format(new Date(dateString), "dd MMMM yyyy", { locale: tr });
    } catch (error) {
      return "-";
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: proposal.currency || 'TRY',
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
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="items">Teklif Kalemleri</TabsTrigger>
            <TabsTrigger value="details">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="attachments">Ekler</TabsTrigger>
            <TabsTrigger value="history">Tarihçe</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <ProposalItemsTab proposal={proposal} />
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
                      <div className="space-y-1 w-full">
                        {isEditMode ? (
                          <Input 
                            defaultValue={proposal.customer.name || ''} 
                            className="font-medium"
                            placeholder="Müşteri Adı"
                          />
                        ) : (
                          <div className="font-medium">{proposal.customer.name}</div>
                        )}
                        {isEditMode ? (
                          <Input 
                            defaultValue={proposal.customer.company || ''} 
                            className="text-sm"
                            placeholder="Şirket Adı"
                          />
                        ) : (
                          proposal.customer.company && (
                            <div className="text-sm text-muted-foreground">{proposal.customer.company}</div>
                          )
                        )}
                        {isEditMode ? (
                          <Input 
                            defaultValue={proposal.customer.email || ''} 
                            className="text-sm"
                            placeholder="E-posta"
                            type="email"
                          />
                        ) : (
                          proposal.customer.email && (
                            <div className="text-sm text-muted-foreground">{proposal.customer.email}</div>
                          )
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-muted-foreground">
                      {isEditMode ? (
                        <div className="space-y-2 w-full">
                          <Input placeholder="Müşteri Adı" />
                          <Input placeholder="Şirket Adı" />
                          <Input placeholder="E-posta" type="email" />
                          <Input placeholder="Telefon" />
                        </div>
                      ) : (
                        proposal.customer_name || "Müşteri bilgisi bulunmuyor"
                      )}
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
                    {isEditMode ? (
                      <Input 
                        type="date" 
                        defaultValue={proposal.valid_until ? new Date(proposal.valid_until).toISOString().split('T')[0] : ''} 
                        className="w-40 text-right"
                      />
                    ) : (
                      <span className="font-medium">{formatDate(proposal.valid_until)}</span>
                    )}
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
                    {isEditMode ? (
                      <Textarea 
                        defaultValue={proposal.payment_terms || ""} 
                        placeholder="Ödeme şartlarını belirtin"
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {proposal.payment_terms || "Belirtilmemiş"}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm">Teslimat Şartları</h3>
                    {isEditMode ? (
                      <Textarea 
                        defaultValue={proposal.delivery_terms || ""} 
                        placeholder="Teslimat şartlarını belirtin"
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {proposal.delivery_terms || "Belirtilmemiş"}
                      </p>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Açıklama</h3>
                  {isEditMode ? (
                    <Textarea 
                      defaultValue={proposal.description || ""} 
                      placeholder="Teklif açıklaması"
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {proposal.description || "Açıklama bulunmuyor"}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Notlar</h3>
                  {isEditMode ? (
                    <Textarea 
                      defaultValue={proposal.notes || ""} 
                      placeholder="Ekstra notlar"
                      className="min-h-[100px]"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {proposal.notes || "Not bulunmuyor"}
                    </p>
                  )}
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

          <TabsContent value="attachments" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <ProposalAttachments files={files} setFiles={setFiles} />
                
                {isEditMode && (
                  <div className="mt-4 flex justify-end">
                    <Button type="button">
                      Dosyaları Kaydet
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {proposal.status !== 'draft' ? (
                    <div className="relative pl-6 pb-6 border-l-2 border-gray-200">
                      <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-green-500 border-2 border-white"></div>
                      <div className="mb-1 text-sm">
                        <span className="font-semibold">Durum Değişikliği</span> • 
                        <span className="text-muted-foreground"> {formatDate(proposal.updated_at || proposal.created_at)}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Teklif durumu <Badge className={proposalStatusColors[proposal.status]}>{proposalStatusLabels[proposal.status]}</Badge> olarak güncellendi.
                      </div>
                    </div>
                  ) : null}
                  
                  <div className="relative pl-6 border-l-2 border-gray-200">
                    <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-blue-500 border-2 border-white"></div>
                    <div className="mb-1 text-sm">
                      <span className="font-semibold">Teklif Oluşturuldu</span> • 
                      <span className="text-muted-foreground"> {formatDate(proposal.created_at)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Teklif {proposal.employee ? `${proposal.employee.first_name} ${proposal.employee.last_name}` : 'bir kullanıcı'} tarafından oluşturuldu.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {isEditMode && activeTab !== 'attachments' && (
          <div className="mt-6 flex justify-end">
            <Button>Değişiklikleri Kaydet</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProposalDetailFullView;
