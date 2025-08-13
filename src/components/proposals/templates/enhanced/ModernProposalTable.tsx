import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Package, 
  Calculator, 
  Percent, 
  DollarSign,
  Info,
  AlertTriangle
} from "lucide-react";
import { ProposalItem } from "@/types/proposal";
import { formatCurrency } from "@/utils/formatters";
import { cn } from "@/lib/utils";

interface ModernProposalTableProps {
  items: ProposalItem[];
  onItemsChange: (items: ProposalItem[]) => void;
  globalCurrency?: string;
  showAdvancedFeatures?: boolean;
}

const ModernProposalTable: React.FC<ModernProposalTableProps> = ({
  items,
  onItemsChange,
  globalCurrency = "TRY",
  showAdvancedFeatures = true
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [globalDiscount, setGlobalDiscount] = useState<number>(0);
  const [globalDiscountType, setGlobalDiscountType] = useState<'percentage' | 'amount'>('percentage');

  const addNewItem = () => {
    const newItem: ProposalItem = {
      id: `item-${Date.now()}`,
      name: "",
      description: "",
      quantity: 1,
      unit: "adet",
      unit_price: 0,
      total_price: 0,
      currency: globalCurrency,
      tax_rate: 20
    };
    onItemsChange([...items, newItem]);
    setEditingId(newItem.id);
  };

  const updateItem = (id: string, field: keyof ProposalItem, value: any) => {
    const updatedItems = items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Recalculate total price
        if (field === 'quantity' || field === 'unit_price') {
          updatedItem.total_price = updatedItem.quantity * updatedItem.unit_price;
        }
        
        return updatedItem;
      }
      return item;
    });
    onItemsChange(updatedItems);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      onItemsChange(items.filter(item => item.id !== id));
    }
  };

  const duplicateItem = (id: string) => {
    const itemToDuplicate = items.find(item => item.id === id);
    if (itemToDuplicate) {
      const duplicatedItem: ProposalItem = {
        ...itemToDuplicate,
        id: `item-${Date.now()}`,
        name: `${itemToDuplicate.name} (Kopya)`
      };
      onItemsChange([...items, duplicatedItem]);
    }
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + item.total_price, 0);
  const discountAmount = globalDiscountType === 'percentage' 
    ? subtotal * (globalDiscount / 100)
    : globalDiscount;
  const afterDiscount = subtotal - discountAmount;
  const taxAmount = items.reduce((sum, item) => {
    const itemAfterDiscount = item.total_price * (1 - (globalDiscount / 100));
    return sum + (itemAfterDiscount * (item.tax_rate || 0) / 100);
  }, 0);
  const grandTotal = afterDiscount + taxAmount;

  const isEmpty = items.length === 0 || items.every(item => !item.name.trim());

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold">Teklif Kalemleri</h3>
          <Badge variant="secondary">{items.length} kalem</Badge>
        </div>
        
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addNewItem}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Kalem Ekle
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Yeni teklif kalemi ekle</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Main Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-[40px]">#</TableHead>
                <TableHead className="min-w-[200px]">Ürün/Hizmet</TableHead>
                <TableHead className="w-[100px] text-center">Miktar</TableHead>
                <TableHead className="w-[80px] text-center">Birim</TableHead>
                <TableHead className="w-[120px] text-right">Birim Fiyat</TableHead>
                {showAdvancedFeatures && (
                  <TableHead className="w-[100px] text-center">Vergi (%)</TableHead>
                )}
                <TableHead className="w-[130px] text-right">Toplam</TableHead>
                <TableHead className="w-[100px] text-center">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isEmpty ? (
                <TableRow>
                  <TableCell 
                    colSpan={showAdvancedFeatures ? 8 : 7} 
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                      <Package className="h-8 w-8" />
                      <div>
                        <p className="font-medium">Henüz teklif kalemi yok</p>
                        <p className="text-sm">İlk kaleminizi eklemek için "Kalem Ekle" butonunu kullanın</p>
                      </div>
                      <Button onClick={addNewItem} variant="outline" size="sm" className="gap-2">
                        <Plus className="h-4 w-4" />
                        İlk Kalemi Ekle
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item, index) => (
                  <TableRow 
                    key={item.id}
                    className={cn(
                      "group hover:bg-muted/30 transition-colors",
                      editingId === item.id && "bg-blue-50/50 border-l-4 border-l-blue-400"
                    )}
                  >
                    <TableCell className="font-mono text-sm text-muted-foreground">
                      {String(index + 1).padStart(2, '0')}
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-2">
                        <Input
                          placeholder="Ürün/hizmet adı"
                          value={item.name}
                          onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                          onFocus={() => setEditingId(item.id)}
                          onBlur={() => setEditingId(null)}
                          className={cn(
                            "border-0 bg-transparent p-0 h-auto font-medium focus-visible:ring-0",
                            !item.name && "text-muted-foreground"
                          )}
                        />
                        <Input
                          placeholder="Açıklama (opsiyonel)"
                          value={item.description || ''}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="border-0 bg-transparent p-0 h-auto text-sm text-muted-foreground focus-visible:ring-0"
                        />
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="text-center h-8 w-20"
                      />
                    </TableCell>
                    
                    <TableCell>
                      <Select
                        value={item.unit}
                        onValueChange={(value) => updateItem(item.id, 'unit', value)}
                      >
                        <SelectTrigger className="h-8 w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="adet">Adet</SelectItem>
                          <SelectItem value="kg">Kg</SelectItem>
                          <SelectItem value="metre">Metre</SelectItem>
                          <SelectItem value="saat">Saat</SelectItem>
                          <SelectItem value="gün">Gün</SelectItem>
                          <SelectItem value="ay">Ay</SelectItem>
                          <SelectItem value="paket">Paket</SelectItem>
                          <SelectItem value="set">Set</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.unit_price}
                          onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                          className="text-right h-8 w-24"
                        />
                        <span className="text-xs text-muted-foreground min-w-[30px]">
                          {item.currency || globalCurrency}
                        </span>
                      </div>
                    </TableCell>
                    
                    {showAdvancedFeatures && (
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={item.tax_rate || 0}
                            onChange={(e) => updateItem(item.id, 'tax_rate', parseFloat(e.target.value) || 0)}
                            className="text-center h-8 w-16"
                          />
                          <Percent className="h-3 w-3 text-muted-foreground" />
                        </div>
                      </TableCell>
                    )}
                    
                    <TableCell>
                      <div className="text-right font-medium">
                        {formatCurrency(item.total_price, item.currency || globalCurrency)}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => duplicateItem(item.id)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Kopyala</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(item.id)}
                                disabled={items.length <= 1}
                                className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Sil</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Calculations Summary */}
      {!isEmpty && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Global Discount Settings */}
          {showAdvancedFeatures && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Genel İndirim
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Select
                    value={globalDiscountType}
                    onValueChange={(value: 'percentage' | 'amount') => setGlobalDiscountType(value)}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Yüzde (%)</SelectItem>
                      <SelectItem value="amount">Tutar</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={globalDiscount}
                    onChange={(e) => setGlobalDiscount(parseFloat(e.target.value) || 0)}
                    placeholder="İndirim miktarı"
                    className="flex-1"
                  />
                </div>
                
                {globalDiscount > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-amber-800">
                      <Info className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        İndirim Tutarı: {formatCurrency(discountAmount, globalCurrency)}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Total Calculations */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Hesaplama Özeti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Ara Toplam:</span>
                  <span className="font-medium">{formatCurrency(subtotal, globalCurrency)}</span>
                </div>
                
                {globalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-amber-600">
                    <span>İndirim:</span>
                    <span className="font-medium">-{formatCurrency(discountAmount, globalCurrency)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span>Net Tutar:</span>
                  <span className="font-medium">{formatCurrency(afterDiscount, globalCurrency)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span>KDV:</span>
                  <span className="font-medium">{formatCurrency(taxAmount, globalCurrency)}</span>
                </div>
                
                <hr className="border-muted" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Genel Toplam:</span>
                  <span className="text-primary">{formatCurrency(grandTotal, globalCurrency)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ModernProposalTable;