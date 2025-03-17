
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { tr } from 'date-fns/locale';

interface OpportunityFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const OpportunityForm: React.FC<OpportunityFormProps> = ({ isOpen, onClose }) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      title: "",
      value: "",
      description: "",
      status: "new",
      priority: "medium",
      customer_id: "",
      employee_id: ""
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from("opportunities")
        .insert({
          ...data,
          expected_close_date: date?.toISOString(),
          value: Number(data.value),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Yeni fırsat başarıyla eklendi.",
        className: "bg-green-50 border-green-200",
      });

      queryClient.invalidateQueries({ queryKey: ["opportunities"] });
      reset();
      onClose();
    } catch (error) {
      console.error("Error adding opportunity:", error);
      toast({
        title: "Hata!",
        description: "Fırsat eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Yeni Fırsat Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Fırsat Adı</Label>
              <Input id="title" {...register("title", { required: "Fırsat adı gerekli" })} />
              {errors.title && <p className="text-red-500 text-xs">{errors.title.message?.toString()}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Tahmini Değer (₺)</Label>
                <Input id="value" type="number" {...register("value")} />
              </div>

              <div className="space-y-2">
                <Label>Tahmini Kapanış Tarihi</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: tr }) : "Tarih seçin"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Durum</Label>
                <Select defaultValue="new" {...register("status")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">Yeni</SelectItem>
                    <SelectItem value="first_contact">İlk Görüşme</SelectItem>
                    <SelectItem value="site_visit">Saha Ziyareti</SelectItem>
                    <SelectItem value="preparing_proposal">Teklif Hazırlama</SelectItem>
                    <SelectItem value="proposal_sent">Teklif Gönderildi</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Öncelik</Label>
                <Select defaultValue="medium" {...register("priority")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Öncelik seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Textarea id="description" {...register("description")} />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              İptal
            </Button>
            <Button type="submit">Kaydet</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OpportunityForm;
