import { useState } from "react";
import OrdersTable from "./OrdersTable";
import { ViewType } from "./header/OrdersViewToggle";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
  items_count: number;
}

interface OrdersContentProps {
  searchQuery: string;
  selectedStatus: string;
  selectedCustomer: string;
  onSelectOrder?: (order: Order) => void;
  activeView: ViewType;
}

const OrdersContent = ({
  searchQuery,
  selectedStatus,
  selectedCustomer,
  onSelectOrder,
  activeView
}: OrdersContentProps) => {
  // Mock data for now
  const [orders] = useState<Order[]>([]);
  const [isLoading] = useState(false);

  const handleSelectOrder = (order: Order) => {
    if (onSelectOrder) {
      onSelectOrder(order);
    }
  };

  return (
    <div className="bg-gradient-to-br from-card via-muted/20 to-background rounded-2xl shadow-2xl border border-border/10 backdrop-blur-xl relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-50"></div>
      <div className="relative z-10 p-8">
        {activeView === "table" ? (
          <OrdersTable
            orders={orders}
            isLoading={isLoading}
            onSelectOrder={handleSelectOrder}
            searchQuery={searchQuery}
            selectedStatus={selectedStatus}
            selectedCustomer={selectedCustomer}
          />
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            <p>Kart görünümü yakında eklenecek...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersContent;