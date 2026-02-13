"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

type Point = {
  label: string;
  value: number;
};

export function RevenueChart({ data }: { data: Point[] }) {
  return (
    <section className="glass-edge rounded-2xl bg-white/80 p-5 shadow-[0_10px_30px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:bg-black/60">
      <h3 className="text-xl font-semibold">Revenue Trend</h3>
      <div className="mt-4 h-[320px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid rgba(255,255,255,0.2)",
                backdropFilter: "blur(20px)",
                background: "rgba(255,255,255,0.92)"
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0284c7"
              strokeWidth={2.5}
              fill="url(#revenueFill)"
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
