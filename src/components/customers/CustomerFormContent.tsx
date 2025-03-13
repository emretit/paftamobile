
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import CustomerFormFields from "./CustomerFormFields";
import { CustomerFormData } from "@/types/customer";

interface CustomerFormContentProps {
  formData: CustomerFormData;
  setFormData: (data: CustomerFormData) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isPending: boolean;
  isEdit: boolean;
  onCancel: () => void;
}

const CustomerFormContent = ({
  formData,
  setFormData,
  handleSubmit,
  isPending,
  isEdit,
  onCancel
}: CustomerFormContentProps) => {
  return (
    <Card className="max-w-2xl p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <CustomerFormFields formData={formData} setFormData={setFormData} />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            İptal
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Kaydediliyor..." : (isEdit ? "Güncelle" : "Kaydet")}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CustomerFormContent;
