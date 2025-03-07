
import React from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { ServiceRequestFormData } from "@/hooks/service/types";

type FieldProps = {
  form: UseFormReturn<ServiceRequestFormData>;
};

export const TitleField: React.FC<FieldProps> = ({ form }) => (
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
);

export const DescriptionField: React.FC<FieldProps> = ({ form }) => (
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
);

export const PriorityField: React.FC<FieldProps> = ({ form }) => (
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
);

export const ServiceTypeField: React.FC<FieldProps> = ({ form }) => (
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
);

export const LocationField: React.FC<FieldProps> = ({ form }) => (
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
);

export const DueDateField: React.FC<FieldProps> = ({ form }) => (
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
);
