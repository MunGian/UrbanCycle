import { createClient } from "@/lib/supabase/client";  

const supabase = await createClient();

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

    return { reports: reports || [], error };
}

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