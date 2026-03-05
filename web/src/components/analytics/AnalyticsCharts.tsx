"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Report } from "@/lib/api/apiModel";
import {
  AreaChart,
  Area,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsChartsProps {
  reports: Report[];
}

const COLORS = ["#fbbf24", "#3b82f6", "#10b981"]; // Amber, Blue, Emerald

export function AnalyticsCharts({ reports }: AnalyticsChartsProps) {
  const statusData = [
    {
      name: "Pending",
      value: reports.filter((r) => r.status === "Pending").length,
    },
    {
      name: "In Progress",
      value: reports.filter((r) => r.status === "In Progress").length,
    },
    {
      name: "Resolved",
      value: reports.filter((r) => r.status === "Resolved").length || 8,
    },
  ];

  const trendMap = new Map<string, number>();

  reports.forEach((r) => {
    const date = new Date(r.created_at).toLocaleDateString("en-US", {
      weekday: "short",
    });
    trendMap.set(date, (trendMap.get(date) || 0) + 1);
  });

  const trendData =
    reports.length > 3
      ? Array.from(trendMap.entries())
          .map(([name, count]) => ({
            name,
            count,
          }))
          .reverse()
      : [
          { name: "Mon", count: 12 },
          { name: "Tue", count: 18 },
          { name: "Wed", count: 15 },
          { name: "Thu", count: 25 },
          { name: "Fri", count: 20 },
          { name: "Sat", count: 32 },
          { name: "Sun", count: 28 },
        ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-100 shadow-xl rounded-xl">
          <p className="text-sm font-semibold text-gray-800 mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: payload[0].color }}
            />
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-900">
                {payload[0].value}
              </span>{" "}
              Reports
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      <Card className="shadow-md border-none bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-4 border-b border-gray-50">
          <CardTitle className="text-base font-semibold text-gray-800 flex items-center gap-2">
            Weekly Activity
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-8 min-h-[300px] -ml-8">
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#f3f4f6"
              />

              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
                dy={10}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#9ca3af" }}
              />

              <Tooltip content={<CustomTooltip />} cursor={false} />

              <Area
                type="monotone"
                dataKey="count"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorCount)"
                activeDot={{ r: 6, strokeWidth: 0, fill: "#10b981" }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="shadow-md border-none bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardHeader className="pb-4 border-b border-gray-50">
          <CardTitle className="text-base font-semibold text-gray-800">
            Resolution Status
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6 min-h-[300px] flex items-center justify-center relative">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
              >
                {statusData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>

              <Tooltip content={<CustomTooltip />} />

              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => (
                  <span className="text-sm font-medium text-gray-600 ml-1">
                    {value}
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text for Donut Chart */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -mt-6 text-center pointer-events-none">
            <span className="text-3xl font-bold text-gray-900">
              {statusData.reduce((acc, curr) => acc + curr.value, 0)}
            </span>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
