"use client";

import { useState, useMemo } from "react";
import { Report } from "@/lib/api/apiModel";
import { ReportDetailModal } from "./ReportDetailModal";
import { ReportsGrid } from "./ReportsGrid";
import { ReportsList } from "./ReportsList";
import { penangLocations } from "@/lib/penangLocations";
import {
  Search,
  ChevronDown,
  ArrowUpDown,
  Filter,
  Grid,
  List,
  MapPin,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useReportStore } from "@/lib/zustand/useReportStore";
import { onReportStatusUpdate } from "@/lib/api/api";
import { useUserStore } from "@/lib/zustand/useUserStore";

interface ReportsPageClientProps {
  initialReports: Report[];
}

export function ReportsPageClient({ initialReports }: ReportsPageClientProps) {
  const user = useUserStore((state) => state.user);
  const reports = useReportStore((state) => state.reports);
  const setReports = useReportStore((state) => state.setReports);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [locationFilter, setLocationFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>("All Time");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list" | "columns">("grid");
  const [isLoading, setIsLoading] = useState(false);

  const categories = useMemo(() => {
    const unique = new Set(reports.map((r) => r.type).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [reports]);

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

  const filteredReports = useMemo(() => {
    const normalizedSearchQuery = searchQuery.trim().toLowerCase();
    const now = new Date();

    return reports
      .filter((report) => {
        const matchesSearch =
          (report.description?.toLowerCase() || "").includes(normalizedSearchQuery) ||
          (report.location?.toLowerCase() || "").includes(normalizedSearchQuery) ||
          (report.type?.toLowerCase() || "").includes(normalizedSearchQuery);

        const matchesStatus =
          statusFilter === "All" || report.status === statusFilter;
        const matchesCategory =
          categoryFilter === "All" || report.type === categoryFilter;
        const matchesLocation =
          locationFilter === "All" ||
          (report.location &&
            report.location
              .toLowerCase()
              .includes(locationFilter.toLowerCase()));

        const matchesDate = (() => {
          if (dateFilter === "All Time") return true;
          const reportDate = new Date(report.created_at);
          if (Number.isNaN(reportDate.getTime())) return false;

          if (dateFilter === "Today") {
            return reportDate.toDateString() === now.toDateString();
          }

          if (dateFilter === "Last 7 Days") {
            const date = new Date();
            date.setDate(date.getDate() - 7);
            return reportDate >= date;
          }

          if (dateFilter === "Last 30 Days") {
            const date = new Date();
            date.setDate(date.getDate() - 30);
            return reportDate >= date;
          }

          return true;
        })();

        return (
          matchesSearch &&
          matchesStatus &&
          matchesCategory &&
          matchesLocation &&
          matchesDate
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.created_at).getTime();
        const dateB = new Date(b.created_at).getTime();
        const normalizedDateA = Number.isNaN(dateA) ? 0 : dateA;
        const normalizedDateB = Number.isNaN(dateB) ? 0 : dateB;
        return sortOrder === "newest"
          ? normalizedDateB - normalizedDateA
          : normalizedDateA - normalizedDateB;
      });
  }, [
    reports,
    searchQuery,
    statusFilter,
    categoryFilter,
    locationFilter,
    dateFilter,
    sortOrder,
  ]);

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between sticky top-4 z-10 transition-all">
        {/* Search Input */}
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Search reports..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200 mr-2 shrink-0">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "grid"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                viewMode === "list"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700",
              )}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-between gap-2 px-3 py-2 w-[150px] bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shrink-0">
              <div className="flex items-center gap-2 truncate">
                <Filter className="h-4 w-4 text-gray-500 shrink-0" />
                <span className="truncate">
                  {statusFilter === "All" ? "All Status" : statusFilter}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <DropdownMenuRadioItem value="All">
                  All Status
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Pending">
                  Pending
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="In Progress">
                  In Progress
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Resolved">
                  Resolved
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-between gap-2 px-3 py-2 w-[160px] bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shrink-0">
              <div className="flex items-center gap-2 truncate">
                <Grid className="h-4 w-4 text-gray-500 shrink-0" />
                <span className="truncate">
                  {categoryFilter === "All" ? "All Categories" : categoryFilter}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={categoryFilter}
                onValueChange={setCategoryFilter}
              >
                {categories.map((category) => (
                  <DropdownMenuRadioItem key={category} value={category}>
                    {category}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Location Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-between gap-2 px-3 py-2 w-[160px] bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shrink-0">
              <div className="flex items-center gap-2 truncate">
                <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
                <span className="truncate">
                  {locationFilter === "All" ? "All Locations" : locationFilter}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 max-h-[300px] overflow-y-auto"
            >
              <DropdownMenuLabel>Filter by Location</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={locationFilter}
                onValueChange={setLocationFilter}
              >
                <DropdownMenuRadioItem value="All">
                  All Locations
                </DropdownMenuRadioItem>
                {penangLocations.map((loc) => (
                  <DropdownMenuRadioItem key={loc} value={loc}>
                    {loc}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Date Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-between gap-2 px-3 py-2 w-[150px] bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shrink-0">
              <div className="flex items-center gap-2 truncate">
                <Calendar className="h-4 w-4 text-gray-500 shrink-0" />
                <span className="truncate">{dateFilter}</span>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={dateFilter}
                onValueChange={setDateFilter}
              >
                <DropdownMenuRadioItem value="All Time">
                  All Time
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Today">
                  Today
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Last 7 Days">
                  Last 7 Days
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="Last 30 Days">
                  Last 30 Days
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Order */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center justify-between gap-2 px-3 py-2 w-[140px] bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shrink-0">
              <div className="flex items-center gap-2 truncate">
                <ArrowUpDown className="h-4 w-4 text-gray-500 shrink-0" />
                <span className="truncate">
                  {sortOrder === "newest" ? "Newest" : "Oldest"}
                </span>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400 shrink-0" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup
                value={sortOrder}
                onValueChange={(val) =>
                  setSortOrder(val as "newest" | "oldest")
                }
              >
                <DropdownMenuRadioItem value="newest">
                  Newest First
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">
                  Oldest First
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Reports Content */}
      {filteredReports.length > 0 ? (
        <>
          {viewMode === "grid" && (
            <ReportsGrid
              reports={filteredReports}
              onSelectReport={setSelectedReport}
            />
          )}

          {viewMode === "list" && (
            <ReportsList
              reports={filteredReports}
              onSelectReport={setSelectedReport}
            />
          )}
        </>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-xl border border-gray-200 border-dashed text-center animate-in fade-in duration-500">
          <div className="bg-blue-50 p-4 rounded-full mb-4">
            <Search className="h-8 w-8 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            No reports found
          </h3>
          <p className="text-gray-500 max-w-sm mt-1 mb-6">
            We couldn&apos;t find any reports matching your current filters. Try
            adjusting your search or filter criteria.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
              setCategoryFilter("All");
              setLocationFilter("All");
              setDateFilter("All Time");
            }}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Clear all filters
          </button>
        </div>
      )}

      {selectedReport && (
        <ReportDetailModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}
