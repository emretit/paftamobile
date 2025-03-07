
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  PurchaseOrder, 
  PurchaseOrderItem, 
  PurchaseOrderFormData,
  PurchaseOrderStatus
} from "@/types/purchase";
import { toast } from "sonner";

export const usePurchaseOrders = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "" as string,
    search: "",
    dateRange: { from: null, to: null } as { from: Date | null, to: null }
  });

  const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    let query = supabase
      .from("purchase_orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (filters.status) {
      query = query.eq("status", filters.status as PurchaseOrderStatus);
    }

    if (filters.search) {
      query = query.or(`po_number.ilike.%${filters.search}%`);
    }

    if (filters.dateRange.from) {
      query = query.gte("created_at", filters.dateRange.from.toISOString());
    }

    if (filters.dateRange.to) {
      query = query.lte("created_at", filters.dateRange.to.toISOString());
    }

    const { data, error } = await query;
    
    if (error) {
      toast.error("Satın alma siparişleri yüklenirken hata oluştu");
      throw error;
    }
    
    return data;
  };

  const fetchPurchaseOrderItems = async (orderId: string): Promise<PurchaseOrderItem[]> => {
    const { data, error } = await supabase
      .from("purchase_order_items")
      .select("*")
      .eq("po_id", orderId);

    if (error) {
      toast.error("Sipariş öğeleri yüklenirken hata oluştu");
      throw error;
    }

    return data;
  };

  const fetchPurchaseOrderById = async (id: string): Promise<PurchaseOrder> => {
    const { data, error } = await supabase
      .from("purchase_orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      toast.error("Satın alma siparişi yüklenirken hata oluştu");
      throw error;
    }

    return data;
  };

  const createPurchaseOrder = async (orderData: PurchaseOrderFormData) => {
    const { items, ...orderDetails } = orderData;
    
    // Get current user from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Kullanıcı kimliği alınamadı");
      throw new Error("User not authenticated");
    }
    
    // Create the order first
    const { data: order, error: orderError } = await supabase
      .from("purchase_orders")
      .insert([
        { ...orderDetails, issued_by: user.id }
      ])
      .select()
      .single();

    if (orderError) {
      toast.error("Satın alma siparişi oluşturulurken hata oluştu");
      throw orderError;
    }

    // Then create all items
    const itemsWithOrderId = items.map(item => ({
      ...item,
      po_id: order.id
    }));

    const { error: itemsError } = await supabase
      .from("purchase_order_items")
      .insert(itemsWithOrderId);

    if (itemsError) {
      toast.error("Sipariş öğeleri eklenirken hata oluştu");
      throw itemsError;
    }

    toast.success("Satın alma siparişi başarıyla oluşturuldu");
    return order;
  };

  const updatePurchaseOrder = async ({ id, data }: { id: string, data: Partial<PurchaseOrderFormData> }) => {
    const { items, ...orderDetails } = data as any;
    
    // Update the order details
    const { error: orderError } = await supabase
      .from("purchase_orders")
      .update(orderDetails)
      .eq("id", id);

    if (orderError) {
      toast.error("Satın alma siparişi güncellenirken hata oluştu");
      throw orderError;
    }

    // If items are provided, handle them
    if (items && items.length > 0) {
      // First, delete the existing items
      const { error: deleteError } = await supabase
        .from("purchase_order_items")
        .delete()
        .eq("po_id", id);

      if (deleteError) {
        toast.error("Mevcut sipariş öğeleri silinirken hata oluştu");
        throw deleteError;
      }

      // Then insert the new items
      const itemsWithOrderId = items.map((item: any) => ({
        ...item,
        po_id: id
      }));

      const { error: itemsError } = await supabase
        .from("purchase_order_items")
        .insert(itemsWithOrderId);

      if (itemsError) {
        toast.error("Sipariş öğeleri eklenirken hata oluştu");
        throw itemsError;
      }
    }

    toast.success("Satın alma siparişi başarıyla güncellendi");
    return { id };
  };

  const updateOrderStatus = async ({ id, status }: { id: string, status: PurchaseOrderStatus }) => {
    const { error } = await supabase
      .from("purchase_orders")
      .update({ status })
      .eq("id", id);

    if (error) {
      toast.error("Sipariş durumu güncellenirken hata oluştu");
      throw error;
    }

    toast.success("Sipariş durumu başarıyla güncellendi");
    return { id };
  };

  const updateReceiptQuantities = async ({ 
    id, 
    items 
  }: { 
    id: string, 
    items: { id: string, received_quantity: number }[] 
  }) => {
    // Update each item one by one (could be optimized with a transaction)
    for (const item of items) {
      const { error } = await supabase
        .from("purchase_order_items")
        .update({ received_quantity: item.received_quantity })
        .eq("id", item.id);
      
      if (error) {
        toast.error("Teslim alınan miktar güncellenirken hata oluştu");
        throw error;
      }
    }
    
    // Check if all items are fully received
    const { data: orderItems, error: itemsError } = await supabase
      .from("purchase_order_items")
      .select("quantity, received_quantity")
      .eq("po_id", id);
    
    if (itemsError) {
      toast.error("Sipariş öğeleri kontrol edilirken hata oluştu");
      throw itemsError;
    }
    
    const allItemsReceived = orderItems.every(item => item.received_quantity >= item.quantity);
    const anyItemReceived = orderItems.some(item => item.received_quantity > 0);
    
    // Update order status based on receipt status
    let newStatus: PurchaseOrderStatus = 'sent';
    if (allItemsReceived) {
      newStatus = 'received';
    } else if (anyItemReceived) {
      newStatus = 'partially_received';
    }
    
    await updateOrderStatus({ id, status: newStatus });
    
    toast.success("Teslim alınan miktarlar başarıyla güncellendi");
    return { id };
  };

  const deletePurchaseOrder = async (id: string) => {
    // Delete the order (cascade will delete items)
    const { error } = await supabase
      .from("purchase_orders")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Satın alma siparişi silinirken hata oluştu");
      throw error;
    }

    toast.success("Satın alma siparişi başarıyla silindi");
    return { id };
  };

  const { data: orders, isLoading, error, refetch } = useQuery({
    queryKey: ['purchaseOrders', filters],
    queryFn: fetchPurchaseOrders,
  });

  const fetchOrderWithItems = async (id: string) => {
    const order = await fetchPurchaseOrderById(id);
    const items = await fetchPurchaseOrderItems(id);
    return { ...order, items };
  };

  const getOrderWithItems = (id: string) => {
    return useQuery({
      queryKey: ['purchaseOrder', id],
      queryFn: () => fetchOrderWithItems(id),
    });
  };

  const createOrderMutation = useMutation({
    mutationFn: createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: updatePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });

  const updateReceiptMutation = useMutation({
    mutationFn: updateReceiptQuantities,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: deletePurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
    },
  });

  return {
    orders,
    isLoading,
    error,
    filters,
    setFilters,
    refetch,
    getOrderWithItems,
    createOrderMutation,
    updateOrderMutation,
    updateStatusMutation,
    updateReceiptMutation,
    deleteOrderMutation,
  };
};
