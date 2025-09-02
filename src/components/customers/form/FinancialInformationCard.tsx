import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "@/types/customer";
import { DollarSign, TrendingUp } from "lucide-react";

interface FinancialInformationCardProps {
  formData: CustomerFormData;
  setFormData: (data: CustomerFormData) => void;
}

const FinancialInformationCard = ({ formData, setFormData }: FinancialInformationCardProps) => {
  return (
    <Card className="shadow-sm border-l-4 border-l-emerald-500 bg-gradient-to-br from-emerald-50/50 to-background">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <DollarSign className="w-5 h-5 text-emerald-500" />
          Finansal Bilgiler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="balance" className="text-sm font-medium flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            Başlangıç Bakiyesi (₺)
          </Label>
          <Input
            id="balance"
            type="number"
            step="0.01"
            value={formData.balance}
            onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
            placeholder="0.00"
            className="transition-all duration-200 focus:ring-2 focus:ring-emerald-500/20 bg-white/70"
          />
          <p className="text-xs text-muted-foreground">
            Müşterinin hesabındaki başlangıç bakiyesi
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FinancialInformationCard;