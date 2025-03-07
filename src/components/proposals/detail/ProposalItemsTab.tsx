
import { formatMoney } from "@/components/deals/utils";
import { Proposal, ProposalItem } from "@/types/proposal";

interface ProposalItemsTabProps {
  proposal: Proposal;
}

export const ProposalItemsTab = ({ proposal }: ProposalItemsTabProps) => {
  return (
    <div className="space-y-4">
      {proposal.items && Array.isArray(proposal.items) && proposal.items.length > 0 ? (
        <div className="rounded-md border">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Ürün</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Adet</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Birim Fiyat</th>
                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500">Toplam</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {proposal.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="px-3 py-2 text-sm">{item.name}</td>
                  <td className="px-3 py-2 text-sm text-right">{item.quantity}</td>
                  <td className="px-3 py-2 text-sm text-right">{formatMoney(item.unit_price)}</td>
                  <td className="px-3 py-2 text-sm text-right">{formatMoney(item.total_price)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 border-t">
              <tr>
                <td colSpan={3} className="px-3 py-2 text-sm font-medium text-right">Toplam</td>
                <td className="px-3 py-2 text-sm font-medium text-right">{formatMoney(proposal.total_value)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          Bu teklifte ürün bulunmuyor
        </div>
      )}
    </div>
  );
};
