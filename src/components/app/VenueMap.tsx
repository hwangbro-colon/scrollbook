"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import { VENUE_CATEGORY_ICON } from "@/lib/venue";

export type VenueMapPoint = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  category: string;
  avgRating: number | null;
  meetupCount: number;
};

function markerIcon(category: string) {
  const emoji = VENUE_CATEGORY_ICON[category] ?? "📍";
  return L.divIcon({
    html: `<div style="
      width:34px;height:34px;border-radius:9999px;
      background:#4f46e5;border:2px solid white;
      display:flex;align-items:center;justify-content:center;
      font-size:16px;box-shadow:0 2px 6px rgba(0,0,0,0.25);
    ">${emoji}</div>`,
    className: "",
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -17],
  });
}

export function VenueMap({
  venues,
  center,
  height = 260,
}: {
  venues: VenueMapPoint[];
  center: [number, number];
  height?: number;
}) {
  return (
    <div style={{ height }} className="w-full overflow-hidden rounded-2xl border border-indigo-100">
      <MapContainer center={center} zoom={14} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {venues.map((v) => (
          <Marker key={v.id} position={[v.lat, v.lng]} icon={markerIcon(v.category)}>
            <Popup>
              <div style={{ fontSize: 13, lineHeight: 1.5 }}>
                <strong>{v.name}</strong>
                <br />
                {v.address}
                <br />
                {v.avgRating ? `⭐ ${v.avgRating.toFixed(1)} · ` : ""}
                모임 {v.meetupCount}개
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
