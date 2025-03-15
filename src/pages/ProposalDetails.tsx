
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useProposalForm } from "@/hooks/useProposalForm";
import { useProposalFormState } from "@/hooks/useProposalFormState";
import { ArrowLeft, Save, Send, Printer, Download, Trash2 } from "lucide-react";
import ProposalFormContent from "@/components/proposals/form/ProposalFormContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProposalItemsTab } from "@/components/proposals/detail/ProposalItemsTab";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";

interface ProposalDetailsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ProposalDetails = ({ isCollapsed, setIsCollapsed }: ProposalDetailsProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { proposalQuery } = useProposalForm();
  const [activeTab, setActiveTab] = useState("details");

  // Initialize proposal form state with the proposal ID
  const {
    methods,
    isLoading,
    partnerType,
    setPartnerType,
    items,
    setItems,
    files,
    setFiles,
    totalValues,
    handleBack,
    handleSaveDraft,
    handleSubmit
  } = useProposalFormState();

  // Fetch the proposal data
  const { data: proposal, isLoading: isLoadingProposal } = proposalQuery(id || "");

  const handleDelete = async () => {
    if (!id) return;
    
    if (window.confirm("Bu teklifi silmek istediğinizden emin misiniz?")) {
      try {
        // Call the delete function from your hook
        // Implement the delete functionality in your hook if not already present
        // await deleteProposal(id);
        toast({
          title: "Teklif silindi",
          description: "Teklif başarıyla silindi."
        });
        navigate("/proposals");
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Hata",
          description: "Teklif silinirken bir hata oluştu."
        });
      }
    }
  };

  if (isLoadingProposal) {
    return (
      <div className="min-h-screen bg-gray-50 flex">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"}`}>
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Teklif Yükleniyor...</h1>
            </div>
            <div className="animate-pulse space-y-4">
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? "ml-[60px]" : "ml-[60px] sm:ml-64"}`}>
        <div className="p-4 md:p-6">
          {/* Header with back button and actions */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center">
              <Button variant="outline" size="icon" onClick={() => navigate("/proposals")} className="mr-4">
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{proposal?.title || "Teklif Detayı"}</h1>
                <p className="text-muted-foreground">Teklif No: #{proposal?.proposal_number}</p>
              </div>
            </div>
            
            <div className="flex mt-4 sm:mt-0 space-x-2">
              <Button variant="outline" size="sm" onClick={() => window.print()}>
                <Printer className="h-4 w-4 mr-2" />
                Yazdır
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 mr-2" />
                Sil
              </Button>
              <Button variant="default" size="sm" onClick={methods.handleSubmit(handleSubmit)}>
                <Send className="h-4 w-4 mr-2" />
                Güncelle
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Teklif Detayları</TabsTrigger>
              <TabsTrigger value="items">Ürünler/Hizmetler</TabsTrigger>
              <TabsTrigger value="preview">Önizleme</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <ProposalFormContent
                    methods={methods}
                    partnerType={partnerType}
                    setPartnerType={setPartnerType}
                    items={items}
                    setItems={setItems}
                    files={files}
                    setFiles={setFiles}
                    totalValues={totalValues}
                    onSaveDraft={handleSaveDraft}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="items" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  {proposal && <ProposalItemsTab proposal={proposal} />}
                  
                  <Separator className="my-6" />
                  
                  <div className="flex justify-end">
                    <Button variant="outline" className="mr-2" onClick={() => setActiveTab("details")}>
                      Geri
                    </Button>
                    <Button onClick={() => setActiveTab("preview")}>
                      Önizleme
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <Card>
                <CardContent className="p-6">
                  <div className="bg-white p-8 border rounded-lg shadow-sm">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <h2 className="text-2xl font-bold">{proposal?.title}</h2>
                        <p className="text-muted-foreground">Teklif No: #{proposal?.proposal_number}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Toplam Değer:</p>
                        <p className="text-xl font-bold">
                          {new Intl.NumberFormat('tr-TR', {
                            style: 'currency',
                            currency: 'TRY'
                          }).format(proposal?.total_value || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
                        <p>{proposal?.customer?.name || "Müşteri bilgisi bulunamadı"}</p>
                      </div>
                      <div>
                        <h3 className="font-medium mb-2">Teklif Bilgileri</h3>
                        <p>Oluşturma Tarihi: {new Date(proposal?.created_at || "").toLocaleDateString('tr-TR')}</p>
                        <p>Geçerlilik: {proposal?.valid_until ? new Date(proposal.valid_until).toLocaleDateString('tr-TR') : "Belirtilmemiş"}</p>
                        <p>Durumu: {proposal?.status}</p>
                      </div>
                    </div>

                    {proposal && proposal.items && proposal.items.length > 0 && (
                      <div className="mb-8">
                        <h3 className="font-medium mb-4">Ürünler / Hizmetler</h3>
                        <div className="rounded-md border overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ürün/Hizmet</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Miktar</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Birim Fiyat</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">KDV %</th>
                                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Toplam</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {proposal.items.map((item: any, index: number) => (
                                <tr key={item.id || index}>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">{item.name}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{item.quantity}</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">
                                    {new Intl.NumberFormat('tr-TR', {
                                      style: 'currency',
                                      currency: 'TRY'
                                    }).format(item.unit_price || 0)}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{item.tax_rate}%</td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-medium">
                                    {new Intl.NumberFormat('tr-TR', {
                                      style: 'currency',
                                      currency: 'TRY'
                                    }).format(item.total_price || 0)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end">
                      <div className="w-64">
                        <div className="flex justify-between py-2">
                          <span>Ara Toplam:</span>
                          <span>
                            {new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: 'TRY'
                            }).format(totalValues.subtotal)}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span>KDV:</span>
                          <span>
                            {new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: 'TRY'
                            }).format(totalValues.taxAmount)}
                          </span>
                        </div>
                        {totalValues.discounts > 0 && (
                          <div className="flex justify-between py-2">
                            <span>İndirimler:</span>
                            <span className="text-green-600">
                              -{new Intl.NumberFormat('tr-TR', {
                                style: 'currency',
                                currency: 'TRY'
                              }).format(totalValues.discounts)}
                            </span>
                          </div>
                        )}
                        {totalValues.additionalCharges > 0 && (
                          <div className="flex justify-between py-2">
                            <span>Ek Ücretler:</span>
                            <span>
                              {new Intl.NumberFormat('tr-TR', {
                                style: 'currency',
                                currency: 'TRY'
                              }).format(totalValues.additionalCharges)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between py-2 font-bold border-t mt-2 pt-2">
                          <span>Genel Toplam:</span>
                          <span>
                            {new Intl.NumberFormat('tr-TR', {
                              style: 'currency',
                              currency: 'TRY'
                            }).format(totalValues.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button variant="outline" className="mr-2" onClick={() => setActiveTab("items")}>
                      Geri
                    </Button>
                    <Button variant="default" onClick={methods.handleSubmit(handleSubmit)}>
                      <Save className="h-4 w-4 mr-2" />
                      Kaydet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default ProposalDetails;
