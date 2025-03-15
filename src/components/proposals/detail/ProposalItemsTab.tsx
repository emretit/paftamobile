
import { Proposal } from "@/types/proposal";
import { formatMoney } from "@/components/deals/utils";

interface ProposalItemsTabProps {
  proposal: Proposal;
}

export const ProposalItemsTab = ({ proposal }: ProposalItemsTabProps) => {
  const items = proposal.items || [];

  if (!items.length) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        Bu teklifte herhangi bir kalem bulunmamaktadır.
      </div>
    );
  }

  return (
    <div className="mt-4">
      <div className="rounded-md border">
        <div className="grid grid-cols-12 gap-2 p-3 text-sm font-medium text-muted-foreground bg-muted/30">
          <div className="col-span-5">Ürün/Hizmet</div>
          <div className="col-span-2 text-right">Miktar</div>
          <div className="col-span-2 text-right">Birim Fiyat</div>
          <div className="col-span-1 text-right">KDV %</div>
          <div className="col-span-2 text-right">Toplam</div>
        </div>
        
        <div className="divide-y">
          {items.map((item, index) => (
            <div key={item.id || index} className="grid grid-cols-12 gap-2 p-3 text-sm items-center">
              <div className="col-span-5">{item.name}</div>
              <div className="col-span-2 text-right">{item.quantity}</div>
              <div className="col-span-2 text-right">{formatMoney(item.unit_price)}</div>
              <div className="col-span-1 text-right">{item.tax_rate}%</div>
              <div className="col-span-2 text-right font-medium">{formatMoney(item.total_price)}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <div className="w-1/3 space-y-2">
          <div className="flex justify-between text-sm">
            <span>Ara Toplam:</span>
            <span>
              {formatMoney(items.reduce((sum, item) => sum + item.total_price, 0))}
            </span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span>KDV:</span>
            <span>
              {formatMoney(items.reduce((sum, item) => {
                const taxAmount = (item.total_price * item.tax_rate) / 100;
                return sum + taxAmount;
              }, 0))}
            </span>
          </div>
          
          <div className="flex justify-between font-medium border-t pt-2">
            <span>Genel Toplam:</span>
            <span>
              {formatMoney(items.reduce((sum, item) => {
                const itemWithTax = item.total_price * (1 + item.tax_rate / 100);
                return sum + itemWithTax;
              }, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
