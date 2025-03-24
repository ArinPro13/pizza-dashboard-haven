
import React, { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangePickerProps {
  onRangeChange: (range: { from?: Date; to?: Date }) => void;
  className?: string;
}

type DateRange = {
  from?: Date;
  to?: Date;
};

export const DateRangePicker: React.FC<DateRangePickerProps> = ({
  onRangeChange,
  className,
}) => {
  const [date, setDate] = useState<DateRange>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const handlePresetChange = (value: string) => {
    const today = new Date();
    let from: Date | undefined;
    let to: Date | undefined = today;

    switch (value) {
      case "last7days":
        from = new Date(today);
        from.setDate(today.getDate() - 7);
        break;
      case "last30days":
        from = new Date(today);
        from.setDate(today.getDate() - 30);
        break;
      case "last90days":
        from = new Date(today);
        from.setDate(today.getDate() - 90);
        break;
      case "lastYear":
        from = new Date(today);
        from.setFullYear(today.getFullYear() - 1);
        break;
      case "custom":
        setIsCalendarOpen(true);
        return;
    }

    setDate({ from, to });
    onRangeChange({ from, to });
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "justify-start text-left font-normal border-dashed h-9",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Select
            onValueChange={handlePresetChange}
            defaultValue="last30days"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last7days">Last 7 days</SelectItem>
              <SelectItem value="last30days">Last 30 days</SelectItem>
              <SelectItem value="last90days">Last 90 days</SelectItem>
              <SelectItem value="lastYear">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(range) => {
              setDate(range || {});
              if (range?.from && range?.to) {
                onRangeChange(range);
              }
            }}
            numberOfMonths={2}
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};
