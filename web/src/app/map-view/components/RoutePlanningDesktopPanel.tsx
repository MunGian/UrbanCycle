import { Report } from "@/lib/api/apiModel";
import { RoutePlan } from "@/app/map-view/components/reportMapTypes";

type RoutePlanningDesktopPanelProps = {
  selectedReports: Report[];
  routeEligibleReports: Report[];
  routePlan: RoutePlan | null;
  routeError: string | null;
  googleMapsHint: string | null;
  isOptimizing: boolean;
  primaryButtonClassName: string;
  secondaryButtonClassName: string;
  onOpenStopModal: () => void;
  onCalculateRoute: () => void;
  onClearRoute: () => void;
  onOpenGoogleMaps: () => void;
  formatDistance: (meters: number) => string;
  formatDuration: (seconds: number) => string;
};

export function RoutePlanningDesktopPanel({
  selectedReports,
  routeEligibleReports,
  routePlan,
  routeError,
  googleMapsHint,
  isOptimizing,
  primaryButtonClassName,
  secondaryButtonClassName,
  onOpenStopModal,
  onCalculateRoute,
  onClearRoute,
  onOpenGoogleMaps,
  formatDistance,
  formatDuration,
}: RoutePlanningDesktopPanelProps) {
  return (
    <div className="absolute left-3 top-3 z-[1000] hidden max-h-[calc(100%-1.5rem)] w-[340px] overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm sm:block">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">
        Route Planning
      </p>
      <p className="mt-1 text-xs text-slate-600">
        Start from MBPP Council, select stops, and open in Google Maps for live
        GPS navigation.
      </p>

      <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between text-xs text-slate-700">
          <span>Selected Stops</span>
          <span className="font-semibold">
            {selectedReports.length}/{routeEligibleReports.length}
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-gray-900 transition-all"
            style={{
              width:
                routeEligibleReports.length === 0
                  ? "0%"
                  : `${Math.min(
                      100,
                      (selectedReports.length / routeEligibleReports.length) *
                        100,
                    )}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex gap-2">
          <button
            className={`flex-1 ${primaryButtonClassName}`}
            onClick={onOpenStopModal}
          >
            Manage Stops
          </button>
          <button
            className={`flex-1 ${primaryButtonClassName}`}
            onClick={onCalculateRoute}
            disabled={isOptimizing || selectedReports.length === 0}
          >
            {isOptimizing ? "Calculating..." : "Calculate Route"}
          </button>
        </div>
        <button
          className={secondaryButtonClassName}
          onClick={onClearRoute}
          disabled={isOptimizing}
        >
          Clear
        </button>
      </div>

      <div className="mt-3 flex items-center gap-4 text-xs text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          <span>In Progress</span>
        </div>
      </div>

      {routePlan && (
        <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-700">
          <p>
            Stops:{" "}
            <span className="font-semibold">
              {routePlan.orderedReports.length}
            </span>
          </p>
          <p className="mt-1">
            Distance{" "}
            <span className="text-slate-500">
              ({routePlan.usedFallback ? "offline estimate" : "OSRM estimate"})
            </span>
            :{" "}
            <span className="font-semibold">
              {formatDistance(routePlan.distanceMeters)}
            </span>
          </p>
          <p className="mt-1">
            ETA{" "}
            <span className="text-slate-500">
              ({routePlan.usedFallback ? "offline estimate" : "OSRM estimate"})
            </span>
            :{" "}
            <span className="font-semibold">
              {formatDuration(routePlan.durationSeconds)}
            </span>
          </p>
          <p className="mt-1">
            Mode:{" "}
            <span className="font-semibold">
              {routePlan.usedFallback
                ? "Fallback nearest-stop"
                : "Road-network optimized"}
            </span>
          </p>
          <p className="mt-2 text-[11px] text-slate-500">
            Google Maps may show different distance and ETA as it uses a
            different routing engine and live traffic data. Note that Google
            Maps can display a maximum of 10 stops per route, so some locations
            may be omitted if your route exceeds this limit.
          </p>
          <button
            className={`mt-3 w-full ${primaryButtonClassName}`}
            onClick={onOpenGoogleMaps}
            disabled={isOptimizing}
          >
            Open in Google Maps
          </button>
        </div>
      )}

      {routeError && (
        <p className="mt-2 text-xs text-amber-600">{routeError}</p>
      )}
      {googleMapsHint && (
        <p className="mt-2 text-xs text-slate-600">{googleMapsHint}</p>
      )}
    </div>
  );
}
