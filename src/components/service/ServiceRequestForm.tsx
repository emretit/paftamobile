
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerSelect } from "@/hooks/useCustomerSelect";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Upload } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type ServiceRequestStatus = 'cancelled' | 'new' | 'completed' | 'assigned' | 'in_progress' | 'on_hold';
type ServiceRequestPriority = 'low' | 'medium' | 'high' | 'urgent';

interface FormData {
  title: string;
  description: string;
  priority: ServiceRequestPriority;
  customer_id: string;
  service_type: string;
  location: string;
  due_date?: Date;
}

interface ServiceRequestFormProps {
  onClose: () => void;
}

const serviceTypes = [
  'Kurulum',
  'Onarım',
  'Bakım',
  'Destek',
  'Eğitim',
  'İnceleme',
];

const priorityLabels = {
  low: 'Düşük',
  medium: 'Orta',
  high: 'Yüksek',
  urgent: 'Acil'
};

export function ServiceRequestForm({ onClose }: ServiceRequestFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { customers } = useCustomerSelect();
  const form = useForm<FormData>();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const uploadFiles = async (serviceRequestId: string) => {
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${serviceRequestId}/${crypto.randomUUID()}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('service-attachments')
          .upload(fileName, file);

        if (error) {
          console.error('Dosya yükleme hatası:', error);
          return null;
        }

        return {
          name: file.name,
          path: fileName,
          type: file.type,
          size: file.size,
        };
      })
    );

    return uploadedFiles.filter(Boolean);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const formattedData = {
        ...data,
        due_date: data.due_date?.toISOString(),
        status: 'new' as ServiceRequestStatus,
        attachments: [] as any[],
      };

      const { data: serviceRequest, error } = await supabase
        .from('service_requests')
        .insert(formattedData)
        .select()
        .single();

      if (error) throw error;

      if (files.length > 0 && serviceRequest) {
        const uploadedFiles = await uploadFiles(serviceRequest.id);
        
        const { error: updateError } = await supabase
          .from('service_requests')
          .update({ attachments: uploadedFiles })
          .eq('id', serviceRequest.id);

        if (updateError) throw updateError;
      }

      toast.success("Servis talebi başarıyla oluşturuldu");
      onClose();
    } catch (error) {
      console.error('Servis talebi oluşturma hatası:', error);
      toast.error("Servis talebi oluşturulamadı");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Servis Konusu</FormLabel>
              <FormControl>
                <Input placeholder="Servis konusunu giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Servis talebini açıklayınız..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Müşteri</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçiniz" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers?.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Öncelik</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Öncelik seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">{priorityLabels.low}</SelectItem>
                    <SelectItem value="medium">{priorityLabels.medium}</SelectItem>
                    <SelectItem value="high">{priorityLabels.high}</SelectItem>
                    <SelectItem value="urgent">{priorityLabels.urgent}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="service_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Servis Tipi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Servis tipi seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {serviceTypes.map((type) => (
                      <SelectItem key={type} value={type.toLowerCase()}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konum</FormLabel>
              <FormControl>
                <Input placeholder="Servis konumu" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tercih Edilen Tarih</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Tarih seçiniz</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date()
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel>Ekler</FormLabel>
          <div className="flex items-center gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Upload className="w-4 h-4 mr-2" />
              Dosya Yükle
            </Button>
            <input
              id="file-upload"
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
          {files.length > 0 && (
            <div className="space-y-2">
              {files.map((file, index) => (
                <div key={index} className="text-sm text-gray-600">
                  {file.name}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit">
            Servis Talebi Oluştur
          </Button>
        </div>
      </form>
    </Form>
  );
}
