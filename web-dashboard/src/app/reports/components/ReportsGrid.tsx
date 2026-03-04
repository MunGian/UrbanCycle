import { Report } from "@/lib/api/apiModel";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { MapPin, Calendar } from "lucide-react";

interface ReportsGridProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
}

export function ReportsGrid({ reports, onSelectReport }: ReportsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
      {reports.map((report) => (
        <div
          key={report.id}
          onClick={() => onSelectReport(report)}
          className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col h-full relative"
        >
          {/* Image Section */}
          <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
            {report.images?.[0] ? (
              <img
                src={report.images[0]}
                alt="Report"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                <MapPin className="h-8 w-8 mb-2 opacity-50" />
                <span className="text-xs font-medium">No Image</span>
              </div>
            )}
            <div className="absolute top-3 right-3 shadow-sm">
              <ReportStatusBadge status={report.status} />
            </div>
          </div>

          {/* Content Section */}
          <div className="p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100 ">
                {report.type}
              </span>
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(report.created_at).toLocaleDateString("en-GB")}
              </span>
            </div>

            <p className="text-gray-800 text-sm line-clamp-2 mb-4 flex-1 leading-relaxed">
              {report.description}
            </p>

            <div className="mt-auto pt-4 border-t border-gray-50 flex items-center text-xs text-gray-500">
              <MapPin className="h-3.5 w-3.5 mr-1.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{report.location}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
