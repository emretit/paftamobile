
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft } from "lucide-react";

interface EmployeeFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  hire_date: string;
  status: 'aktif' | 'pasif' | 'izinli' | 'ayrıldı';
}

const initialFormData: EmployeeFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  position: "",
  department: "",
  hire_date: new Date().toISOString().split('T')[0],
  status: "aktif"
};

export const EmployeeForm = () => {
  const [formData, setFormData] = useState<EmployeeFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase
        .from('employees')
        .insert([formData]);

      if (error) throw error;

      toast({
        title: "Başarılı",
        description: "Çalışan başarıyla eklendi.",
      });
      
      navigate("/employees");
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Hata",
        description: "Çalışan eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate("/employees")}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri Dön
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Yeni Çalışan Ekle</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Ad</Label>
              <Input
                id="first_name"
                value={formData.first_name}
                onChange={(e) => setFormData(prev => ({...prev, first_name: e.target.value}))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Soyad</Label>
              <Input
                id="last_name"
                value={formData.last_name}
                onChange={(e) => setFormData(prev => ({...prev, last_name: e.target.value}))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Pozisyon</Label>
              <Input
                id="position"
                value={formData.position}
                onChange={(e) => setFormData(prev => ({...prev, position: e.target.value}))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departman</Label>
              <Input
                id="department"
                value={formData.department}
                onChange={(e) => setFormData(prev => ({...prev, department: e.target.value}))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hire_date">İşe Başlama Tarihi</Label>
              <Input
                id="hire_date"
                type="date"
                value={formData.hire_date}
                onChange={(e) => setFormData(prev => ({...prev, hire_date: e.target.value}))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Durum</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({...prev, status: value}))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aktif">Aktif</SelectItem>
                  <SelectItem value="pasif">Pasif</SelectItem>
                  <SelectItem value="izinli">İzinli</SelectItem>
                  <SelectItem value="ayrıldı">Ayrıldı</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/employees")}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Ekleniyor..." : "Çalışan Ekle"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
