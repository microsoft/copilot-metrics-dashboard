"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import * as React from "react";
import { DateRange } from "react-day-picker";
import { parseDate } from "@/utils/helpers";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface DateFilterProps {
  limited?: boolean;
}

export const DateFilter = ({ limited = false }: DateFilterProps) => {
  const today = new Date();
  const defaultDays = limited ? 27 : 31;
  const lastDays = new Date(today);
  lastDays.setDate(today.getDate() - defaultDays);

  const getInitialDateRange = () => {
    if (typeof window === 'undefined') {
      return { from: lastDays, to: today };
    }
    
    const params = new URLSearchParams(window.location.search);
    const startDate = parseDate(params.get('startDate'));
    const endDate = parseDate(params.get('endDate'));
    
    if (startDate && endDate) {
      return { from: startDate, to: endDate };
    }
    return { from: lastDays, to: today };
  };

  const [date, setDate] = React.useState<DateRange | undefined>(getInitialDateRange());
  const [isOpen, setIsOpen] = React.useState(false);

  const router = useRouter();

  const applyFilters = () => {
    if (date?.from && date?.to) {
      const formatEndDate = format(date.to, "yyyy-MM-dd");
      const formatStartDate = format(date.from, "yyyy-MM-dd");

      router.push(`?startDate=${formatStartDate}&endDate=${formatEndDate}`, {
        scroll: false,
      });
      router.refresh();
      setIsOpen(false);
    }
  };

  const resetFilters = () => {    
    router.push(`/`, {
      scroll: false,
    });
    router.refresh();
    setIsOpen(false);
  };

  return (
    <div className={cn("grid gap-2")}>
      <Popover open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 flex gap-2 flex-col"
          align="start"
        >
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
            disabled={limited ? { before: new Date(today.getTime() - (27 * 24 * 60 * 60 * 1000)) } : undefined}
          />
          <div className="flex justify-between m-2 gap-2">
            <Button 
              onClick={resetFilters} 
              variant="outline"
            >
              Reset
            </Button>
            <Button onClick={applyFilters}>
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
