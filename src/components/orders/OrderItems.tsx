
import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface OrderItem {
  id: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_rate?: number;
  discount_rate?: number;
  total_price: number;
  currency?: string;
  delivered?: boolean;
}

interface OrderItemsProps {
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
  currency: string;
}

const OrderItems: React.FC<OrderItemsProps> = ({
  items,
  onItemsChange,
  currency
}) => {
  const handleAddItem = () => {
    const newItem: OrderItem = {
      id: uuidv4(),
      name: "",
      quantity: 1,
      unit_price: 0,
      tax_rate: 18,
      discount_rate: 0,
      total_price: 0,
      currency: currency,
      delivered: false
    };
    
    onItemsChange([...items, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    onItemsChange(items.filter(item => item.id !== id));
  };

  const handleItemChange = (id: string, field: keyof OrderItem, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total if quantity, unit_price, discount_rate or tax_rate changed
        if (field === "quantity" || field === "unit_price" || field === "discount_rate" || field === "tax_rate") {
          const quantity = Number(updatedItem.quantity);
          const unitPrice = Number(updatedItem.unit_price);
          const discountRate = Number(updatedItem.discount_rate || 0);
          const taxRate = Number(updatedItem.tax_rate || 0);
          
          // Apply discount
          const discountedPrice = unitPrice * (1 - discountRate / 100);
          // Calculate total with tax
          updatedItem.total_price = quantity * discountedPrice * (1 + taxRate / 100);
        }
        
        return updatedItem;
      }
      return item;
    });
    
    onItemsChange(updatedItems);
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + Number(item.total_price), 0);
  };

  const calculateTax = () => {
    return items.reduce((sum, item) => {
      const taxRate = Number(item.tax_rate || 0) / 100;
      const quantity = Number(item.quantity);
      const unitPrice = Number(item.unit_price);
      const discountRate = Number(item.discount_rate || 0) / 100;
      const discountedPrice = unitPrice * (1 - discountRate);
      
      return sum + (quantity * discountedPrice * taxRate);
    }, 0);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const taxRateOptions = [
    { value: 0, label: "%0" },
    { value: 1, label: "%1" },
    { value: 8, label: "%8" },
    { value: 10, label: "%10" },
    { value: 18, label: "%18" },
    { value: 20, label: "%20" },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 text-left">Ürün/Hizmet</th>
              <th className="py-3 px-4 text-right">Miktar</th>
              <th className="py-3 px-4 text-right">Birim Fiyat</th>
              <th className="py-3 px-4 text-center">KDV %</th>
              <th className="py-3 px-4 text-center">İndirim %</th>
              <th className="py-3 px-4 text-right">Toplam</th>
              <th className="py-3 px-4 text-center">Teslim</th>
              <th className="py-3 px-4 text-center">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {items.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-4 px-4 text-center text-gray-500">
                  Sipariş kalemi bulunmamaktadır.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <Input
                      value={item.name}
                      onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                      placeholder="Ürün/Hizmet adı"
                      className="border-0 bg-transparent focus-visible:ring-0"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(item.id, "quantity", Number(e.target.value))}
                      className="text-right border-0 bg-transparent focus-visible:ring-0 w-20"
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="relative">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(item.id, "unit_price", Number(e.target.value))}
                        className="text-right border-0 bg-transparent focus-visible:ring-0 pr-10 w-32"
                      />
                      <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none">
                        <span className="text-gray-500 text-sm">
                          {currency === "TRY" ? "₺" : 
                           currency === "USD" ? "$" : 
                           currency === "EUR" ? "€" : 
                           currency === "GBP" ? "£" : currency}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Select 
                      value={String(item.tax_rate || 18)} 
                      onValueChange={(value) => handleItemChange(item.id, "tax_rate", Number(value))}
                    >
                      <SelectTrigger className="border-0 bg-transparent focus-visible:ring-0 h-8 w-full">
                        <SelectValue placeholder="KDV" />
                      </SelectTrigger>
                      <SelectContent>
                        {taxRateOptions.map((option) => (
                          <SelectItem key={option.value} value={String(option.value)}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 px-4">
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={item.discount_rate || 0}
                      onChange={(e) => handleItemChange(item.id, "discount_rate", Math.min(100, Number(e.target.value) || 0))}
                      className="text-right border-0 bg-transparent focus-visible:ring-0 w-20"
                    />
                  </td>
                  <td className="py-3 px-4 text-right font-medium">
                    {formatCurrency(item.total_price)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Checkbox
                      checked={item.delivered}
                      onCheckedChange={(checked) => handleItemChange(item.id, "delivered", !!checked)}
                    />
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveItem(item.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center">
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          onClick={handleAddItem}
          className="flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Kalem Ekle
        </Button>

        <div className="space-y-1 bg-gray-50 p-4 rounded-md w-64">
          <div className="flex justify-between text-sm">
            <span>Ara Toplam:</span>
            <span>{formatCurrency(calculateSubtotal())}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>KDV:</span>
            <span>{formatCurrency(calculateTax())}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Genel Toplam:</span>
            <span>{formatCurrency(calculateSubtotal())}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderItems;
