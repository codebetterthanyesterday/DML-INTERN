"use client";

import * as React from "react";
import { format, subDays, startOfMonth, endOfMonth, subMonths, startOfYear } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useRouter, useSearchParams } from "next/navigation";

export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const fromParam = searchParams.get("from");
  const toParam = searchParams.get("to");

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: fromParam ? new Date(fromParam) : subDays(new Date(), 29),
    to: toParam ? new Date(toParam) : new Date(),
  });

  const [isOpen, setIsOpen] = React.useState(false);

  // Apply changes to URL
  const applyDateRange = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("from", range.from.toISOString());
      params.set("to", range.to.toISOString());
      router.push(`?${params.toString()}`);
    }
  };

  const presets = [
    {
      label: "Hari Ini",
      onClick: () => applyDateRange({ from: new Date(), to: new Date() }),
    },
    {
      label: "7 Hari Terakhir",
      onClick: () => applyDateRange({ from: subDays(new Date(), 6), to: new Date() }),
    },
    {
      label: "30 Hari Terakhir",
      onClick: () => applyDateRange({ from: subDays(new Date(), 29), to: new Date() }),
    },
    {
      label: "Bulan Ini",
      onClick: () => applyDateRange({ from: startOfMonth(new Date()), to: endOfMonth(new Date()) }),
    },
    {
      label: "Bulan Lalu",
      onClick: () => {
        const lastMonth = subMonths(new Date(), 1);
        applyDateRange({ from: startOfMonth(lastMonth), to: endOfMonth(lastMonth) });
      },
    },
    {
      label: "Tahun Ini",
      onClick: () => applyDateRange({ from: startOfYear(new Date()), to: new Date() }),
    },
  ];

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full sm:w-[300px] justify-start text-left font-semibold border-slate-200 shadow-sm hover:bg-slate-50 transition-all",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-red-600" />
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
              <span>Pilih Rentang Tanggal</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0 flex flex-col sm:flex-row bg-white/95 backdrop-blur-md border-slate-200 shadow-xl shadow-red-700/10 rounded-xl overflow-hidden" align="end">
          <div className="flex flex-col gap-1 p-3 border-b sm:border-b-0 sm:border-r border-slate-100 bg-slate-50/50 sm:min-w-[160px]">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-2">Preset</div>
            <div className="flex sm:flex-col gap-1 flex-wrap">
            {presets.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                className="justify-start font-medium text-sm text-slate-700 hover:bg-red-50 hover:text-red-600 w-auto sm:w-full"
                onClick={() => {
                  preset.onClick();
                  setIsOpen(false);
                }}
              >
                {preset.label}
              </Button>
            ))}
            </div>
          </div>
          <div className="p-3 overflow-x-auto">
            <Calendar
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={(range) => {
                setDate(range);
                if (range?.from && range?.to) {
                  applyDateRange(range);
                  setIsOpen(false);
                }
              }}
              numberOfMonths={2}
              className="font-medium"
            />
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
