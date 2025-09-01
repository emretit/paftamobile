import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, ShoppingCart } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Order, OrderStatus } from "@/types/orders";

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
  onSelectOrder: (order: Order) => void;
  searchQuery: string;
  selectedStatus: string;
  selectedCustomer: string;
}

const OrdersTable = ({
  orders,
  isLoading,
  onSelectOrder,
  searchQuery,
  selectedStatus,
  selectedCustomer
}: OrdersTableProps) => {
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "processing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "delivered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "completed":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200";
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusLabel = (status: OrderStatus) => {
    switch (status) {
      case "pending":
        return "Beklemede";
      case "confirmed":
        return "Onaylandı";
      case "processing":
        return "İşlemde";
      case "shipped":
        return "Kargoda";
      case "delivered":
        return "Teslim Edildi";
      case "completed":
        return "Tamamlandı";
      case "cancelled":
        return "İptal Edildi";
      default:
        return status;
    }
  };

  const getCustomerDisplayName = (order: Order) => {
    if (order.customer) {
      return order.customer.company || order.customer.name;
    }
    return "Müşteri bilgisi yok";
  };

  const getItemsCount = (order: Order) => {
    if (order.items && order.items.length > 0) {
      return order.items.length;
    }
    return 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <ShoppingCart className="mx-auto h-12 w-12 mb-4 opacity-20" />
        <h3 className="text-lg font-medium mb-2">Henüz sipariş bulunmuyor</h3>
        <p>Yeni sipariş eklemek için "Yeni Sipariş" butonunu kullanabilirsiniz.</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Sipariş No</TableHead>
            <TableHead>Müşteri</TableHead>
            <TableHead>Başlık</TableHead>
            <TableHead>Ürün Sayısı</TableHead>
            <TableHead>Toplam Tutar</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="cursor-pointer hover:bg-muted/50">
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>{getCustomerDisplayName(order)}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={order.title}>
                {order.title}
              </TableCell>
              <TableCell>{getItemsCount(order)} ürün</TableCell>
              <TableCell>{formatCurrency(order.total_amount, order.currency)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(order.status)}>
                  {getStatusLabel(order.status)}
                </Badge>
              </TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString("tr-TR")}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectOrder(order)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelectOrder(order)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default OrdersTable;