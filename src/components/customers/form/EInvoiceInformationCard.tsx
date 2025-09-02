import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomerFormData } from "@/types/customer";
import { FileText, Mail } from "lucide-react";

interface EInvoiceInformationCardProps {
  formData: CustomerFormData;
  setFormData: (data: CustomerFormData) => void;
}

const EInvoiceInformationCard = ({ formData, setFormData }: EInvoiceInformationCardProps) => {
  return (
    <Card className="shadow-sm border-l-4 border-l-purple-500">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <FileText className="w-5 h-5 text-purple-500" />
          E-Fatura Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="einvoice_alias_name" className="text-sm font-medium flex items-center gap-1">
            <Mail className="w-3 h-3 text-purple-500" />
            E-Fatura Alias Adresi
          </Label>
          <Input
            id="einvoice_alias_name"
            value={formData.einvoice_alias_name}
            onChange={(e) => setFormData({ ...formData, einvoice_alias_name: e.target.value })}
            placeholder="urn:mail:defaultpk-firma@mersel.io"
            className="font-mono text-sm transition-all duration-200 focus:ring-2 focus:ring-purple-500/20"
          />
          <p className="text-xs text-muted-foreground">
            E-fatura gönderimlerinde kullanılacak alias adresi. Kurumsal müşteriler için vergi numarası kontrolü yapıldığında otomatik doldurulur.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default EInvoiceInformationCard;