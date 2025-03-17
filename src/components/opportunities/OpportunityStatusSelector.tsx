
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  OpportunityStatus, 
  opportunityStatusLabels, 
  opportunityStatusColors 
} from "@/types/crm";

const allStatuses: OpportunityStatus[] = [
  "new",
  "first_contact",
  "site_visit",
  "preparing_proposal",
  "proposal_sent",
  "accepted",
  "lost"
];

interface OpportunityStatusSelectorProps {
  currentStatus: OpportunityStatus;
  onStatusChange: (status: OpportunityStatus) => void;
  isUpdating?: boolean;
}

export const OpportunityStatusSelector = ({ 
  currentStatus, 
  onStatusChange,
  isUpdating = false
}: OpportunityStatusSelectorProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (selectedStatus: OpportunityStatus) => {
    if (selectedStatus !== currentStatus) {
      onStatusChange(selectedStatus);
    }
    setOpen(false);
  };

  const getColorClass = (status: OpportunityStatus) => {
    const colorClass = opportunityStatusColors[status] || "bg-gray-500";
    return colorClass.split(' ')[0]; // Get only the background color
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={isUpdating}
        >
          <div className="flex items-center">
            <span 
              className={`w-2 h-2 rounded-full mr-2 ${getColorClass(currentStatus)}`}
            />
            {opportunityStatusLabels[currentStatus] || currentStatus}
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Durum arayın..." />
          <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
          <CommandGroup>
            {allStatuses.map((status) => (
              <CommandItem
                key={status}
                value={status}
                onSelect={() => handleSelect(status)}
                className="flex items-center"
              >
                <span 
                  className={`w-2 h-2 rounded-full mr-2 ${getColorClass(status)}`}
                />
                {opportunityStatusLabels[status] || status}
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    currentStatus === status ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
