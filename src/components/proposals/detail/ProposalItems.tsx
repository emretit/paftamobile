
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { ProposalItem } from "@/types/proposal";

interface ProposalItemsProps {
  proposalId: string;
}

const ProposalItems = ({ proposalId }: ProposalItemsProps) => {
  const [items, setItems] = useState<ProposalItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const { data, error } = await supabase
          .from("proposal_items")
          .select("*")
          .eq("proposal_id", proposalId);
        
        if (error) throw error;
        setItems(data as ProposalItem[] || []);
      } catch (error) {
        console.error("Error fetching proposal items:", error);
      } finally {
        setLoading(false);
      }
    };

    if (proposalId) fetchItems();
  }, [proposalId]);

  if (loading) {
    return <div className="py-4 text-center text-gray-500">Yükleniyor...</div>;
  }

  if (!items.length) {
    return <div className="py-4 text-center text-gray-500">Bu teklif için kalem bulunmamaktadır.</div>;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  return (
    <Card className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Ürün/Hizmet</TableHead>
            <TableHead className="text-right">Miktar</TableHead>
            <TableHead className="text-right">Birim Fiyat</TableHead>
            <TableHead className="text-right">Vergi (%)</TableHead>
            <TableHead className="text-right">Toplam</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-right">{item.quantity}</TableCell>
              <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
              <TableCell className="text-right">%{item.tax_rate}</TableCell>
              <TableCell className="text-right font-medium">{formatCurrency(item.total_price)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
};

export default ProposalItems;
