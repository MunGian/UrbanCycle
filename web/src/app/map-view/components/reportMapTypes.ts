import { Report } from "@/lib/api/apiModel";

export type RoutePlan = {
  orderedReports: Report[];
  polyline: [number, number][];
  distanceMeters: number;
  durationSeconds: number;
  usedFallback: boolean;
};
