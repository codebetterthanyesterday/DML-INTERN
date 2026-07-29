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

const chartData = [
  { month: "Jan", retail: 186, industrial: 80 },
  { month: "Feb", retail: 305, industrial: 200 },
  { month: "Mar", retail: 237, industrial: 120 },
  { month: "Apr", retail: 73, industrial: 190 },
  { month: "May", retail: 209, industrial: 130 },
  { month: "Jun", retail: 214, industrial: 140 },
];

const chartConfig = {
  retail: {
    label: "Retail",
    color: "#dc2626", // text-red-600
  },
  industrial: {
    label: "Industrial",
    color: "#172554", // text-blue-950
  },
} satisfies ChartConfig;

export function SalesChart() {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-blue-950 font-bold">Grafik Penjualan</CardTitle>
        <CardDescription className="text-slate-500 font-medium">Januari - Juni 2026</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
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
