"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { getReports, onReportStatusUpdate } from "@/lib/api/api";
import { Report } from "@/lib/api/apiModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useReportStore } from "@/lib/zustand/useReportStore";
import { ReportDetailModal } from "@/app/reports/components/ReportDetailModal";
import { useUserStore } from "@/lib/zustand/useUserStore";
import { RouteStopPickerModal } from "@/app/map-view/components/RouteStopPickerModal";
import { RouteStopsList } from "@/app/map-view/components/RouteStopsList";
import { RoutePlanningDesktopPanel } from "@/app/map-view/components/RoutePlanningDesktopPanel";
import { RoutePlanningMobilePanel } from "@/app/map-view/components/RoutePlanningMobilePanel";
import { RoutePlan } from "@/app/map-view/components/reportMapTypes";

const markerShadowUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const KOMTAR_LOCATION = {
  name: "KOMTAR, MBPP (Waste Council HQ)",
  latitude: 5.4141,
  longitude: 100.3288,
};

const markerIcons = {
  Pending: L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-yellow.png",
    iconRetinaUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png",
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  "In Progress": L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
    iconRetinaUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
  HQ: L.icon({
    iconUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
    iconRetinaUrl:
      "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: markerShadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  }),
};

const getMarkerIcon = (status: Report["status"]) => {
  if (status === "Pending" || status === "In Progress") {
    return markerIcons[status];
  }

  return markerIcons.Pending;
};

const getRouteStopIcon = (sequence: number) =>
  L.divIcon({
    className: "route-stop-marker",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:9999px;background:#111827;color:#ffffff;font-weight:700;font-size:12px;border:2px solid #ffffff;box-shadow:0 2px 8px rgba(0,0,0,0.35);">${sequence}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -28],
  });

const hasValidCoordinates = (report: Report) => {
  if (report.latitude === null || report.longitude === null) {
    return false;
  }

  const lat = Number(report.latitude);
  const lng = Number(report.longitude);
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
};

const toRad = (value: number) => (value * Math.PI) / 180;

const haversineDistanceMeters = (
  start: [number, number],
  end: [number, number],
) => {
  const earthRadiusMeters = 6371000;
  const [startLat, startLng] = start;
  const [endLat, endLng] = end;

  const deltaLat = toRad(endLat - startLat);
  const deltaLng = toRad(endLng - startLng);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRad(startLat)) *
      Math.cos(toRad(endLat)) *
      Math.sin(deltaLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadiusMeters * c;
};

const buildFallbackRoute = (reports: Report[]): RoutePlan => {
  const remaining = [...reports];
  const orderedReports: Report[] = [];
  const polyline: [number, number][] = [
    [KOMTAR_LOCATION.latitude, KOMTAR_LOCATION.longitude],
  ];

  let currentPoint: [number, number] = [
    KOMTAR_LOCATION.latitude,
    KOMTAR_LOCATION.longitude,
  ];
  let totalDistanceMeters = 0;

  while (remaining.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (let i = 0; i < remaining.length; i += 1) {
      const candidate = remaining[i];
      const candidatePoint: [number, number] = [
        Number(candidate.latitude),
        Number(candidate.longitude),
      ];
      const distance = haversineDistanceMeters(currentPoint, candidatePoint);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = i;
      }
    }

    const [nextStop] = remaining.splice(nearestIndex, 1);
    orderedReports.push(nextStop);
    currentPoint = [Number(nextStop.latitude), Number(nextStop.longitude)];
    polyline.push(currentPoint);
    totalDistanceMeters += nearestDistance;
  }

  const durationSeconds = (totalDistanceMeters / 1000 / 30) * 3600;

  return {
    orderedReports,
    polyline,
    distanceMeters: totalDistanceMeters,
    durationSeconds,
    usedFallback: true,
  };
};

const fetchOsrmTripRoute = async (reports: Report[]): Promise<RoutePlan> => {
  const waypoints = [
    {
      latitude: KOMTAR_LOCATION.latitude,
      longitude: KOMTAR_LOCATION.longitude,
    },
    ...reports.map((report) => ({
      latitude: Number(report.latitude),
      longitude: Number(report.longitude),
    })),
  ];

  const coordinates = waypoints
    .map((point) => `${point.longitude},${point.latitude}`)
    .join(";");

  const url = `https://router.project-osrm.org/trip/v1/driving/${coordinates}?source=first&roundtrip=false&overview=full&geometries=geojson&steps=false`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("OSRM route service not reachable");
  }

  const data = await response.json();
  const trip = data?.trips?.[0];
  const tripWaypoints = data?.waypoints;

  if (!trip || !tripWaypoints || !Array.isArray(tripWaypoints)) {
    throw new Error("OSRM response is missing trip information");
  }

  const orderedReports = tripWaypoints
    .map((point: { waypoint_index?: number }, originalIndex: number) => ({
      originalIndex,
      waypointIndex:
        typeof point.waypoint_index === "number" ? point.waypoint_index : -1,
    }))
    .filter((item: { originalIndex: number }) => item.originalIndex !== 0)
    .sort(
      (a: { waypointIndex: number }, b: { waypointIndex: number }) =>
        a.waypointIndex - b.waypointIndex,
    )
    .map((item: { originalIndex: number }) => reports[item.originalIndex - 1]);

  const polyline: [number, number][] =
    trip.geometry?.coordinates?.map((coordinate: [number, number]) => [
      coordinate[1],
      coordinate[0],
    ]) ?? [];

  if (polyline.length === 0) {
    throw new Error("OSRM returned an empty route geometry");
  }

  return {
    orderedReports,
    polyline,
    distanceMeters: Number(trip.distance) || 0,
    durationSeconds: Number(trip.duration) || 0,
    usedFallback: false,
  };
};

