
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type BankAccount = {
  id: string;
  bank_name: string;
  account_name: string;
  account_number?: string;
  branch_name?: string;
  iban?: string;
  swift_code?: string;
  account_type: "vadesiz" | "vadeli" | "kredi" | "pos";
  currency: "TRY" | "USD" | "EUR" | "GBP";
  current_balance: number;
  credit_limit: number;
  interest_rate?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

type BankAccountInsert = Omit<BankAccount, 'id' | 'created_at' | 'updated_at'>;

const formSchema = z.object({
  bank_name: z.string().min(1, "Banka adı zorunludur"),
  account_name: z.string().min(1, "Hesap adı zorunludur"),
  account_number: z.string().optional(),
  branch_name: z.string().optional(),
  iban: z.string().optional(),
  swift_code: z.string().optional(),
  account_type: z.enum(["vadesiz", "vadeli", "kredi", "pos"]),
  currency: z.enum(["TRY", "USD", "EUR", "GBP"]),
  current_balance: z.number().default(0),
  credit_limit: z.number().default(0),
  interest_rate: z.number().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface NewBankAccountFormProps {
  onSuccess: () => void;
}

export function NewBankAccountForm({ onSuccess }: NewBankAccountFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      current_balance: 0,
      credit_limit: 0,
      account_type: "vadesiz",
      currency: "TRY",
      bank_name: "",
      account_name: "",
    },
  });

  const { mutate: createAccount, isPending } = useMutation<BankAccount, Error, BankAccountInsert>({
    mutationFn: async (values: BankAccountInsert) => {
      const { data, error } = await supabase
        .from('bank_accounts')
        .insert(values)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bankAccounts'] });
      toast({
        title: "Başarılı",
        description: "Banka hesabı başarıyla oluşturuldu.",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Hata",
        description: "Banka hesabı oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
      console.error('Error creating bank account:', error);
    },
  });

  function onSubmit(values: FormValues) {
    // Zorunlu alanları içeren bir BankAccountInsert nesnesi oluştur
    const submitData: BankAccountInsert = {
      bank_name: values.bank_name,
      account_name: values.account_name,
      account_type: values.account_type,
      currency: values.currency,
      current_balance: values.current_balance,
      credit_limit: values.credit_limit,
      // Opsiyonel alanları koşullu olarak ekle
      ...(values.account_number && { account_number: values.account_number }),
      ...(values.branch_name && { branch_name: values.branch_name }),
      ...(values.iban && { iban: values.iban }),
      ...(values.swift_code && { swift_code: values.swift_code }),
      ...(values.interest_rate && { interest_rate: values.interest_rate }),
      ...(values.notes && { notes: values.notes }),
    };
    createAccount(submitData);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <FormField
          control={form.control}
          name="bank_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Banka Adı</FormLabel>
              <FormControl>
                <Input placeholder="Banka adını giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="account_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hesap Adı</FormLabel>
              <FormControl>
                <Input placeholder="Hesap adını giriniz" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="account_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hesap Türü</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Hesap türü seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="vadesiz">Vadesiz</SelectItem>
                    <SelectItem value="vadeli">Vadeli</SelectItem>
                    <SelectItem value="kredi">Kredi</SelectItem>
                    <SelectItem value="pos">POS</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Para Birimi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Para birimi seçiniz" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="TRY">TRY</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="account_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hesap Numarası</FormLabel>
                <FormControl>
                  <Input placeholder="Hesap numarasını giriniz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="branch_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Şube Adı</FormLabel>
                <FormControl>
                  <Input placeholder="Şube adını giriniz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="iban"
            render={({ field }) => (
              <FormItem>
                <FormLabel>IBAN</FormLabel>
                <FormControl>
                  <Input placeholder="IBAN giriniz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="swift_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SWIFT Kodu</FormLabel>
                <FormControl>
                  <Input placeholder="SWIFT kodunu giriniz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="current_balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Açılış Bakiyesi</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="credit_limit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kredi Limiti</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="0.00" 
                    {...field}
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="interest_rate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Faiz Oranı (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  {...field}
                  onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={() => onSuccess()}>
            İptal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
