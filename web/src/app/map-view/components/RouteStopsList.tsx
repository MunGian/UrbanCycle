import { Report } from "@/lib/api/apiModel";

type RouteStopsListProps = {
  listedStops: Report[];
  onViewDetails: (report: Report) => void;
  onViewOnMap: (report: Report) => void;
};

export function RouteStopsList({
  listedStops,
  onViewDetails,
  onViewOnMap,
}: RouteStopsListProps) {
  if (listedStops.length === 0) {
    return (
      <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
        No stops selected yet. Select stops to build a route.
      </p>
    );
  }

  return (
    <>
      {listedStops.map((report, index) => (
        <div
          key={report.id}
          className="rounded-lg border border-slate-200 bg-slate-50 p-2.5"
        >
          <p className="text-xs font-medium text-slate-700">
            {index + 1}. {report.type}
          </p>
          <p className="text-xs text-slate-600">{report.location}</p>
          <div className="mt-1 flex gap-2">
            <button
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
              onClick={() => onViewDetails(report)}
            >
              View Details
            </button>
            <button
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
              onClick={() => onViewOnMap(report)}
            >
              View on Map
            </button>
          </div>
        </div>
      ))}
    </>
  );
}
