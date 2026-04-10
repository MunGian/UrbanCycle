import { Report } from "@/lib/api/apiModel";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { MapPin, ChevronDown } from "lucide-react";

interface ReportsListProps {
  reports: Report[];
  onSelectReport: (report: Report) => void;
}

export function ReportsList({ reports, onSelectReport }: ReportsListProps) {
  const formatDate = (value: string) => {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime())
      ? "Unknown date"
      : parsed.toLocaleDateString("en-GB");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50/80 text-gray-500 font-semibold border-b border-gray-200 uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4 w-[150px]">Status</th>
              <th className="px-6 py-4 w-[80px]">Image</th>
              <th className="px-6 py-4 w-[250px]">Type</th>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4 w-[500px]">Location</th>
              <th className="px-6 py-4 w-[120px] text-right">Date</th>
              <th className="px-6 py-4 w-[50px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {reports.map((report) => (
              <tr
                key={report.id}
                onClick={() => onSelectReport(report)}
                className="hover:bg-blue-50/30 cursor-pointer transition-colors group"
              >
                <td className="px-6 py-4">
                  <ReportStatusBadge status={report.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden border border-gray-200 shadow-sm">
                    {report.images?.[0] ? (
                      <img
                        src={report.images[0]}
                        alt=""
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <MapPin className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    {report.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 truncate max-w-xs group-hover:text-blue-600 transition-colors">
                    {report.description}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 truncate max-w-[500px]">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    {report.location}
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-right font-mono text-xs">
                  {formatDate(report.created_at)}
                </td>
                <td className="px-6 py-4 text-right">
                  <ChevronDown className="h-4 w-4 text-gray-300 -rotate-90 group-hover:text-blue-400 transition-colors" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
