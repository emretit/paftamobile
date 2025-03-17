
import { useState, useEffect } from "react";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown, X } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { TaskType } from "@/types/task";
import { mockCrmService } from "@/services/mockCrmService";

interface TaskRelatedItemProps {
  form: any;
  taskType: TaskType;
  defaultRelatedItemId?: string;
  defaultRelatedItemTitle?: string;
}

export const TaskRelatedItem = ({
  form,
  taskType,
  defaultRelatedItemId,
  defaultRelatedItemTitle,
}: TaskRelatedItemProps) => {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<{ id: string; title: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRelatedItems = async () => {
      setIsLoading(true);
      try {
        let data: any[] = [];
        
        if (taskType === "opportunity") {
          const result = await mockCrmService.getOpportunities();
          if (result.data) {
            data = result.data.map((item: any) => ({
              id: item.id,
              title: item.title
            }));
          }
        } else if (taskType === "proposal") {
          const { data: proposals } = await supabase.from("proposals").select("id, title");
          if (proposals) {
            data = proposals.map((item: any) => ({
              id: item.id,
              title: item.title
            }));
          }
        }
        
        setItems(data);
      } catch (error) {
        console.error("Error fetching related items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (taskType === "opportunity" || taskType === "proposal") {
      fetchRelatedItems();
    } else {
      setItems([]);
    }
  }, [taskType]);

  const shouldShow = taskType === "opportunity" || taskType === "proposal";

  if (!shouldShow) {
    // Clear related item values when not showing
    if (form.getValues("related_item_id")) {
      form.setValue("related_item_id", undefined);
      form.setValue("related_item_title", undefined);
    }
    return null;
  }

  return (
    <div>
      <FormField
        control={form.control}
        name="related_item_id"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>
              {taskType === "opportunity" ? "İlgili Fırsat" : "İlgili Teklif"}
            </FormLabel>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className={cn(
                      "justify-between",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value
                      ? items.find((item) => item.id === field.value)?.title ||
                        form.getValues("related_item_title") ||
                        "Seçin..."
                      : "Seçin..."}
                    {field.value ? (
                      <X
                        className="ml-2 h-4 w-4 shrink-0 opacity-50"
                        onClick={(e) => {
                          e.stopPropagation();
                          form.setValue("related_item_id", undefined);
                          form.setValue("related_item_title", undefined);
                        }}
                      />
                    ) : (
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    )}
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="p-0">
                <Command>
                  <CommandInput placeholder="Ara..." />
                  <CommandList>
                    <CommandEmpty>
                      {isLoading ? "Yükleniyor..." : "Sonuç bulunamadı"}
                    </CommandEmpty>
                    <CommandGroup>
                      {items.map((item) => (
                        <CommandItem
                          key={item.id}
                          value={item.id}
                          onSelect={() => {
                            form.setValue("related_item_id", item.id);
                            form.setValue("related_item_title", item.title);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              item.id === field.value
                                ? "opacity-100"
                                : "opacity-0"
                            )}
                          />
                          {item.title}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </FormItem>
        )}
      />
    </div>
  );
};

export default TaskRelatedItem;
