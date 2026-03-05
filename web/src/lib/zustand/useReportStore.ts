import { Report } from "@/lib/api/apiModel";
import { create } from "zustand";

interface ReportState {
  reports: Report[];
  setReports: (reports: Report[]) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  reports: [],
  setReports: (reports) => set({ reports }),
}));
