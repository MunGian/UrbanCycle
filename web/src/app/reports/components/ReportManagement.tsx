"use client";

import { useState } from "react";
import Link from "next/link";
import { Report } from "@/lib/api/apiModel";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { ReportDetailModal } from "./ReportDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Calendar, Filter, ChevronRight } from "lucide-react";
import { onReportStatusUpdate } from "@/lib/api/api";
import { useReportStore } from "@/lib/zustand/useReportStore";
import { useUserStore } from "@/lib/zustand/useUserStore";

interface ReportManagementProps {
  initialReports: Report[];
}

export function ReportManagement({ initialReports }: ReportManagementProps) {
  const user = useUserStore((state) => state.user);
  const reports = useReportStore((state) => state.reports);
  const setReports = useReportStore((state) => state.setReports);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  const latestReports = initialReports.slice(0, 10);

  const handleStatusUpdate = async (
    id: string,
    newStatus: "Pending" | "In Progress" | "Resolved",
  ) => {
    setIsLoading(true);
    try {
      const officer =
        user?.first_name && user?.last_name
          ? `${user.first_name} ${user.last_name}`
          : "Admin Officer";
      await onReportStatusUpdate(id, newStatus, officer);

      const newResolvedBy = newStatus === "Resolved" ? officer : undefined;
      const newUpdatedAt = new Date().toISOString();

      setReports(
        reports.map((r) =>
          r.id === id
            ? {
                ...r,
                status: newStatus,
                resolved_by: newResolvedBy,
                updated_at: newUpdatedAt,
              }
            : r,
        ),
      );
      if (selectedReport && selectedReport.id === id) {
        setSelectedReport({
          ...selectedReport,
          status: newStatus,
          resolved_by: newResolvedBy,
          updated_at: newUpdatedAt,
        });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="h-full flex flex-col shadow-md border-none bg-white rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-gray-50 bg-white pt-6 px-6 border-b border-gray-300">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold text-gray-800">
              Latest Reports
            </CardTitle>
            <span className="bg-blue-50 text-blue-600 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-100">
              {latestReports.length}
            </span>
          </div>
          <Link
            href="/reports"
            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 hover:underline transition-colors"
          >
            View More <ChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <CardContent className="p-0 overflow-y-auto max-h-[400px] scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
          <div className="divide-y divide-gray-50">
            {latestReports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="p-5 hover:bg-gray-200/80 transition-all duration-200 group relative cursor-pointer"
              >
                <div className="flex gap-5">
                  <div className="h-16 w-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-100 shadow-sm relative">
                    {report.images?.[0] ? (
                      <img
                        src={report.images[0]}
                        alt="Report"
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
                        <MapPin className="h-6 w-6 opacity-50" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-1.5">
                        <h4 className="font-semibold text-base text-gray-900 truncate pr-2 tracking-tight">
                          {report.type}
                        </h4>
                        <ReportStatusBadge status={report.status} />
                      </div>

                      <p className="text-gray-500 text-sm line-clamp-1 mb-3 pr-8 leading-relaxed">
                        {report.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center w-full justify-between text-xs font-medium text-gray-400">
                        <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <span className="truncate max-w-[120px] md:max-w-[200px] lg:max-w-full text-gray-600">
                            {report.location}
                          </span>
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {new Date(report.created_at).toLocaleDateString(
                            undefined,
                            { month: "short", day: "numeric" },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {latestReports.length === 0 && (
              <div className="text-center py-16 px-4">
                <div className="bg-gray-50 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 border border-gray-100">
                  <Filter className="h-8 w-8 text-gray-300" />
                </div>
                <h3 className="text-base font-semibold text-gray-900">
                  No reports found
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Try adjusting your filters or search criteria
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </>
  );
}
