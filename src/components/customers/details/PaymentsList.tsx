
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Customer } from "@/types/customer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";

interface PaymentsListProps {
  customer: Customer;
}

interface Payment {
  id: string;
  amount: number;
  payment_type: "havale" | "eft" | "kredi_karti" | "nakit";
  payment_date: string;
  description: string | null;
  status: "pending" | "completed" | "cancelled" | "refunded";
  bank_account_id: string;
  currency: "TRY" | "USD" | "EUR" | "GBP";
  bank_accounts?: {
    bank_name: string;
    account_name: string;
  };
}

export function PaymentsList({ customer }: PaymentsListProps) {
  const { data: payments, isLoading } = useQuery({
    queryKey: ["customer-payments", customer.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payments")
        .select(`
          *,
          bank_accounts (
            bank_name,
            account_name
          )
        `)
        .eq("customer_id", customer.id)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data as Payment[];
    },
  });

  if (isLoading) {
    return <div>Yükleniyor...</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "refunded":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatStatus = (status: string) => {
    switch (status) {
      case "completed":
        return "Tamamlandı";
      case "pending":
        return "Bekliyor";
      case "cancelled":
        return "İptal Edildi";
      case "refunded":
        return "İade Edildi";
      default:
        return status;
    }
  };

  const formatPaymentType = (type: string) => {
    switch (type) {
      case "havale":
        return "Havale";
      case "eft":
        return "EFT";
      case "kredi_karti":
        return "Kredi Kartı";
      case "nakit":
        return "Nakit";
      default:
        return type;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tarih</TableHead>
            <TableHead>Tutar</TableHead>
            <TableHead>Ödeme Türü</TableHead>
            <TableHead>Banka Hesabı</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Açıklama</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments?.map((payment) => (
            <TableRow key={payment.id}>
              <TableCell>
                {format(new Date(payment.payment_date), "dd.MM.yyyy")}
              </TableCell>
              <TableCell className="font-medium">
                {payment.amount.toLocaleString("tr-TR", {
                  style: "currency",
                  currency: payment.currency,
                })}
              </TableCell>
              <TableCell>{formatPaymentType(payment.payment_type)}</TableCell>
              <TableCell>
                {payment.bank_accounts?.account_name} - {payment.bank_accounts?.bank_name}
              </TableCell>
              <TableCell>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                    payment.status
                  )}`}
                >
                  {formatStatus(payment.status)}
                </span>
              </TableCell>
              <TableCell className="text-gray-500">{payment.description}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
