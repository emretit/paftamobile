
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useServiceRequests, ServiceRequestFormData } from "@/hooks/useServiceRequests";
import { useToast } from "@/components/ui/use-toast";
import { useCustomerSelect } from "@/hooks/useCustomerSelect";

// Define the form schema
const formSchema = z.object({
  title: z.string().min(3, { message: "Başlık en az 3 karakter olmalıdır" }),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  service_type: z.string().min(1, { message: "Servis türü seçmelisiniz" }),
  location: z.string().optional(),
  due_date: z.date().optional(),
  customer_id: z.string().optional(),
  equipment_id: z.string().optional(),
});

interface ServiceRequestFormProps {
  onClose: () => void;
}

export function ServiceRequestForm({ onClose }: ServiceRequestFormProps) {
  const [files, setFiles] = useState<File[]>([]);
  const { createServiceRequest, isCreating } = useServiceRequests();
  const { toast } = useToast();
  const { customers, isLoading: isLoadingCustomers } = useCustomerSelect();

  const form = useForm<ServiceRequestFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      service_type: "",
      location: "",
      customer_id: undefined,
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const onSubmit = (data: ServiceRequestFormData) => {
    createServiceRequest({ formData: data, files });
    toast({
      title: "Servis Talebi Oluşturuldu",
      description: "Servis talebi başarıyla oluşturuldu",
    });
    onClose();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Title field */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Başlık</FormLabel>
              <FormControl>
                <Input placeholder="Servis talebi başlığı" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description field */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Açıklama</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Servis talebi ile ilgili detaylar"
                  className="resize-none"
                  {...field}
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Priority field */}
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Öncelik</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Öncelik seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="low">Düşük</SelectItem>
                  <SelectItem value="medium">Orta</SelectItem>
                  <SelectItem value="high">Yüksek</SelectItem>
                  <SelectItem value="urgent">Acil</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Service Type field */}
        <FormField
          control={form.control}
          name="service_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Servis Türü</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Servis türü seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="installation">Kurulum</SelectItem>
                  <SelectItem value="repair">Onarım</SelectItem>
                  <SelectItem value="maintenance">Bakım</SelectItem>
                  <SelectItem value="inspection">Kontrol</SelectItem>
                  <SelectItem value="consultation">Danışmanlık</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Customer field */}
        <FormField
          control={form.control}
          name="customer_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Müşteri</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Müşteri seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {isLoadingCustomers ? (
                    <SelectItem value="loading" disabled>Yükleniyor...</SelectItem>
                  ) : (
                    customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} {customer.company && `(${customer.company})`}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location field */}
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Konum</FormLabel>
              <FormControl>
                <Input placeholder="Servis konumu" {...field} value={field.value || ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Due Date field */}
        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Son Tarih</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Tarih seçin</span>
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
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* File Upload */}
        <div className="space-y-2">
          <FormLabel>Dosya Ekle</FormLabel>
          <Input
            type="file"
            multiple
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          {files.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {files.length} dosya seçildi
            </p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose} type="button">
            İptal
          </Button>
          <Button type="submit" disabled={isCreating}>
            {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Oluştur
          </Button>
        </div>
      </form>
    </Form>
  );
}
