import { useRef, useEffect } from "react";
import { Report } from "@/lib/api/apiModel";
import { ReportStatusBadge } from "./ReportStatusBadge";
import { ReportEvidenceGallery } from "./ReportEvidenceGallery";
import { ReportMap } from "./ReportMap";
import { StatusSelect } from "./StatusSelect";
import { X } from "lucide-react";
import Image from "next/image";

interface ReportDetailModalProps {
  report: Report | null;
  onClose: () => void;
  onStatusUpdate: (
    id: string,
    newStatus: "Pending" | "In Progress" | "Resolved",
  ) => Promise<void>;
}

export function ReportDetailModal({
  report,
  onClose,
  onStatusUpdate,
}: ReportDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  if (!report) return null;

  return (
    <div className="fixed inset-0 z-1000 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">
              Report Details
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                #{report.id.slice(0, 8)}
              </span>
              <span className="text-xs text-gray-400">•</span>
              <span className="text-sm text-gray-500">
                Created {new Date(report.created_at).toLocaleString("en-GB")}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
            {/* Left Column: Information */}
            <div className="space-y-6 flex flex-col">
              {/* Status & Type Section */}
              <div className="flex flex-wrap items-center gap-3 pb-6 border-b border-gray-100">
                <ReportStatusBadge status={report.status} />
                <span className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm font-medium shadow-sm">
                  {report.type}
                </span>
              </div>

              {/* User Information Card */}
              <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm flex items-center gap-4 hover:border-blue-100 transition-colors">
                {/* Avatar Container */}
                <div className="relative h-12 w-12 flex-shrink-0 rounded-full overflow-hidden border border-gray-200">
                  <Image
                    src={report.user.avatar_url || "/default-avatar.png"}
                    alt="User Avatar"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-500 tracking-wider mb-0.5">
                    Reported By
                  </p>
                  <p className="text-xs md:text-sm font-medium text-gray-800 truncate">
                    Name:{" "}
                    {report.user.first_name + " " + report.user.last_name ||
                      "User"}
                  </p>
                  <p className="text-xs md:text-sm font-medium text-gray-800">
                    ID: {report.user_id}
                  </p>
                </div>
              </div>

              {/* Description Box */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                  Description
                </h3>
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200/60 text-gray-700 text-sm leading-relaxed shadow-inner min-h-[100px]">
                  {report.description || "No description provided."}
                </div>
              </div>

              {/* Evidence Gallery Component */}
              <div className="mt-auto pt-4">
                <ReportEvidenceGallery
                  images={report.images}
                  title="Evidence"
                />
              </div>
            </div>

            {/* Right Column: Interactive Map */}
            <div className="flex flex-col h-full min-h-[400px] lg:min-h-0 relative group rounded-2xl overflow-hidden shadow-sm">
              <ReportMap
                latitude={report.latitude!}
                longitude={report.longitude!}
                location={report.location}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 bg-gray-50/80 backdrop-blur-sm flex justify-between items-center gap-4 flex-shrink-0 relative z-30">
          <div className="hidden sm:block text-xs text-gray-400">
            Last updated:{" "}
            {new Date(report.updated_at || report.created_at).toLocaleString(
              "en-GB",
            )}
          </div>
          <div className="flex gap-3 ml-auto w-full sm:w-auto">
            <StatusSelect
              currentStatus={report.status}
              onStatusUpdate={(newStatus) =>
                onStatusUpdate(report.id, newStatus)
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
