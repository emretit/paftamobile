
import React from "react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { ProposalFormData } from "@/types/proposal-form";

interface ProposalTemplateFormDetailsProps {
  register: UseFormRegister<ProposalFormData>;
  errors: FieldErrors<ProposalFormData>;
}

const ProposalTemplateFormDetails: React.FC<ProposalTemplateFormDetailsProps> = ({
  register,
  errors,
}) => {
  const generateProposalNumber = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `TKL${year}${month}${day}${random}`;
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      <div>
        <Label htmlFor="proposal_number" className="text-sm">Teklif Numarası</Label>
        <Input 
          id="proposal_number"
          defaultValue={generateProposalNumber()}
          readOnly
          className="bg-muted h-9"
        />
      </div>
      
      <div>
        <Label htmlFor="title" className="text-sm">Teklif Başlığı</Label>
        <Input 
          id="title" 
          {...register("title", { required: "Teklif başlığı gereklidir" })} 
          placeholder="Teklif başlığını girin"
          className={`h-9 ${errors.title ? "border-red-500" : ""}`}
        />
        {errors.title && <span className="text-red-500 text-xs">{errors.title.message}</span>}
      </div>
      
      <div>
        <Label htmlFor="proposal_date" className="text-sm">Teklif Tarihi</Label>
        <Input 
          id="proposal_date"
          value={format(new Date(), "dd.MM.yyyy", { locale: tr })}
          readOnly
          className="bg-muted h-9"
        />
      </div>
    </div>
  );
};

export default ProposalTemplateFormDetails;
