
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaymentTerm } from "@/types/proposal-form";

interface PaymentTermsSelectProps {
  value: PaymentTerm;
  onChange: (value: PaymentTerm) => void;
}

const paymentTerms: { value: PaymentTerm; label: string }[] = [
  { value: "prepaid", label: "Peşin Ödeme" },
  { value: "net30", label: "30 Gün Vade" },
  { value: "net60", label: "60 Gün Vade" },
  { value: "custom", label: "Özel Vade" },
];

const PaymentTermsSelect = ({ value, onChange }: PaymentTermsSelectProps) => {
  return (
    <div>
      <Label htmlFor="paymentTerm">Ödeme Koşulları</Label>
      <Select value={value} onValueChange={(value) => onChange(value as PaymentTerm)}>
        <SelectTrigger>
          <SelectValue placeholder="Ödeme koşulu seçin" />
        </SelectTrigger>
        <SelectContent>
          {paymentTerms.map((term) => (
            <SelectItem key={term.value} value={term.value}>
              {term.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default PaymentTermsSelect;
