"use client";

import { ReportManagement } from "@/app/reports/components/ReportManagement";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { penangLocations } from "@/lib/penangLocations";
import { Activity, Clock, CheckCircle2, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { getReports } from "@/lib/api/api";
import { useReportStore } from "@/lib/zustand/useReportStore";

export default function DashboardPage() {
  const reports = useReportStore((state) => state.reports);
  const setReports = useReportStore((state) => state.setReports);
  const [error, setError] = useState<boolean | null>(null);

  useEffect(() => {
    if (reports && reports.length > 0) {
      return;
    }
    const fetchReports = async () => {
      const response = await getReports();
      if (response.error) {
        setError(true);
        console.error("Error fetching reports:", response.error);
      } else {
        setReports(response.reports);
        setError(false);
      }
    };

    fetchReports();
  }, [reports, setReports]);

  if (error) {
    console.error("Error fetching reports:", error);
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-gray-500">
            Failed to load reports. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Calculate quick stats
  const totalReports = reports.length;
  const pendingReports = reports.filter((r) => r.status === "Pending").length;
  const resolvedReports = reports.filter((r) => r.status === "Resolved").length;

  // Calculate this month's total
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const reportsThisMonth = reports.filter((r) => {
    const d = new Date(r.created_at);
    return d >= startOfMonth && d <= now;
  }).length;

  // Calculate top reported locations based on Penang areas
  const locationCounts = reports.reduce(
    (acc, report) => {
      const loc = report.location || "";
      // Find which Penang location matches this reports location string
      // Sort penang locations by length (descending) to match specific locations first (e.g. "Bayan Baru" before "Bayan") if overlapping
      // But assuming distinct enough lists.
      const matchedLocation =
        penangLocations.find((place) => loc.includes(place)) || "Other";

      if (matchedLocation !== "Other") {
        acc[matchedLocation] = (acc[matchedLocation] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>,
  );

  const sortedLocations = Object.entries(locationCounts).sort(
    (a, b) => b[1] - a[1],
  );

  const topLocations = sortedLocations.slice(0, 3);

  return (
    <div className="space-y-8 px-4 bg-gray-50/50 min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            Monitor waste reports and collection performance in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-3 py-1.5 rounded-full border shadow-sm">
          <Clock className="h-4 w-4" />
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Reports
            </CardTitle>
            <div className="p-2 bg-blue-50 rounded-full">
              <Activity className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {totalReports}
            </div>
            <p className="text-xs text-gray-500 mt-3">
              <span className="text-sm font-bold text-gray-500">
                {reportsThisMonth}
              </span>{" "}
              report(s) this month
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Review
            </CardTitle>
            <div className="p-2 bg-yellow-50 rounded-full">
              <Clock className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {pendingReports}
            </div>
            <p className="text-xs text-gray-500 mt-3">Requires attention</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Resolved
            </CardTitle>
            <div className="p-2 bg-emerald-50 rounded-full">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {resolvedReports}
            </div>
            <p className="text-xs text-gray-500 mt-3">Completed this month</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Top Active Areas
            </CardTitle>
            <div className="p-2 bg-purple-50 rounded-full">
              <MapPin className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 md:space-y-3">
              {topLocations.map(([location, count], index) => (
                <div
                  key={location}
                  className="flex items-center justify-between text-sm group"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full transition-colors ${
                        index === 0
                          ? "bg-purple-100 text-purple-700 group-hover:bg-purple-200"
                          : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                      }`}
                    >
                      {index + 1}
                    </span>
                    <span
                      className={`font-medium truncate max-w-[120px] ${
                        index === 0 ? "text-gray-900" : "text-gray-700"
                      }`}
                      title={location}
                    >
                      {location}
                    </span>
                  </div>
                  <span className="text-gray-500 text-xs font-medium bg-gray-50 px-2 py-0.5 rounded-full border border-gray-100">
                    {count} reports
                  </span>
                </div>
              ))}
              {topLocations.length === 0 && (
                <div className="text-sm text-gray-500 py-2 text-center italic">
                  No location data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-8">
        <div className="col-span-1 lg:col-span-4 space-y-6">
          <AnalyticsCharts reports={reports} />
        </div>
        <div className="col-span-1 lg:col-span-3 space-y-6">
          <ReportManagement initialReports={reports} />
        </div>
      </div>
    </div>
  );
}
