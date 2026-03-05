"use client";

import { ReportManagement } from "@/app/reports/components/ReportManagement";
import { AnalyticsCharts } from "@/components/analytics/AnalyticsCharts";
import { Report } from "@/lib/api/apiModel";
import { Activity, Clock, CheckCircle2, TrendingUp } from "lucide-react";
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
  }, []);

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
  const resolutionRate =
    totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0;

  // Calculate trends
  const now = new Date();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const reportsLast30Days = reports.filter((r) => {
    const d = new Date(r.created_at);
    return d >= oneMonthAgo && d <= now;
  }).length;

  const reportsPrev30Days = reports.filter((r) => {
    const d = new Date(r.created_at);
    return d >= twoMonthsAgo && d < oneMonthAgo;
  }).length;

  const totalReportsChange =
    reportsPrev30Days > 0
      ? ((reportsLast30Days - reportsPrev30Days) / reportsPrev30Days) * 100
      : 100;

  const getResolutionRate = (reportList: Report[]) => {
    const total = reportList.length;
    const resolved = reportList.filter((r) => r.status === "Resolved").length;
    return total > 0 ? (resolved / total) * 100 : 0;
  };

  const reportsLast7Days = reports.filter((r) => {
    const d = new Date(r.created_at);
    return d >= oneWeekAgo && d <= now;
  });

  const reportsPrev7Days = reports.filter((r) => {
    const d = new Date(r.created_at);
    return d >= twoWeeksAgo && d < oneWeekAgo;
  });

  const rateLast7Days = getResolutionRate(reportsLast7Days);
  const ratePrev7Days = getResolutionRate(reportsPrev7Days);
  const resolutionRateChange = rateLast7Days - ratePrev7Days;

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
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span
                className={`${
                  totalReportsChange >= 0 ? "text-emerald-600" : "text-red-600"
                } font-medium`}
              >
                {totalReportsChange > 0 ? "+" : ""}
                {totalReportsChange.toFixed(1)}%
              </span>{" "}
              from last month
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
            <p className="text-xs text-gray-500 mt-1">Requires attention</p>
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
            <p className="text-xs text-gray-500 mt-1">Completed this month</p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50 hover:shadow-lg transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Resolution Rate
            </CardTitle>
            <div className="p-2 bg-purple-50 rounded-full">
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {resolutionRate}%
            </div>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span
                className={`${
                  resolutionRateChange >= 0
                    ? "text-emerald-600"
                    : "text-red-600"
                } font-medium`}
              >
                {resolutionRateChange > 0 ? "+" : ""}
                {resolutionRateChange.toFixed(1)}%
              </span>{" "}
              from last week
            </p>
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
