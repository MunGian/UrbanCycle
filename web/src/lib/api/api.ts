import { Report, User } from "@/lib/api/apiModel";
import { createClient } from "@/lib/supabase/client";

const supabase = await createClient();

const VALID_REPORT_STATUSES: Report["status"][] = [
  "Pending",
  "In Progress",
  "Resolved",
];

const defaultGuestUser: User = {
  id: "guest",
  first_name: "Guest",
  last_name: "Reporter",
  email: "",
};

const normalizeText = (value: unknown, fallback: string) => {
  if (typeof value !== "string") return fallback;
  const normalized = value.trim();
  return normalized || fallback;
};

const normalizeOptionalText = (value: unknown) => {
  if (typeof value !== "string") return undefined;
  const normalized = value.trim();
  return normalized || undefined;
};

const normalizeDate = (value: unknown) => {
  if (typeof value === "string" || value instanceof Date) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return new Date().toISOString();
};

const normalizeNumber = (value: unknown) => {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeImages = (value: unknown) => {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
};

const normalizeUser = (value: unknown): User => {
  if (!value || typeof value !== "object") {
    return defaultGuestUser;
  }

  const user = value as Partial<User>;
  const firstName = normalizeText(user.first_name, "Guest");
  const lastName = normalizeText(user.last_name, "Reporter");

  return {
    id: normalizeText(user.id, "guest"),
    first_name: firstName,
    last_name: lastName,
    email: typeof user.email === "string" ? user.email : "",
    avatar_url: normalizeOptionalText(user.avatar_url),
    location: normalizeOptionalText(user.location),
    bio: normalizeOptionalText(user.bio),
    department: normalizeOptionalText(user.department),
    role: normalizeOptionalText(user.role),
  };
};

const normalizeReport = (value: unknown): Report => {
  const report = (value && typeof value === "object" ? value : {}) as Partial<Report>;
  const status = VALID_REPORT_STATUSES.includes(report.status as Report["status"])
    ? (report.status as Report["status"])
    : "Pending";

  const normalizedUserId =
    typeof report.user_id === "string" && report.user_id.trim()
      ? report.user_id
      : null;

  return {
    id: normalizeText(
      report.id,
      `report-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ),
    user_id: normalizedUserId,
    user: normalizeUser(report.user),
    location: normalizeText(report.location, "Unknown location"),
    latitude: normalizeNumber(report.latitude),
    longitude: normalizeNumber(report.longitude),
    description: normalizeText(report.description, "No description provided."),
    type: normalizeText(report.type, "Uncategorized"),
    status,
    created_at: normalizeDate(report.created_at),
    updated_at: normalizeOptionalText(report.updated_at),
    images: normalizeImages(report.images),
    resolved_by: normalizeOptionalText(report.resolved_by),
  };
};

export const getReports = async () => {
  const { data: reports, error } = await supabase
    .from("reports")
    .select(
      `
    *,
    user:user (
      *
    )
  `,
    )
    .order("created_at", { ascending: false });

  return { reports: (reports || []).map(normalizeReport), error };
};

export const onReportStatusUpdate = async (
  id: string,
  newStatus: "Pending" | "In Progress" | "Resolved",
  officer: string,
) => {
  try {
    const updates: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };

    if (newStatus === "Resolved") {
      updates.resolved_by = officer;
    } else {
      updates.resolved_by = null;
    }

    const { error } = await supabase.from("reports").update(updates).eq("id", id);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Failed to update status");
  }
};
