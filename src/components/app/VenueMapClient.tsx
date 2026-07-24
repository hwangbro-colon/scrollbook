"use client";

import dynamic from "next/dynamic";
import type { VenueMapPoint } from "./VenueMap";

const VenueMap = dynamic(() => import("./VenueMap").then((mod) => mod.VenueMap), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[260px] rounded-2xl border border-indigo-100 bg-indigo-50 animate-pulse flex items-center justify-center text-indigo-300 text-sm">
      지도를 불러오는 중...
    </div>
  ),
});

export function VenueMapClient(props: { venues: VenueMapPoint[]; center: [number, number]; height?: number }) {
  return <VenueMap {...props} />;
}
