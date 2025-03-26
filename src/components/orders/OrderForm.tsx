
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import OrderItems from "./OrderItems";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Proposal, ProposalStatus } from "@/types/proposal";
import { Loader2, Save, FileDown, FileText } from "lucide-react";
import { parseProposalData } from "@/services/proposal/helpers/dataParser";

interface OrderFormProps {
  proposalId?: string;
}

const OrderForm: React.FC<OrderFormProps> = ({ proposalId }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("order-details");
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [orderData, setOrderData] = useState({
    order_number: "",
    customer_id: "",
    customer_name: "",
    customer_email: "",
    customer_address: "",
    status: "pending",
    order_date: new Date().toISOString().split('T')[0],
    delivery_date: "",
    payment_method: "bank_transfer",
    payment_status: "pending",
    shipping_method: "standard",
    discount: 0,
    tax_rate: 18,
    subtotal: 0,
    total: 0,
    currency: "TRY",
    notes: "",
    items: [] as any[]
  });

  useEffect(() => {
    if (proposalId) {
      loadProposal(proposalId);
    }
  }, [proposalId]);

  const loadProposal = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("proposals")
        .select("*, customer:customer_id(*)")
        .eq("id", id)
        .single();

      if (error) throw error;

      // Parse the proposal data
      const parsedProposal = parseProposalData(data);
      
      if (parsedProposal) {
        // Ensure the status is of type ProposalStatus
        const typedProposal: Proposal = {
          ...parsedProposal,
          status: parsedProposal.status as ProposalStatus
        };
        
        setProposal(typedProposal);
        
        // Pre-populate order data from proposal
        setOrderData({
          ...orderData,
          customer_id: typedProposal.customer_id || "",
          customer_name: typedProposal.customer?.name || "",
          customer_email: typedProposal.customer?.email || "",
          customer_address: typedProposal.customer?.address || "",
          currency: typedProposal.currency || "TRY",
          subtotal: typedProposal.total_amount || 0,
          total: typedProposal.total_amount || 0,
          items: Array.isArray(typedProposal.items) ? typedProposal.items.map((item: any) => ({
            ...item,
            delivered: false
          })) : [],
          notes: typedProposal.notes || ""
        });
      }
    } catch (error) {
      console.error("Error loading proposal:", error);
      toast.error("Teklif bilgileri yüklenirken bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Here you would save the order to the database
      // For now, we'll just simulate a successful save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Sipariş başarıyla oluşturuldu");
      navigate("/orders");
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Sipariş kaydedilirken bir hata oluştu");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Teklif bilgileri yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="order-details">Sipariş Detayları</TabsTrigger>
            <TabsTrigger value="invoice">E-Fatura</TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => navigate("/orders")}
              disabled={isSaving}
            >
              İptal
            </Button>
            <Button 
              type="submit" 
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> 
                  Siparişi Onayla
                </>
              )}
            </Button>
          </div>
        </div>

        <TabsContent value="order-details" className="mt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sipariş Özet Bilgileri */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Sipariş Bilgileri</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sipariş Numarası</label>
                        <Input 
                          name="order_number"
                          value={orderData.order_number} 
                          onChange={handleInputChange}
                          placeholder="Otomatik oluşturulacak"
                          disabled
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Durum</label>
                        <Select 
                          value={orderData.status}
                          onValueChange={(value) => handleSelectChange("status", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Durum Seçin" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Beklemede</SelectItem>
                            <SelectItem value="processing">İşleniyor</SelectItem>
                            <SelectItem value="shipped">Gönderildi</SelectItem>
                            <SelectItem value="delivered">Teslim Edildi</SelectItem>
                            <SelectItem value="cancelled">İptal Edildi</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Sipariş Tarihi</label>
                        <Input 
                          type="date"
                          name="order_date"
                          value={orderData.order_date} 
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Teslim Tarihi</label>
                        <Input 
                          type="date"
                          name="delivery_date"
                          value={orderData.delivery_date} 
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ödeme Yöntemi</label>
                      <Select 
                        value={orderData.payment_method}
                        onValueChange={(value) => handleSelectChange("payment_method", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ödeme Yöntemi Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                          <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                          <SelectItem value="cash">Nakit</SelectItem>
                          <SelectItem value="check">Çek</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Kargo Yöntemi</label>
                      <Select 
                        value={orderData.shipping_method}
                        onValueChange={(value) => handleSelectChange("shipping_method", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Kargo Yöntemi Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standart Kargo</SelectItem>
                          <SelectItem value="express">Hızlı Kargo</SelectItem>
                          <SelectItem value="pickup">Mağazadan Teslim</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Para Birimi</label>
                      <Select 
                        value={orderData.currency}
                        onValueChange={(value) => handleSelectChange("currency", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Para Birimi Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="TRY">Türk Lirası (₺)</SelectItem>
                          <SelectItem value="USD">Amerikan Doları ($)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                          <SelectItem value="GBP">İngiliz Sterlini (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Müşteri Bilgileri */}
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold mb-4">Müşteri Bilgileri</h3>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Müşteri Adı</label>
                      <Input 
                        name="customer_name"
                        value={orderData.customer_name} 
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">E-posta</label>
                      <Input 
                        name="customer_email"
                        value={orderData.customer_email} 
                        onChange={handleInputChange}
                        type="email"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Adres</label>
                      <Textarea 
                        name="customer_address"
                        value={orderData.customer_address} 
                        onChange={handleInputChange}
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sipariş Kalemleri */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-semibold mb-4">Sipariş Kalemleri</h3>
                <OrderItems 
                  items={orderData.items} 
                  onItemsChange={(items) => setOrderData(prev => ({ ...prev, items }))}
                  currency={orderData.currency}
                />
              </CardContent>
            </Card>

            {/* Notlar ve Ek Bilgiler */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4">Notlar</h3>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Sipariş Notları</label>
                    <Textarea 
                      name="notes"
                      value={orderData.notes} 
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Siparişle ilgili ek notlar..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </TabsContent>

        <TabsContent value="invoice" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex justify-between mb-4">
                    <h3 className="text-lg font-semibold">E-Fatura Önizleme</h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <FileDown className="h-4 w-4 mr-2" />
                        İndir
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Yazdır
                      </Button>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-6 bg-gray-50">
                    <div className="text-center mb-6">
                      <h2 className="text-xl font-bold">FATURA</h2>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <h4 className="font-semibold mb-2">Satıcı:</h4>
                        <p>Şirket Adı A.Ş.</p>
                        <p>Vergi Dairesi: Merkez</p>
                        <p>Vergi No: 1234567890</p>
                        <p>Adres: Örnek Mah. Örnek Sok. No:1 İstanbul/Türkiye</p>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2">Alıcı:</h4>
                        <p>{orderData.customer_name}</p>
                        <p>Adres: {orderData.customer_address}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-8 mb-6">
                      <div>
                        <p><strong>Fatura No:</strong> E-{new Date().getFullYear()}/001</p>
                        <p><strong>Fatura Tarihi:</strong> {new Date().toLocaleDateString()}</p>
                      </div>
                      
                      <div>
                        <p><strong>Ödeme Şekli:</strong> {
                          orderData.payment_method === "bank_transfer" ? "Banka Havalesi" :
                          orderData.payment_method === "credit_card" ? "Kredi Kartı" :
                          orderData.payment_method === "cash" ? "Nakit" : "Çek"
                        }</p>
                      </div>
                    </div>
                    
                    <table className="min-w-full mb-6">
                      <thead className="bg-gray-200">
                        <tr>
                          <th className="px-4 py-2 text-left">Sıra</th>
                          <th className="px-4 py-2 text-left">Mal/Hizmet</th>
                          <th className="px-4 py-2 text-right">Miktar</th>
                          <th className="px-4 py-2 text-right">Birim Fiyat</th>
                          <th className="px-4 py-2 text-right">KDV</th>
                          <th className="px-4 py-2 text-right">Tutar</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {orderData.items.map((item, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2">{index + 1}</td>
                            <td className="px-4 py-2">{item.name}</td>
                            <td className="px-4 py-2 text-right">{item.quantity}</td>
                            <td className="px-4 py-2 text-right">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: orderData.currency }).format(item.unit_price)}
                            </td>
                            <td className="px-4 py-2 text-right">%{item.tax_rate || 18}</td>
                            <td className="px-4 py-2 text-right">
                              {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: orderData.currency }).format(item.total_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="flex justify-end">
                      <div className="w-1/3">
                        <div className="flex justify-between py-2">
                          <span>Ara Toplam:</span>
                          <span>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: orderData.currency }).format(orderData.subtotal)}</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span>KDV (%18):</span>
                          <span>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: orderData.currency }).format(orderData.subtotal * 0.18)}</span>
                        </div>
                        <div className="flex justify-between py-2 border-t font-semibold">
                          <span>Genel Toplam:</span>
                          <span>{new Intl.NumberFormat('tr-TR', { style: 'currency', currency: orderData.currency }).format(orderData.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">E-Fatura Ayarları</h3>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">E-Fatura Tipi</label>
                      <Select defaultValue="e_fatura">
                        <SelectTrigger>
                          <SelectValue placeholder="E-Fatura Tipi Seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="e_fatura">E-Fatura</SelectItem>
                          <SelectItem value="e_arsiv">E-Arşiv</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vergi Dairesi</label>
                      <Input placeholder="Vergi Dairesi" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Vergi Numarası</label>
                      <Input placeholder="Vergi Numarası" />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Fatura Notları</label>
                      <Textarea 
                        placeholder="Fatura ile ilgili ek notlar..."
                        rows={3}
                      />
                    </div>
                    
                    <Button className="w-full">
                      E-Fatura Oluştur
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderForm;