const formatDistance = (meters: number) => `${(meters / 1000).toFixed(1)} km`;

const formatDuration = (seconds: number) => {
  const totalMinutes = Math.max(1, Math.round(seconds / 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) {
    return `${minutes} min`;
  }

  return `${hours} h ${minutes} min`;
};

const buildGoogleMapsDirectionsUrl = (stops: Report[]) => {
  const validStops = stops.filter(hasValidCoordinates);
  if (validStops.length === 0) {
    return null;
  }

  const maxStops = 24;
  const limitedStops = validStops.slice(0, maxStops);
  const hasTruncatedStops = validStops.length > limitedStops.length;

  const hq = `${KOMTAR_LOCATION.latitude},${KOMTAR_LOCATION.longitude}`;
  const destinationStop = limitedStops[limitedStops.length - 1];
  const destination = `${destinationStop.latitude},${destinationStop.longitude}`;
  const intermediateWaypoints = limitedStops
    .slice(0, -1)
    .map((report) => `${report.latitude},${report.longitude}`)
    .join("|");

  const query = new URLSearchParams({
    api: "1",
    origin: hq,
    destination,
    travelmode: "driving",
  });

  if (intermediateWaypoints) {
    query.set("waypoints", intermediateWaypoints);
  }

  return {
    url: `https://www.google.com/maps/dir/?${query.toString()}`,
    hasTruncatedStops,
  };
};

function FlyToStop({ target }: { target: [number, number] | null }) {
  const map = useMap();

  useEffect(() => {
    if (!target) {
      return;
    }

    map.flyTo(target, Math.max(map.getZoom(), 15), { duration: 0.8 });
  }, [map, target]);

  return null;
}

export default function ReportMap() {
  const user = useUserStore((state) => state.user);
  const reports = useReportStore((state) => state.reports);
  const setReports = useReportStore((state) => state.setReports);

  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [selectedStopIds, setSelectedStopIds] = useState<string[]>([]);
  const [draftSelectedStopIds, setDraftSelectedStopIds] = useState<string[]>(
    [],
  );
  const [focusTarget, setFocusTarget] = useState<[number, number] | null>(null);
  const [isStopModalOpen, setIsStopModalOpen] = useState<boolean>(false);
  const [stopModalInstance, setStopModalInstance] = useState<number>(0);
  const [isMobileStopsOpen, setIsMobileStopsOpen] = useState<boolean>(false);
  const [isDesktopStopsCollapsed, setIsDesktopStopsCollapsed] =
    useState<boolean>(true);
  const [googleMapsHint, setGoogleMapsHint] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchReports = async () => {
      try {
        if (reports && reports.length > 0) {
          return;
        }
        console.log("ReportsPage: Fetching reports...");
        const response = await getReports();
        if (isMounted && response.reports) {
          setReports(response.reports);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
        alert("Failed to load map data");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchReports();

    return () => {
      isMounted = false;
    };
  }, [reports, setReports]);

  const filteredReports = useMemo(
    () => reports.filter((report) => report.status !== "Resolved"),
    [reports],
  );

  const routeEligibleReports = useMemo(
    () => filteredReports.filter((report) => hasValidCoordinates(report)),
    [filteredReports],
  );

  useEffect(() => {
    const eligibleIds = routeEligibleReports.map((report) => report.id);

    setSelectedStopIds((prevSelected) => {
      return prevSelected.filter((id) => eligibleIds.includes(id));
    });

    setDraftSelectedStopIds((prevSelected) => {
      return prevSelected.filter((id) => eligibleIds.includes(id));
    });
  }, [routeEligibleReports]);

  const selectedReports = useMemo(
    () =>
      routeEligibleReports.filter((report) =>
        selectedStopIds.includes(report.id),
      ),
    [routeEligibleReports, selectedStopIds],
  );

  const buildOptimizedRoute = useCallback(async (targetReports: Report[]) => {
    if (targetReports.length === 0) {
      setRouteError("Select at least one stop with valid coordinates.");
      setRoutePlan(null);
      return;
    }

    setIsOptimizing(true);
    setRouteError(null);
    setGoogleMapsHint(null);

    try {
      const optimizedRoute = await fetchOsrmTripRoute(targetReports);
      setRoutePlan(optimizedRoute);
    } catch (error) {
      console.warn("OSRM route optimization failed, fallback enabled:", error);
      const fallbackRoute = buildFallbackRoute(targetReports);
      setRoutePlan(fallbackRoute);
      setRouteError(
        "Live road optimization is unavailable. Showing an offline nearest-stop route instead.",
      );
    } finally {
      setIsOptimizing(false);
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

    setRoutePlan(null);
    setGoogleMapsHint(null);
  };

  const routeStopSequenceById = routePlan
    ? new Map(
        routePlan.orderedReports.map((report, index) => [report.id, index + 1]),
      )
    : new Map<string, number>();
  const reportsToRender = routePlan
    ? routePlan.orderedReports
    : filteredReports;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <p>Loading map data...</p>
      </div>
    );
  }

  const defaultCenter: [number, number] = [
    KOMTAR_LOCATION.latitude,
    KOMTAR_LOCATION.longitude,
  ];
  const center: [number, number] =
    filteredReports.length > 0 && hasValidCoordinates(filteredReports[0])
      ? [
          Number(filteredReports[0].latitude),
          Number(filteredReports[0].longitude),
        ]
      : defaultCenter;

  const listedStops = routePlan?.orderedReports ?? selectedReports;

  const actionButtonClassName =
    "h-9 px-4 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-1 cursor-pointer";
  const primaryButtonClassName = `${actionButtonClassName} bg-gray-900 text-white hover:bg-gray-700 focus:ring-gray-400`;
  const secondaryButtonClassName = `${actionButtonClassName} bg-white text-slate-700 border border-slate-300 hover:bg-slate-100 focus:ring-slate-300`;

  const openRouteInGoogleMaps = () => {
    if (!routePlan) {
      return;
    }

    const routeLink = buildGoogleMapsDirectionsUrl(routePlan.orderedReports);
    if (!routeLink) {
      setGoogleMapsHint(
        "Unable to open Google Maps because route stops are missing valid coordinates.",
      );
      return;
    }

    setGoogleMapsHint(
      routeLink.hasTruncatedStops
        ? "Google Maps opened with the first 24 stops due to waypoint limits."
        : null,
    );
    window.open(routeLink.url, "_blank", "noopener,noreferrer");
  };

  const focusReportOnMap = (report: Report) => {
    if (!hasValidCoordinates(report)) {
      return;
    }

    setFocusTarget([Number(report.latitude), Number(report.longitude)]);
    setIsStopModalOpen(false);
    setIsMobileStopsOpen(false);
  };

  const toggleStopSelection = (reportId: string) => {
    setDraftSelectedStopIds((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId],
    );
  };

  const openStopModal = () => {
    setDraftSelectedStopIds(selectedStopIds);
    setIsMobileStopsOpen(false);
    setStopModalInstance((prev) => prev + 1);
    setIsStopModalOpen(true);
  };

  const openReportDetails = (report: Report) => {
    setSelectedReport(report);
  };

  const confirmStopsAndBuildRoute = () => {
    const confirmedIds = [...draftSelectedStopIds];
    const targetReports = routeEligibleReports.filter((report) =>
      confirmedIds.includes(report.id),
    );

    setSelectedStopIds(confirmedIds);
    setRoutePlan(null);
    setGoogleMapsHint(null);
    setIsStopModalOpen(false);
    void buildOptimizedRoute(targetReports);
  };

  const clearRoute = () => {
    setSelectedStopIds([]);
    setDraftSelectedStopIds([]);
    setRoutePlan(null);
    setRouteError(null);
    setGoogleMapsHint(null);
    setSelectedReport(null);
  };

  return (
    <div className="relative h-[calc(100vh-8rem)] w-full rounded-md overflow-hidden border">
      <RoutePlanningDesktopPanel
        selectedReports={selectedReports}
        routeEligibleReports={routeEligibleReports}
        routePlan={routePlan}
        routeError={routeError}
        googleMapsHint={googleMapsHint}
        isOptimizing={isOptimizing}
        primaryButtonClassName={primaryButtonClassName}
        secondaryButtonClassName={secondaryButtonClassName}
        onOpenStopModal={openStopModal}
        onCalculateRoute={() => void buildOptimizedRoute(selectedReports)}
        onClearRoute={clearRoute}
        onOpenGoogleMaps={openRouteInGoogleMaps}
        formatDistance={formatDistance}
        formatDuration={formatDuration}
      />

      <RoutePlanningMobilePanel
        selectedReports={selectedReports}
        routeEligibleReports={routeEligibleReports}
        listedStopsCount={listedStops.length}
        routePlan={routePlan}
        routeError={routeError}
        googleMapsHint={googleMapsHint}
        isOptimizing={isOptimizing}
        isMobileStopsOpen={isMobileStopsOpen}
        primaryButtonClassName={primaryButtonClassName}
        secondaryButtonClassName={secondaryButtonClassName}
        onOpenStopModal={openStopModal}
        onCalculateRoute={() => void buildOptimizedRoute(selectedReports)}
        onClearRoute={clearRoute}
        onToggleStops={() => setIsMobileStopsOpen((prev) => !prev)}
        onOpenGoogleMaps={openRouteInGoogleMaps}
        formatDistance={formatDistance}
        formatDuration={formatDuration}
      />

      {isMobileStopsOpen && (
        <div className="absolute bottom-17 left-3 right-3 z-[1000] max-h-100 overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:hidden">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-700">Stops (All)</p>
            <span className="text-[11px] text-slate-600">
              {listedStops.length}
            </span>
          </div>
          <div className="mt-2 space-y-2">
            <RouteStopsList
              listedStops={listedStops}
              onViewDetails={setSelectedReport}
              onViewOnMap={focusReportOnMap}
            />
          </div>
        </div>
      )}

      <RouteStopPickerModal
        key={stopModalInstance}
        open={isStopModalOpen}
        eligibleReports={routeEligibleReports}
        selectedStopIds={draftSelectedStopIds}
        isOptimizing={isOptimizing}
        onClose={() => setIsStopModalOpen(false)}
        onToggleStop={toggleStopSelection}
        onViewReportDetails={openReportDetails}
        onSelectAll={() =>
          setDraftSelectedStopIds(
            routeEligibleReports.map((report) => report.id),
          )
        }
        onClearSelection={() => setDraftSelectedStopIds([])}
        onConfirmSelection={confirmStopsAndBuildRoute}
      />

      {isDesktopStopsCollapsed ? (
        <div className="absolute right-3 top-3 z-[999] hidden md:block">
          <button
            className={primaryButtonClassName}
            onClick={() => setIsDesktopStopsCollapsed(false)}
          >
            Show Stops ({listedStops.length})
          </button>
        </div>
      ) : (
        <div className="absolute right-3 top-3 z-[999] hidden max-h-[calc(100%-1.5rem)] w-[340px] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm md:block">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-700">
              Route Stops (All)
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-600">
                {listedStops.length}
              </span>
              <button
                className={primaryButtonClassName}
                onClick={() => setIsDesktopStopsCollapsed(true)}
              >
                Collapse
              </button>
            </div>
          </div>
          <p className="mt-1 text-[11px] text-slate-600">
            View selected and optimized stops here. Use Manage Stops to choose
            what is included.
          </p>

          <div className="mt-2 space-y-2">
            <RouteStopsList
              listedStops={listedStops}
              onViewDetails={setSelectedReport}
              onViewOnMap={focusReportOnMap}
            />
          </div>
        </div>
      )}

      {routePlan && (
        <div className="pointer-events-none absolute left-1/2 top-3 z-[1001] -translate-x-1/2 rounded-full border border-slate-200 bg-white/95 px-3 py-1.5 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur-sm">
          Route view: showing {routePlan.orderedReports.length} stops only
        </div>
      )}

      <MapContainer
        center={center}
        zoom={13}
        zoomControl={false}
        style={{ height: "100%", width: "100%", zIndex: 998 }}
      >
        <FlyToStop target={focusTarget} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker
          position={[KOMTAR_LOCATION.latitude, KOMTAR_LOCATION.longitude]}
          icon={markerIcons.HQ}
        >
          <Popup>
            <p className="text-sm font-semibold">{KOMTAR_LOCATION.name}</p>
            <p className="text-xs text-slate-600">
              Majlis Perbandaran Pulau Pinang, Paras 4, KOMTAR
            </p>
          </Popup>
        </Marker>

        {routePlan && routePlan.polyline.length > 1 && (
          <Polyline
            positions={routePlan.polyline}
            pathOptions={{ color: "#dc2626", weight: 6, opacity: 0.8 }}
          />
        )}

        {reportsToRender.map((report) => {
          const routeSequence = routeStopSequenceById.get(report.id);

          return (
            <Marker
              key={report.id}
              position={[Number(report.latitude), Number(report.longitude)]}
              icon={
                routeSequence
                  ? getRouteStopIcon(routeSequence)
                  : getMarkerIcon(report.status)
              }
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
                      Reported by:{" "}
                      {`${report.user?.first_name || "Guest"} ${report.user?.last_name || "Reporter"}`.trim()}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {Number.isNaN(new Date(report.created_at).getTime())
                        ? "Unknown date"
                        : new Date(report.created_at).toLocaleString("en-GB")}
                    </span>
                    {routeSequence && (
                      <p className="mt-1 text-xs font-semibold text-slate-700">
                        Route stop #{routeSequence}
                      </p>
                    )}
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
          );
        })}
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
