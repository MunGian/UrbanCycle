import { Navigation, MapPin } from "lucide-react";

interface ReportMapProps {
  latitude?: number;
  longitude?: number;
  location?: string;
}

export function ReportMap({ latitude, longitude, location }: ReportMapProps) {
  return (
    <div className="flex-1 bg-gray-100/50 rounded-xl overflow-hidden relative border border-gray-200 shadow-sm h-full w-full min-h-[300px]">
      {/* Floating Location Card */}
      <div className="absolute top-4 left-4 right-4 z-1 mx-auto max-w-[calc(100%-2rem)] w-fit min-w-0 bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-sm border border-gray-100 flex items-center gap-3 transition-all hover:bg-white">
        <div className="p-2 bg-red-50 text-red-500 rounded-md shrink-0">
          <MapPin className="h-4 w-4" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            Location
          </h4>
          <p className="text-sm text-gray-900 truncate font-medium">
            {location || "Unknown Location"}
          </p>
          <div className="flex gap-2 text-[10px] text-gray-400 font-mono mt-0.5">
            <span>Lat: {latitude?.toFixed(4) ?? "N/A"}</span>
            <span>Lng: {longitude?.toFixed(4) ?? "N/A"}</span>
          </div>
        </div>
      </div>

      {/* Map View */}
      {latitude && longitude ? (
        <iframe
          title="Report Location Map"
          width="100%"
          height="100%"
          className="absolute inset-0 border-0 w-full h-full"
          src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
          allowFullScreen
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-50">
          <Navigation className="h-10 w-10 mb-2 opacity-20" />
          <p className="text-sm font-medium">Map unavailable</p>
          <p className="text-xs text-gray-400">Coordinates missing</p>
        </div>
      )}

      {/* Action Button */}
      {latitude && longitude && (
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 right-4 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-md border border-gray-200 transition-all flex items-center gap-2 z-10"
        >
          Open in Maps
          <Navigation className="h-3 w-3" />
        </a>
      )}
    </div>
  );
}
