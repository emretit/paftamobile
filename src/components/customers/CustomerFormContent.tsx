
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
    <Card className="w-full max-w-7xl p-3 bg-gradient-to-br from-background to-muted/20 border shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-2">
        <CustomerFormFields formData={formData} setFormData={setFormData} />

        <div className="flex justify-end space-x-3 pt-2 border-t border-border/50">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="px-8 py-2"
          >
            İptal
          </Button>
          <Button 
            type="submit" 
            disabled={isPending}
            className="px-8 py-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
          >
            {isPending ? "Kaydediliyor..." : (isEdit ? "Güncelle" : "Kaydet")}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default CustomerFormContent;
