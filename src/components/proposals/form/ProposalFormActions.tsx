
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { AlertTriangle } from "lucide-react";

export interface ProposalFormActionsProps {
  isNew: boolean;
  saving: boolean;
  onSave: () => void;
  onBack: () => void;
  isFormDirty?: boolean;
}

const ProposalFormActions = ({ isNew, saving, onSave, onBack, isFormDirty = false }: ProposalFormActionsProps) => {
  return (
    <div className="flex items-center justify-between gap-2 pt-6 border-t mt-6">
      <Button
        type="button"
        variant="outline"
        onClick={onBack}
        disabled={saving}
      >
        İptal
      </Button>
      
      <div className="flex items-center gap-2">
        {isFormDirty ? (
          <Dialog>
            <DialogTrigger asChild>
              <Button type="button" disabled={saving}>
                {saving ? "Kaydediliyor..." : (isNew ? "Teklifi Oluştur" : "Değişiklikleri Kaydet")}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Teklifi Kaydet</DialogTitle>
                <DialogDescription>
                  Bu işlem teklifi {isNew ? "oluşturacak" : "güncelleyecek"}. Devam etmek istediğinize emin misiniz?
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center gap-2 p-4 bg-amber-50 text-amber-800 rounded-md">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <p className="text-sm">
                  {isNew 
                    ? "Yeni teklif oluşturulduktan sonra temel bilgiler değiştirilemez." 
                    : "Bu değişiklik müşteri tarafından görüntülenebilir."}
                </p>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <DialogClose asChild>
                  <Button variant="outline">İptal</Button>
                </DialogClose>
                <Button 
                  onClick={onSave} 
                  disabled={saving}
                >
                  {saving ? "Kaydediliyor..." : "Onayla ve Kaydet"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        ) : (
          <Button
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Kaydediliyor..." : (isNew ? "Teklifi Oluştur" : "Değişiklikleri Kaydet")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProposalFormActions;
