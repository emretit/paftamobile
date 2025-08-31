import React from "react";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Package, Clock, CheckCircle } from "lucide-react";

const OrdersSummary = () => {
  // Mock data - bu gerçek verilerle değiştirilecek
  const orderStats = {
    pending: 5,
    processing: 3,
    shipped: 8,
    completed: 12
  };

  const total = orderStats.pending + orderStats.processing + orderStats.shipped + orderStats.completed;

  return (
    <div className="space-y-4">
      {/* Total Orders */}
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold text-foreground">{total}</span>
        <span className="text-sm text-muted-foreground">Toplam Sipariş</span>
      </div>

      {/* Order Status Breakdown */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-4 w-4 text-orange-500 mr-2" />
            <span className="text-sm text-muted-foreground">Bekleyen</span>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-700">
            {orderStats.pending}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Package className="h-4 w-4 text-blue-500 mr-2" />
            <span className="text-sm text-muted-foreground">İşleniyor</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-700">
            {orderStats.processing}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ShoppingBag className="h-4 w-4 text-purple-500 mr-2" />
            <span className="text-sm text-muted-foreground">Kargoda</span>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
            {orderStats.shipped}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
            <span className="text-sm text-muted-foreground">Tamamlandı</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-700">
            {orderStats.completed}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="pt-3 border-t border-border">
        <div className="text-xs text-muted-foreground">
          Bu ay: +{orderStats.pending + orderStats.processing} yeni sipariş
        </div>
      </div>
    </div>
  );
};

export default OrdersSummary;