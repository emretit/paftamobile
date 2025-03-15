
"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
import { tr } from "date-fns/locale";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

interface DatePickerWithRangeProps {
  className?: string;
  date: DateRange | undefined;
  setDate: (date: DateRange) => void;
  align?: "start" | "center" | "end";
}

export function DatePickerWithRange({
  className,
  date,
  setDate,
  align = "start",
}: DatePickerWithRangeProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (range: DateRange | undefined) => {
    if (range) {
      setDate(range);
    }
  };

  const selectToday = () => {
    const today = new Date();
    setDate({ from: today, to: today });
  };

  const selectYesterday = () => {
    const yesterday = addDays(new Date(), -1);
    setDate({ from: yesterday, to: yesterday });
  };

  const selectLast7Days = () => {
    const today = new Date();
    const sevenDaysAgo = addDays(new Date(), -7);
    setDate({ from: sevenDaysAgo, to: today });
  };

  const selectThisMonth = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    setDate({ from: firstDayOfMonth, to: today });
  };

  const selectLastMonth = () => {
    const today = new Date();
    const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    setDate({ from: firstDayOfLastMonth, to: lastDayOfLastMonth });
  };

  const selectThisYear = () => {
    const today = new Date();
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
    setDate({ from: firstDayOfYear, to: today });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <div className="grid grid-cols-2 gap-2 p-3">
        <Button size="sm" variant="outline" onClick={selectToday}>
          Bugün
        </Button>
        <Button size="sm" variant="outline" onClick={selectYesterday}>
          Dün
        </Button>
        <Button size="sm" variant="outline" onClick={selectLast7Days}>
          Son 7 Gün
        </Button>
        <Button size="sm" variant="outline" onClick={selectThisMonth}>
          Bu Ay
        </Button>
        <Button size="sm" variant="outline" onClick={selectLastMonth}>
          Geçen Ay
        </Button>
        <Button size="sm" variant="outline" onClick={selectThisYear}>
          Bu Yıl
        </Button>
      </div>
      <Calendar
        mode="range"
        selected={date}
        onSelect={handleSelect}
        locale={tr}
        numberOfMonths={2}
        defaultMonth={date?.from ? new Date(date.from) : new Date()}
      />
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setDate({ from: undefined, to: undefined })}>
          Temizle
        </Button>
      </div>
    </div>
  );
}
