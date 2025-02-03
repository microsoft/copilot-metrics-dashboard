"use client";

import { CalendarIcon } from "@radix-ui/react-icons";
import { format } from "date-fns";
import * as React from "react";
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

export const DateFilter = () => {
  const today = new Date();
  
  const getInitialDate = () => {
    if (typeof window == 'undefined') {
      return today;
    }

    const params = new URLSearchParams(window.location.search);
    const date = parseDate(params.get('date'));
    if (date) {
      return date;
    }
    return today;
  };

  const [date, setDate] = React.useState<Date | undefined>(getInitialDate());
  const [isOpen, setIsOpen] = React.useState(false);

  const router = useRouter();

  const applyFilters = () => {
    if (date) {
      const formattedDate = format(date, "yyyy-MM-dd");

      router.push(`?date=${formattedDate}`, {
        scroll: false,
      });
      router.refresh();
      setIsOpen(false);
    }
  };

  return (
    <div className={cn("grid gap-2")}>
      <Popover open={isOpen} onOpenChange={(open) => setIsOpen(open)}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[170px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? (
              format(date, "LLL dd, y")
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
            mode="single"
            defaultMonth={date}
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                setDate(selectedDate);
              }
            }}
            numberOfMonths={1}
          />
          <Button onClick={applyFilters} className="self-end m-2">
            Apply
          </Button>
        </PopoverContent>
      </Popover>
    </div>
  );
};
