import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "@/types/customer";
import { Building, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEinvoiceMukellefCheck } from "@/hooks/useEinvoiceMukellefCheck";
import { useEffect } from "react";

interface CompanyInformationCardProps {
  formData: CustomerFormData;
  setFormData: (data: CustomerFormData) => void;
}

const CompanyInformationCard = ({ formData, setFormData }: CompanyInformationCardProps) => {
  const { checkEinvoiceMukellef, isChecking, result } = useEinvoiceMukellefCheck();

  useEffect(() => {
    if (result?.isEinvoiceMukellef && result.data?.aliasName) {
      setFormData({
        ...formData,
        einvoice_alias_name: result.data.aliasName
      });
    }
  }, [result]);

  const handleTaxNumberCheck = async () => {
    if (formData.tax_number && formData.tax_number.length >= 10) {
      await checkEinvoiceMukellef(formData.tax_number);
    }
  };

  // Only show for corporate customers
  if (formData.type !== 'kurumsal') {
    return null;
  }

  return (
    <Card className="shadow-sm border-l-4 border-l-amber-500">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Building className="w-5 h-5 text-amber-500" />
          Kurumsal Bilgiler
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tax_number" className="text-sm font-medium flex items-center gap-1">
            <FileText className="w-3 h-3 text-amber-500" />
            Vergi Numarası
          </Label>
          <div className="flex gap-2">
            <Input
              id="tax_number"
              value={formData.tax_number}
              onChange={(e) => setFormData({ ...formData, tax_number: e.target.value })}
              placeholder="1234567890"
              maxLength={11}
              className="transition-all duration-200 focus:ring-2 focus:ring-amber-500/20"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleTaxNumberCheck}
              disabled={isChecking || !formData.tax_number || formData.tax_number.length < 10}
              className="px-3"
            >
              <Search className="w-4 h-4" />
              {isChecking ? "Kontrol ediliyor..." : "Kontrol Et"}
            </Button>
          </div>
          {result && (
            <div className={`p-2 rounded text-xs ${
              result.isEinvoiceMukellef 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-orange-50 text-orange-700 border border-orange-200'
            }`}>
              {result.isEinvoiceMukellef 
                ? `✓ E-Fatura Mükellefi (${result.data?.companyName || 'Bilinmiyor'})` 
                : '⚠ E-Fatura Mükellefi Değil'
              }
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="tax_office" className="text-sm font-medium flex items-center gap-1">
            <Building className="w-3 h-3 text-amber-500" />
            Vergi Dairesi
          </Label>
          <Input
            id="tax_office"
            value={formData.tax_office}
            onChange={(e) => setFormData({ ...formData, tax_office: e.target.value })}
            placeholder="Beşiktaş Vergi Dairesi"
            className="transition-all duration-200 focus:ring-2 focus:ring-amber-500/20"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default CompanyInformationCard;