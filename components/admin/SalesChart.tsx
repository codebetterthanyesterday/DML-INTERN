"use client";

import { Bar, BarChart, CartesianGrid, XAxis, ResponsiveContainer } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export type ChartDataItem = { label: string; retail: number; industrial: number };

const chartConfig = {
  retail: {
    label: "Retail",
    color: "#dc2626", // text-red-600
  },
  industrial: {
    label: "Industrial",
    color: "#172554", // text-slate-950
  },
} satisfies ChartConfig;

export function SalesChart({ data }: { data: ChartDataItem[] }) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-slate-950 font-bold">Grafik Penjualan</CardTitle>
        <CardDescription className="text-slate-500 font-medium">6 Bulan Terakhir</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="retail" fill="var(--color-retail)" radius={4} />
            <Bar dataKey="industrial" fill="var(--color-industrial)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
