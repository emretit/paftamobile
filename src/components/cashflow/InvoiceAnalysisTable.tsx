import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const InvoiceAnalysisTable = () => {
  // Sample data - in real app this would come from API
  const monthlyData = [
    {
      month: "01-OCAK",
      purchaseVAT: 223924.79,
      salesVAT: 315203.25,
      vatDifference: 91278.46,
      purchaseInvoice: 1343548.91,
      returnsReceived: 0.00,
      salesInvoice: 1881616.31,
      returnsGiven: 47003.20,
      profitLoss: 440626.65
    },
    {
      month: "02-ŞUBAT",
      purchaseVAT: 203310.91,
      salesVAT: 386568.51,
      vatDifference: 183257.60,
      purchaseInvoice: 1221631.16,
      returnsReceived: 0.00,
      salesInvoice: 2317241.60,
      returnsGiven: 4169.47,
      profitLoss: 947371.84
    },
    {
      month: "03-MART",
      purchaseVAT: 185077.36,
      salesVAT: 345230.20,
      vatDifference: 160152.84,
      purchaseInvoice: 1111569.43,
      returnsReceived: 0.00,
      salesInvoice: 2068614.73,
      returnsGiven: 2766.65,
      profitLoss: 819955.35
    },
    {
      month: "04-NİSAN",
      purchaseVAT: 120235.78,
      salesVAT: 283832.52,
      vatDifference: 163596.74,
      purchaseInvoice: 723414.71,
      returnsReceived: 0.00,
      salesInvoice: 1712635.44,
      returnsGiven: 59472.46,
      profitLoss: 857928.37
    },
    {
      month: "05-MAYIS",
      purchaseVAT: 168642.88,
      salesVAT: 314755.36,
      vatDifference: 146112.48,
      purchaseInvoice: 1012357.21,
      returnsReceived: 0.00,
      salesInvoice: 1888532.10,
      returnsGiven: 0.00,
      profitLoss: 743546.87
    },
    {
      month: "06-HAZİRAN",
      purchaseVAT: 110047.53,
      salesVAT: 293848.22,
      vatDifference: 183800.69,
      purchaseInvoice: 684440.98,
      returnsReceived: 0.00,
      salesInvoice: 1719528.98,
      returnsGiven: 47182.94,
      profitLoss: 844423.81
    },
    {
      month: "07-TEMMUZ",
      purchaseVAT: 15278.00,
      salesVAT: 129631.46,
      vatDifference: 114353.46,
      purchaseInvoice: 91668.04,
      returnsReceived: 0.00,
      salesInvoice: 777788.70,
      returnsGiven: 0.00,
      profitLoss: 484575.40
    }
  ];

  const formatTurkishCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-bold">Fatura Analizi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-3 text-left font-medium">Aylar</th>
                <th className="border p-3 text-right font-medium">Alış KDV</th>
                <th className="border p-3 text-right font-medium">Satış KDV</th>
                <th className="border p-3 text-right font-medium">Fark KDV</th>
                <th className="border p-3 text-right font-medium">Alış Faturası</th>
                <th className="border p-3 text-right font-medium">İade Alınan</th>
                <th className="border p-3 text-right font-medium">Satış Faturası</th>
                <th className="border p-3 text-right font-medium">İade Verilen</th>
                <th className="border p-3 text-right font-medium">Kar\Zarar</th>
              </tr>
            </thead>
            <tbody>
              {monthlyData.map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border p-3 font-medium">{row.month}</td>
                  <td className="border p-3 text-right">{formatTurkishCurrency(row.purchaseVAT)}</td>
                  <td className="border p-3 text-right">{formatTurkishCurrency(row.salesVAT)}</td>
                  <td className="border p-3 text-right">{formatTurkishCurrency(row.vatDifference)}</td>
                  <td className="border p-3 text-right">{formatTurkishCurrency(row.purchaseInvoice)}</td>
                  <td className="border p-3 text-right">{formatTurkishCurrency(row.returnsReceived)}</td>
                  <td className="border p-3 text-right">{formatTurkishCurrency(row.salesInvoice)}</td>
                  <td className="border p-3 text-right">{formatTurkishCurrency(row.returnsGiven)}</td>
                  <td className="border p-3 text-right">
                    <Badge variant={row.profitLoss > 0 ? "default" : "destructive"}>
                      {formatTurkishCurrency(row.profitLoss)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvoiceAnalysisTable;