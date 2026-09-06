"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface ServisChartProps {
  data: { label: string; total: number }[];
}

export function ServisChart({ data }: ServisChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="#f0f0f0" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} />
        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#a1a1aa" }} allowDecimals={false} />
        <Tooltip
          cursor={{ fill: "#fafafa" }}
          contentStyle={{ borderRadius: 8, borderColor: "#e4e4e7", fontSize: 12 }}
          formatter={(value) => [`${value} servis`, "Total"]}
        />
        <Bar dataKey="total" fill="#dc2626" radius={[4, 4, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  );
}
