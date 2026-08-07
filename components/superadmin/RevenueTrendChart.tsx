"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export interface RevenueTrendData {
  label: string;
  amount: number;
}

export function RevenueTrendChart({ data }: { data: RevenueTrendData[] }) {
  const formatCurrencyCompact = (amount: number) => {
    if (amount === 0) return "Rp 0";
    return new Intl.NumberFormat("id-ID", {
      notation: "compact",
      compactDisplay: "short",
      style: "currency",
      currency: "IDR",
    }).format(amount);
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <XAxis 
            dataKey="label" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#64748b', fontSize: 12 }} 
            tickFormatter={formatCurrencyCompact}
            width={80}
          />
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white border border-slate-200 p-3 rounded-lg shadow-lg">
                    <p className="text-sm font-semibold text-slate-700 mb-1">{label}</p>
                    <p className="text-sm font-bold text-indigo-600">
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
          <Bar dataKey="amount" fill="#4f46e5" radius={[4, 4, 0, 0]} maxBarSize={50} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
