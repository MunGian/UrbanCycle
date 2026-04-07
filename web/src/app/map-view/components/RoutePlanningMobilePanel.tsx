import { Report } from "@/lib/api/apiModel";
import { RoutePlan } from "@/app/map-view/components/reportMapTypes";

type RoutePlanningMobilePanelProps = {
  selectedReports: Report[];
  routeEligibleReports: Report[];
  listedStopsCount: number;
  routePlan: RoutePlan | null;
  routeError: string | null;
  googleMapsHint: string | null;
  isOptimizing: boolean;
  isMobileStopsOpen: boolean;
  primaryButtonClassName: string;
  secondaryButtonClassName: string;
  onOpenStopModal: () => void;
  onCalculateRoute: () => void;
  onClearRoute: () => void;
  onToggleStops: () => void;
  onOpenGoogleMaps: () => void;
  formatDistance: (meters: number) => string;
  formatDuration: (seconds: number) => string;
};

export function RoutePlanningMobilePanel({
  selectedReports,
  routeEligibleReports,
  listedStopsCount,
  routePlan,
  routeError,
  googleMapsHint,
  isOptimizing,
  isMobileStopsOpen,
  primaryButtonClassName,
  secondaryButtonClassName,
  onOpenStopModal,
  onCalculateRoute,
  onClearRoute,
  onToggleStops,
  onOpenGoogleMaps,
  formatDistance,
  formatDuration,
}: RoutePlanningMobilePanelProps) {
  return (
    <div className="absolute bottom-3 left-3 right-3 z-[1000] rounded-2xl border border-slate-200 bg-white/95 p-3 shadow-lg backdrop-blur-sm sm:hidden">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold text-slate-700">Route Planning</p>
          <p className="text-[11px] text-slate-600">
            Sel: {selectedReports.length}/{routeEligibleReports.length} | Stops:{" "}
            {listedStopsCount}
          </p>
        </div>
        <button className={secondaryButtonClassName} onClick={onOpenStopModal}>
          Manage
        </button>
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          className={primaryButtonClassName}
          onClick={onCalculateRoute}
          disabled={isOptimizing || selectedReports.length === 0}
        >
          {isOptimizing ? "Calculating..." : "Calculate Route"}
        </button>
        <button
          className={secondaryButtonClassName}
          onClick={onClearRoute}
          disabled={isOptimizing}
        >
          Clear
        </button>
        <button className={secondaryButtonClassName} onClick={onToggleStops}>
          {isMobileStopsOpen ? "Hide Stops" : "View Stops"}
        </button>
      </div>

      {routePlan && (
        <div className="mt-2 rounded-lg border border-slate-200 bg-white p-2.5 text-[11px] text-slate-700">
          <p>
            Dist{" "}
            <span className="text-slate-500">
              ({routePlan.usedFallback ? "offline est." : "OSRM est."})
            </span>
            : <span className="font-semibold">{formatDistance(routePlan.distanceMeters)}</span>{" "}
            | ETA <span className="font-semibold">{formatDuration(routePlan.durationSeconds)}</span>
          </p>
          <button
            className={`mt-2 w-full ${secondaryButtonClassName}`}
            onClick={onOpenGoogleMaps}
            disabled={isOptimizing}
          >
            Open in Google Maps
          </button>
        </div>
      )}

      {routeError && <p className="mt-2 text-xs text-amber-600">{routeError}</p>}
      {googleMapsHint && <p className="mt-2 text-xs text-slate-600">{googleMapsHint}</p>}
    </div>
  );
}
