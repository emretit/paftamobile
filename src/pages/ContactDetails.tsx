
import { useParams, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Mail, Phone, Building, MapPin, ArrowLeft, Pencil, FileText, Activity, Receipt, FileStack, CreditCard } from "lucide-react";
import Navbar from "@/components/Navbar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContactDetailsProps {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const ContactDetails = ({ isCollapsed, setIsCollapsed }: ContactDetailsProps) => {
  const { id } = useParams();

  const { data: customer, isLoading } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} p-8`}>
          <div className="text-center py-8">Yükleniyor...</div>
        </main>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} p-8`}>
          <div className="text-center py-8">Müşteri bulunamadı</div>
        </main>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'aktif':
        return 'bg-green-100 text-green-800';
      case 'pasif':
        return 'bg-gray-100 text-gray-800';
      case 'potansiyel':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className={`transition-all duration-300 ${isCollapsed ? 'ml-[60px]' : 'ml-64'} p-8`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              to="/contacts" 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{customer.company || customer.name}</h1>
              {customer.type === 'kurumsal' && customer.name && (
                <p className="text-gray-500 mt-1">Yetkili Kişi: {customer.name}</p>
              )}
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusColor(customer.status)}`}>
                  {customer.status}
                </span>
                <span className="text-gray-600">•</span>
                <span className="text-gray-600">{customer.type}</span>
              </div>
            </div>
          </div>
          <Link to={`/contacts/${id}/edit`}>
            <Button className="flex items-center gap-2">
              <Pencil className="h-4 w-4" />
              Düzenle
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="overview">Genel Bilgiler</TabsTrigger>
            <TabsTrigger value="activities" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Aktiviteler
            </TabsTrigger>
            <TabsTrigger value="service-receipts" className="flex items-center gap-1">
              <Receipt className="h-4 w-4" />
              Servis Fişleri
            </TabsTrigger>
            <TabsTrigger value="offers" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              Teklifler
            </TabsTrigger>
            <TabsTrigger value="invoices" className="flex items-center gap-1">
              <Receipt className="h-4 w-4" />
              Faturalar
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              Cari Hareketler
            </TabsTrigger>
            <TabsTrigger value="contracts" className="flex items-center gap-1">
              <FileStack className="h-4 w-4" />
              Sözleşmeler
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">İletişim Bilgileri</h2>
                  <div className="space-y-4">
                    {customer.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-gray-400" />
                        <span>{customer.email}</span>
                      </div>
                    )}
                    {customer.mobile_phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <span>{customer.mobile_phone}</span>
                          <span className="text-sm text-gray-500 ml-2">(Cep)</span>
                        </div>
                      </div>
                    )}
                    {customer.office_phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-400" />
                        <div>
                          <span>{customer.office_phone}</span>
                          <span className="text-sm text-gray-500 ml-2">(Sabit)</span>
                        </div>
                      </div>
                    )}
                    {customer.type === 'kurumsal' && customer.company && (
                      <div className="flex items-center space-x-3">
                        <Building className="h-5 w-5 text-gray-400" />
                        <span>{customer.company}</span>
                      </div>
                    )}
                    {customer.representative && (
                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-400" />
                        <span>Temsilci: {customer.representative}</span>
                      </div>
                    )}
                    {customer.address && (
                      <div className="flex space-x-3 items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                        <div className="flex-1">
                          <span className="text-sm text-gray-500 block mb-1">Adres</span>
                          <span className="whitespace-pre-wrap">{customer.address}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>

                {customer.type === 'kurumsal' && (
                  <Card className="p-6 mt-6">
                    <h2 className="text-xl font-semibold mb-4">Vergi Bilgileri</h2>
                    <div className="space-y-4">
                      {customer.tax_number && (
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-500 block">Vergi No</span>
                            <span>{customer.tax_number}</span>
                          </div>
                        </div>
                      )}
                      {customer.tax_office && (
                        <div className="flex items-center space-x-3">
                          <Building className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-sm text-gray-500 block">Vergi Dairesi</span>
                            <span>{customer.tax_office}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )}

                <Card className="p-6 mt-6">
                  <h2 className="text-xl font-semibold mb-4">Finansal Bilgiler</h2>
                  <div className="p-4 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Bakiye</span>
                      <span className={`font-semibold ${customer.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {customer.balance.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
                      </span>
                    </div>
                  </div>
                </Card>
              </div>

              <div>
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Geçmiş</h2>
                  <div className="text-sm text-gray-500">
                    <p>Oluşturulma: {new Date(customer.created_at).toLocaleDateString('tr-TR')}</p>
                    <p>Son Güncelleme: {new Date(customer.updated_at).toLocaleDateString('tr-TR')}</p>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activities">
            <Card className="p-6">
              <p className="text-gray-500">Aktiviteler yakında eklenecek.</p>
            </Card>
          </TabsContent>

          <TabsContent value="service-receipts">
            <Card className="p-6">
              <p className="text-gray-500">Servis fişleri yakında eklenecek.</p>
            </Card>
          </TabsContent>

          <TabsContent value="offers">
            <Card className="p-6">
              <p className="text-gray-500">Teklifler yakında eklenecek.</p>
            </Card>
          </TabsContent>

          <TabsContent value="invoices">
            <Card className="p-6">
              <p className="text-gray-500">Faturalar yakında eklenecek.</p>
            </Card>
          </TabsContent>

          <TabsContent value="transactions">
            <Card className="p-6">
              <p className="text-gray-500">Cari hareketler yakında eklenecek.</p>
            </Card>
          </TabsContent>

          <TabsContent value="contracts">
            <Card className="p-6">
              <p className="text-gray-500">Sözleşmeler yakında eklenecek.</p>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ContactDetails;

