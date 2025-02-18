
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface InternalNotesProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const InternalNotes = ({ value, onChange }: InternalNotesProps) => {
  return (
    <div>
      <Label htmlFor="internalNotes">İç Notlar</Label>
      <Textarea
        id="internalNotes"
        value={value}
        onChange={onChange}
        placeholder="Satış ekibine özel notlar..."
        className="mt-1"
      />
    </div>
  );
};

export default InternalNotes;
