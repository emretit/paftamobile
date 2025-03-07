
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PurchaseOrder, PurchaseOrderItem, PurchaseOrderFormData } from "@/types/purchase";
import { toast } from "sonner";

export const usePurchaseOrders = () => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({
    status: "",
    search: "",
    supplier: "",
    dateRange: { from: null, to: null } as { from: Date | null, to: Date | null }
  });

  const fetchPurchaseOrders = async (): Promise<PurchaseOrder[]> => {
    let query = supabase
      .from("purchase_orders")
      .select("*, suppliers(name)")
      .order("created_at", { ascending: false });

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.search) {
      query = query.or(`po_number.ilike.%${filters.search}%`);
    }

    if (filters.supplier) {
      query = query.eq("supplier_id", filters.supplier);
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
      .select("*, products(name, image_url)")
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
      .select("*, suppliers(name, email, address, mobile_phone, company)")
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
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Kullanıcı kimliği alınamadı");
      throw new Error("User not authenticated");
    }
    
    // Create the purchase order
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

    // Create order items
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

    // If created from a request, update the request status
    if (orderDetails.request_id) {
      const { error: requestUpdateError } = await supabase
        .from("purchase_requests")
        .update({ status: "converted" })
        .eq("id", orderDetails.request_id);

      if (requestUpdateError) {
        toast.error("Talep durumu güncellenirken hata oluştu");
        // We'll continue despite this error, since the PO is created
      }
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
      // Delete existing items
      const { error: deleteError } = await supabase
        .from("purchase_order_items")
        .delete()
        .eq("po_id", id);

      if (deleteError) {
        toast.error("Mevcut sipariş öğeleri silinirken hata oluştu");
        throw deleteError;
      }

      // Insert new items
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

  const updateOrderStatus = async ({ id, status }: { id: string, status: string }) => {
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

  const updateReceivedQuantities = async ({ 
    orderId, 
    items 
  }: { 
    orderId: string, 
    items: { id: string, received_quantity: number }[] 
  }) => {
    // Update each item's received quantity
    for (const item of items) {
      const { error } = await supabase
        .from("purchase_order_items")
        .update({ received_quantity: item.received_quantity })
        .eq("id", item.id);

      if (error) {
        toast.error(`Alınan miktar güncellenirken hata oluştu: ${error.message}`);
        throw error;
      }
    }

    // Determine if all items are fully received
    const { data: updatedItems, error: fetchError } = await supabase
      .from("purchase_order_items")
      .select("quantity, received_quantity")
      .eq("po_id", orderId);

    if (fetchError) {
      toast.error("Sipariş öğeleri kontrol edilirken hata oluştu");
      throw fetchError;
    }

    // Check if all items are fully received or partially received
    const isAllReceived = updatedItems.every(item => 
      parseFloat(item.received_quantity) >= parseFloat(item.quantity)
    );
    
    const isAnyReceived = updatedItems.some(item => 
      parseFloat(item.received_quantity) > 0
    );

    // Update order status based on receipt status
    let newStatus: PurchaseOrderStatus = "draft";
    if (isAllReceived) {
      newStatus = "received";
    } else if (isAnyReceived) {
      newStatus = "partially_received";
    }

    // Only update if there's a status change
    if (isAllReceived || isAnyReceived) {
      await updateOrderStatus({ id: orderId, status: newStatus });
    }

    toast.success("Alınan miktarlar başarıyla güncellendi");
    return { id: orderId };
  };

  const deletePurchaseOrder = async (id: string) => {
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
      queryClient.invalidateQueries({ queryKey: ['purchaseRequests'] });
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
    mutationFn: updateReceivedQuantities,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchaseOrders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
