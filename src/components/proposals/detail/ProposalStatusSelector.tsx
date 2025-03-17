
import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { statusLabels, statusStyles, primaryProposalStatuses } from "../constants";
import { ProposalStatus } from "@/types/proposal";

interface ProposalStatusSelectorProps {
  currentStatus: ProposalStatus;
  onStatusChange: (status: ProposalStatus) => void;
  isUpdating?: boolean;
}

export const ProposalStatusSelector = ({ 
  currentStatus, 
  onStatusChange,
  isUpdating = false
}: ProposalStatusSelectorProps) => {
  const [open, setOpen] = useState(false);

  // Define the statuses that should be shown in the selector
  const availableStatuses: ProposalStatus[] = [
    ...primaryProposalStatuses,
    "accepted",
    "rejected",
    "expired", 
    "converted_to_order"
  ];

  const handleSelect = (selectedStatus: ProposalStatus) => {
    if (selectedStatus !== currentStatus) {
      onStatusChange(selectedStatus);
    }
    setOpen(false);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Teklif Durumu</label>
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
                className={`w-2 h-2 rounded-full mr-2 ${statusStyles[currentStatus]?.bg || "bg-gray-400"}`}
              />
              {statusLabels[currentStatus] || currentStatus}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Durum arayın..." />
            <CommandEmpty>Sonuç bulunamadı.</CommandEmpty>
            <CommandGroup>
              {availableStatuses.map((status) => (
                <CommandItem
                  key={status}
                  value={status}
                  onSelect={() => handleSelect(status)}
                  className="flex items-center"
                >
                  <span 
                    className={`w-2 h-2 rounded-full mr-2 ${statusStyles[status]?.bg || "bg-gray-400"}`}
                  />
                  {statusLabels[status] || status}
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
    </div>
  );
};
