
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AdditionalChargesProps {
  discounts: number;
  onDiscountsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  additionalCharges: number;
  onAdditionalChargesChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const AdditionalCharges = ({
  discounts,
  onDiscountsChange,
  additionalCharges,
  onAdditionalChargesChange,
}: AdditionalChargesProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <Label htmlFor="discounts">İndirimler</Label>
        <Input
          id="discounts"
          type="number"
          value={discounts}
          onChange={onDiscountsChange}
          min="0"
          step="0.01"
        />
      </div>
      <div>
        <Label htmlFor="additionalCharges">Ek Ücretler</Label>
        <Input
          id="additionalCharges"
          type="number"
          value={additionalCharges}
          onChange={onAdditionalChargesChange}
          min="0"
          step="0.01"
        />
      </div>
    </div>
  );
};

export default AdditionalCharges;
