
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SaveButtonProps {
  isLoading: boolean;
  onClick: (e: React.FormEvent) => void | Promise<void>;
}

export const SaveButton = ({ isLoading, onClick }: SaveButtonProps) => {
  return (
    <Button 
      type="submit" 
      className="flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-md transition-all" 
      onClick={onClick}
      disabled={isLoading}
    >
      <Save className="h-4 w-4" />
      {isLoading ? "Saving..." : "Save"}
    </Button>
  );
};
