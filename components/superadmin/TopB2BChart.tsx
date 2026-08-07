"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export interface TopB2BChartProps {
  data: {
    name: string;
    revenue: number;
  }[];
}

export function TopB2BChart({ data }: TopB2BChartProps) {
  // Ambil top 5 berdasarkan revenue
  const chartData = [...data]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
    .map(d => ({
      ...d,
      shortName: d.name.length > 15 ? d.name.substring(0, 15) + "..." : d.name
    }));

  return (
    <div className="h-[300px] w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          <XAxis 
            type="number" 
            tickFormatter={(value) => `Rp ${value / 1000000}M`}
            stroke="#94a3b8" 
            fontSize={12}
          />
          <YAxis 
            type="category" 
            dataKey="shortName" 
            stroke="#94a3b8" 
            fontSize={12}
            width={100}
          />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-slate-200 shadow-sm rounded-lg p-3">
                    <p className="font-semibold text-slate-800 mb-1">{payload[0].payload.name}</p>
                    <p className="text-indigo-600 font-bold">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: "IDR",
                        maximumFractionDigits: 0
                      }).format(payload[0].value as number)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Bar dataKey="revenue" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
