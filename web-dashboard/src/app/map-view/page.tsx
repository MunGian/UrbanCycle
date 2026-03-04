"use client";

import dynamic from "next/dynamic";

// Dynamically import the Map component to avoid SSR issues with Leaflet
const ReportMapElement = dynamic(() => import("./components/ReportMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-4rem)] w-full flex items-center justify-center">
      Loading map...
    </div>
  ),
});

export default function MapViewPage() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 min-h-0 relative">
        <ReportMapElement />
      </div>
    </div>
  );
}
