"use client";

import { ReportsPageClient } from "@/app/reports/components/ReportsPageClient";
import { Report } from "@/lib/api/apiModel";
import { useReportStore } from "@/lib/zustand/useReportStore";
import { useEffect, useState } from "react";
import { getReports } from "@/lib/api/api";

export default function ReportsPage() {
  const reports = useReportStore((state) => state.reports);
  const setReports = useReportStore((state) => state.setReports);

  useEffect(() => {
    if (reports && reports.length > 0) {
      return;
    }
    console.log("ReportsPage: Fetching reports...");
    const fetchReports = async () => {
      const response = await getReports();
      if (response.reports) {
        setReports(response.reports);
      }
    };
    fetchReports();
  }, []);

  return (
    <div className="flex-1 space-y-4 bg-gray-50/30 min-h-screen">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900">
          All Reports
        </h2>
      </div>
      <ReportsPageClient initialReports={reports} />
    </div>
  );
}
