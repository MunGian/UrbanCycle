"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  LayersControl,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getReports, onReportStatusUpdate } from "@/lib/api/api";
import { Report } from "@/lib/api/apiModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportStore } from "@/lib/zustand/useReportStore";
import { ReportDetailModal } from "@/app/reports/components/ReportDetailModal";
import { useUserStore } from "@/lib/zustand/useUserStore";

// Fix for default marker icon not showing
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function ReportMap() {
  const user = useUserStore((state) => state.user);
  const reports = useReportStore((state) => state.reports);
  const setReports = useReportStore((state) => state.setReports);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    try {
      if (reports && reports.length > 0) {
        return;
      }
      console.log("ReportsPage: Fetching reports...");
      const fetchReports = async () => {
        const response = await getReports();
        if (response.reports) {
          setReports(response.reports);
        }
      };
      fetchReports();
    } catch (error) {
      console.error("Error fetching reports:", error);
      alert("Failed to load map data");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleStatusUpdate = async (
    id: string,
    newStatus: "Pending" | "In Progress" | "Resolved",
  ) => {
    const officer =
      user?.first_name && user?.last_name
        ? `${user.first_name} ${user.last_name}`
        : "Admin Officer";
    await onReportStatusUpdate(id, newStatus, officer);
    setReports(
      reports.map((r) =>
        r.id === id ? { ...r, status: newStatus, resolved_by: officer } : r,
      ),
    );
    if (selectedReport && selectedReport.id === id) {
      setSelectedReport({
        ...selectedReport,
        status: newStatus,
        resolved_by: officer,
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p>Loading map data...</p>
      </div>
    );
  }

  const filteredReports = reports.filter(
    (report) => report.status !== "Resolved",
  );

  const defaultCenter: [number, number] = [5.4141, 100.3288];
  const center: [number, number] =
    filteredReports.length > 0 &&
    filteredReports[0].latitude &&
    filteredReports[0].longitude
      ? [
          Number(filteredReports[0].latitude),
          Number(filteredReports[0].longitude),
        ]
      : defaultCenter;

  return (
    <div className="h-[calc(100vh-8rem)] w-full rounded-md overflow-hidden border">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street Map">
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite Imagery">
            <TileLayer
              attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        {filteredReports.map((report) => (
          <Marker
            key={report.id}
            position={[Number(report.latitude), Number(report.longitude)]}
            icon={icon}
          >
            <Popup className="min-w-[300px]">
              <Card className="border-0 shadow-none">
                <CardHeader className="p-0 space-y-0">
                  <div className="flex items-start">
                    <CardTitle className="text-sm font-bold pr-2">
                      {report.type}
                    </CardTitle>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                        report.status === "Pending"
                          ? "border-transparent bg-yellow-500 text-white hover:bg-yellow-600"
                          : report.status === "In Progress"
                            ? "border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200"
                            : "border-transparent bg-green-500 text-white hover:bg-green-600"
                      }`}
                    >
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Reported by: {report.user?.first_name}{" "}
                    {report.user?.last_name}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {new Date(report.created_at).toLocaleString("en-GB")}
                  </span>
                </CardHeader>
                <CardContent className="p-0 space-y-2">
                  <p className="text-sm">{report.description}</p>
                  {report.images && report.images.length > 0 && (
                    <div className="relative h-32 w-full rounded-md overflow-hidden">
                      <img
                        src={report.images[0]}
                        alt="Report"
                        className="object-cover w-full h-full"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Location: {report.location}
                  </p>
                </CardContent>
                <CardContent className="p-0 space-y-2">
                  <button
                    className="text-blue-500 hover:text-blue-700 hover:underline text-sm font-medium transition-colors cursor-pointer"
                    onClick={() => setSelectedReport(report)}
                  >
                    View Details
                  </button>
                </CardContent>
              </Card>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

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
