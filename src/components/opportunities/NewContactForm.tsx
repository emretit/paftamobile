
import React from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/components/ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NewContactFormProps {
  isOpen: boolean;
  onClose: () => void;
  opportunityId?: string;
}

const NewContactForm: React.FC<NewContactFormProps> = ({ isOpen, onClose, opportunityId }) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      position: "",
      type: "primary"
    }
  });

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from("contacts")
        .insert({
          ...data,
          opportunity_id: opportunityId,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Başarılı!",
        description: "Yeni kontak başarıyla eklendi.",
        className: "bg-green-50 border-green-200",
      });

      queryClient.invalidateQueries({ queryKey: ["opportunity-contacts"] });
      reset();
      onClose();
    } catch (error) {
      console.error("Error adding contact:", error);
      toast({
        title: "Hata!",
        description: "Kontak eklenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Yeni Kontak Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Ad</Label>
              <Input id="first_name" {...register("first_name", { required: "Ad gerekli" })} />
              {errors.first_name && <p className="text-red-500 text-xs">{errors.first_name.message?.toString()}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Soyad</Label>
              <Input id="last_name" {...register("last_name", { required: "Soyad gerekli" })} />
              {errors.last_name && <p className="text-red-500 text-xs">{errors.last_name.message?.toString()}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input 
                id="email" 
                type="email" 
                {...register("email", { 
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Geçersiz e-posta adresi"
                  }
                })} 
              />
              {errors.email && <p className="text-red-500 text-xs">{errors.email.message?.toString()}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" {...register("phone")} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="position">Pozisyon</Label>
              <Input id="position" {...register("position")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Kontak Tipi</Label>
              <Select defaultValue="primary" {...register("type")}>
                <SelectTrigger>
                  <SelectValue placeholder="Tip seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primary">Birincil</SelectItem>
                  <SelectItem value="secondary">İkincil</SelectItem>
                  <SelectItem value="decision_maker">Karar Verici</SelectItem>
                  <SelectItem value="influencer">Etkileyici</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
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

export default NewContactForm;
