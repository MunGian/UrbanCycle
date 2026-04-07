"use client";

import { useEffect, useState } from "react";
import { Report } from "@/lib/api/apiModel";

type RouteStopPickerModalProps = {
  open: boolean;
  eligibleReports: Report[];
  selectedStopIds: string[];
  isOptimizing: boolean;
  onClose: () => void;
  onToggleStop: (id: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
  onConfirmSelection: () => void;
  onViewReportDetails: (report: Report) => void;
};

export function RouteStopPickerModal({
  open,
  eligibleReports,
  selectedStopIds,
  isOptimizing,
  onClose,
  onToggleStop,
  onSelectAll,
  onClearSelection,
  onConfirmSelection,
  onViewReportDetails,
}: RouteStopPickerModalProps) {
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredReports = !normalizedSearch
    ? eligibleReports
    : eligibleReports.filter((report) => {
        const searchableText =
          `${report.id} ${report.type} ${report.location} ${report.status}`.toLowerCase();
        return searchableText.includes(normalizedSearch);
      });

  const buttonBaseClassName =
    "h-9 px-4 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer";
  const primaryButtonClassName = `${buttonBaseClassName} bg-gray-900 text-white hover:bg-gray-700 focus:ring-gray-400`;
  const secondaryButtonClassName = `${buttonBaseClassName} bg-slate-100 text-slate-800 hover:bg-slate-200 focus:ring-slate-300 border border-slate-200`;
  const subtleButtonClassName = `${buttonBaseClassName} bg-white text-slate-700 hover:bg-slate-100 focus:ring-slate-300 border border-slate-300`;

  return (
    <div className="fixed inset-0 z-[1000]">
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-[1px]"
        onClick={onClose}
      />
      <div className="absolute inset-x-0 bottom-0 top-16 mx-auto flex w-full flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:inset-8 sm:h-[82vh] sm:max-h-[860px] sm:max-w-3xl sm:rounded-2xl sm:top-auto sm:bottom-auto md:mt-16">
        <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-100 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Stop Selection
              </h2>
              <p className="mt-1 text-xs text-slate-600">
                Choose the stops to include in route optimization.
              </p>
            </div>
            <button className={subtleButtonClassName} onClick={onClose}>
              Close
            </button>
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs text-slate-600">
              <span>Selected stops</span>
              <span className="font-semibold text-slate-900">
                {selectedStopIds.length}/{eligibleReports.length}
              </span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-gray-800 transition-all"
                style={{
                  width:
                    eligibleReports.length === 0
                      ? "0%"
                      : `${Math.min(
                          100,
                          (selectedStopIds.length / eligibleReports.length) *
                            100,
                        )}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col px-4 py-4 sm:px-6">
          <div className="mb-3 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
                Available Stops
              </p>
              <div className="flex gap-2">
                <button
                  className={secondaryButtonClassName}
                  onClick={onSelectAll}
                  disabled={isOptimizing || eligibleReports.length === 0}
                >
                  Select All
                </button>
                <button
                  className={secondaryButtonClassName}
                  onClick={onClearSelection}
                  disabled={isOptimizing || eligibleReports.length === 0}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by type, location, status, or ID..."
                className="h-9 w-full rounded-lg border border-slate-200 px-3 text-xs text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-300"
              />
              <p className="mt-2 text-[11px] text-slate-500">
                Showing {filteredReports.length} of {eligibleReports.length}{" "}
                stop
                {eligibleReports.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          <div className=" space-y-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-2.5">
            {eligibleReports.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-5 text-center text-xs text-slate-500">
                No stops available for this route.
              </div>
            )}
            {eligibleReports.length > 0 && filteredReports.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white px-3 py-5 text-center text-xs text-slate-500">
                No report matches your search.
              </div>
            )}
            {filteredReports.map((report) => {
              const checked = selectedStopIds.includes(report.id);
              const statusClassName =
                report.status === "Pending"
                  ? "border-yellow-200 bg-yellow-100 text-yellow-800"
                  : "border-blue-200 bg-blue-100 text-blue-800";

              return (
                <div
                  key={report.id}
                  className={`rounded-lg border px-3 py-2 text-xs text-slate-700 transition-colors ${
                    checked
                      ? "border-gray-300 bg-white shadow-sm"
                      : "border-transparent bg-white/70 hover:border-slate-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-gray-900 focus:ring-gray-400"
                      checked={checked}
                      onChange={() => onToggleStop(report.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 font-medium text-slate-800">
                        {report.type}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-slate-600">
                        {report.location}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClassName}`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <div className="mt-2 pl-7">
                    <button
                      type="button"
                      className="h-8 rounded-lg border border-slate-300 bg-white px-3 text-[11px] font-medium text-slate-700 transition-colors hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:ring-offset-1"
                      onClick={() => onViewReportDetails(report)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs text-slate-600">
              <span className="font-semibold text-slate-900">
                {selectedStopIds.length}
              </span>{" "}
              stop{selectedStopIds.length === 1 ? "" : "s"} selected
            </p>
            <button
              className={`${primaryButtonClassName} min-w-[186px]`}
              onClick={onConfirmSelection}
              disabled={isOptimizing || selectedStopIds.length === 0}
            >
              {isOptimizing ? "Optimizing..." : "Confirm & Calculate Route"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
