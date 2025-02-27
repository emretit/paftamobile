
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
import { CalendarIcon, Upload, X, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useServiceRequests, ServiceRequestFormData, ServicePriority } from "@/hooks/useServiceRequests";
import { supabase } from "@/integrations/supabase/client";

interface ServiceRequestFormProps {
  onClose: () => void;
  initialData?: any;
  isEditing?: boolean;
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

export function ServiceRequestForm({ onClose, initialData, isEditing = false }: ServiceRequestFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<any[]>(
    initialData?.attachments || []
  );
  const { customers } = useCustomerSelect();
  const { createServiceRequest, updateServiceRequest, isCreating, isUpdating, deleteAttachment } = useServiceRequests();
  
  const form = useForm<ServiceRequestFormData>({
    defaultValues: isEditing && initialData 
      ? {
          title: initialData.title || '',
          description: initialData.description || '',
          priority: initialData.priority || 'medium',
          customer_id: initialData.customer_id || '',
          service_type: initialData.service_type ? initialData.service_type.toLowerCase() : '',
          location: initialData.location || '',
          due_date: initialData.due_date ? new Date(initialData.due_date) : undefined,
        }
      : {
          title: '',
          description: '',
          priority: 'medium' as ServicePriority,
          customer_id: '',
          service_type: '',
          location: '',
        }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingAttachment = async (attachment: any) => {
    if (isEditing && initialData?.id) {
      try {
        await deleteAttachment({ requestId: initialData.id, attachmentPath: attachment.path });
        setExistingAttachments(prev => prev.filter(a => a.path !== attachment.path));
      } catch (error) {
        console.error("Dosya silme hatası:", error);
      }
    }
  };

  const onSubmit = async (data: ServiceRequestFormData) => {
    if (isEditing && initialData?.id) {
      updateServiceRequest({ 
        id: initialData.id, 
        updateData: data, 
        newFiles: files 
      });
    } else {
      createServiceRequest({ formData: data, files });
    }
    onClose();
  };

  const handleDownloadFile = (attachment: any) => {
    if (!attachment.path) return;
    
    supabase.storage.from('service-attachments')
      .download(attachment.path)
      .then(({ data, error }) => {
        if (error) {
          toast.error("Dosya indirilemedi");
          return;
        }
        
        const url = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = url;
        a.download = attachment.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
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
                      date < new Date(new Date().setDate(new Date().getDate() - 1))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <FormLabel>Ekler</FormLabel>
          
          {/* Mevcut ekler (düzenleme modunda) */}
          {isEditing && existingAttachments.length > 0 && (
            <div className="space-y-2 mt-2 border p-3 rounded-md">
              <h3 className="text-sm font-medium">Mevcut Dosyalar</h3>
              <div className="space-y-2">
                {existingAttachments.map((attachment, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div 
                      className="text-sm text-blue-600 cursor-pointer hover:underline flex-1"
                      onClick={() => handleDownloadFile(attachment)}
                    >
                      {attachment.name}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeExistingAttachment(attachment)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Yeni eklenen dosyalar */}
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
            <div className="space-y-2 border p-3 rounded-md">
              <h3 className="text-sm font-medium">Yüklenecek Dosyalar</h3>
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <span className="text-sm text-gray-600">{file.name}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(index)}
                  >
                    <X className="h-4 w-4 text-gray-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" disabled={isCreating || isUpdating}>
            {isEditing ? "Güncelle" : "Servis Talebi Oluştur"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
