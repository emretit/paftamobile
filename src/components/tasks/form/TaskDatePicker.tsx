
import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { UseFormReturn } from "react-hook-form";

interface TaskDatePickerProps {
  form: UseFormReturn<any>;
  defaultValue?: string;
}

const TaskDatePicker = ({ form }: TaskDatePickerProps) => {
  const [date, setDate] = useState<Date | undefined>(
    form.getValues("due_date") ? new Date(form.getValues("due_date")) : undefined
  );

  return (
    <FormField
      control={form.control}
      name="due_date"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Bitiş Tarihi</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(new Date(field.value), "PP")
                  ) : (
                    <span>Tarih seçin</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  if (newDate) {
                    field.onChange(newDate.toISOString());
                  } else {
                    field.onChange(undefined);
                  }
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TaskDatePicker;
