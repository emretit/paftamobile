import { useState } from "react";
import OrdersTable from "./OrdersTable";
import { ViewType } from "./header/OrdersViewToggle";
import { useOrders } from "@/hooks/useOrders";
import { Order } from "@/types/orders";

interface OrdersContentProps {
  searchQuery: string;
  selectedStatus: string;
  selectedCustomer: string;
  onSelectOrder: (order: Order) => void;
  activeView: ViewType;
}

const OrdersContent = ({
  searchQuery,
  selectedStatus,
  selectedCustomer,
  onSelectOrder,
  activeView
}: OrdersContentProps) => {
  const { orders, isLoading, error, filters, setFilters } = useOrders();

  // Local filters'ı hook filters ile senkronize et
  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') {
      setFilters(prev => ({ ...prev, status: value === 'all' ? 'all' : value as any }));
    } else if (key === 'customer_id') {
      setFilters(prev => ({ ...prev, customer_id: value === 'all' ? 'all' : value }));
    }
  };

  const handleSearchChange = (search: string) => {
    setFilters(prev => ({ ...prev, search }));
  };

  // Search ve filter değişikliklerini hook'a yansıt
  if (searchQuery !== filters.search) {
    handleSearchChange(searchQuery);
  }

  if (selectedStatus !== filters.status) {
    handleFilterChange('status', selectedStatus);
  }

  if (selectedCustomer !== filters.customer_id) {
    handleFilterChange('customer_id', selectedCustomer);
  }

  const handleSelectOrder = (order: Order) => {
    if (onSelectOrder) {
      onSelectOrder(order);
    }
  };

  if (error) {
    return (
      <div className="text-center p-8 text-red-600">
        <p>Hata oluştu: {error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
        >
          Sayfayı Yenile
        </button>
      </div>
    );
  }

  return (
    <>
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
    </>
  );
};

export default OrdersContent;