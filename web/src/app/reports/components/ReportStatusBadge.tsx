import { cn } from "@/lib/utils";

interface ReportStatusBadgeProps {
  status: string;
}

export function ReportStatusBadge({ status }: ReportStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium",
        status === "Pending" && "bg-yellow-100 text-yellow-800",
        status === "In Progress" && "bg-blue-100 text-blue-800",
        status === "Resolved" && "bg-green-100 text-green-800",
      )}
    >
      {status}
    </span>
  );
}
