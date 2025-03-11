
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
  isLoading: boolean;
  onClick: () => void;
}

export const SaveButton = ({ isLoading, onClick }: SaveButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="flex items-center gap-2" 
      onClick={onClick}
      disabled={isLoading}
    >
      <Save className="h-4 w-4" />
      {isLoading ? "Kaydediliyor..." : "Kaydet"}
    </Button>
  );
};
