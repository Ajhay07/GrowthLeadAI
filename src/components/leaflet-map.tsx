"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default marker icon paths, which break under Next.js bundling
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface LeafletMapProps {
  position: { lat: number; lng: number } | null;
  onPositionChange: (pos: { lat: number; lng: number }) => void;
  radiusKm: number;
}

function ClickHandler({
  onPositionChange,
}: {
  onPositionChange: (pos: { lat: number; lng: number }) => void;
}) {
  useMapEvents({
    click: (e) => {
      onPositionChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export default function LeafletMap({ position, onPositionChange, radiusKm }: LeafletMapProps) {
  // Default center: India (since recent searches were Chennai-area) —
  // adjust if you want a different default starting view.
  const defaultCenter: [number, number] = [12.9716, 77.5946];

  return (
    <div className="rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={position ? [position.lat, position.lng] : defaultCenter}
        zoom={12}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <ClickHandler onPositionChange={onPositionChange} />
        {position && (
          <>
            <Marker position={[position.lat, position.lng]} icon={defaultIcon} />
            <Circle
              center={[position.lat, position.lng]}
              radius={radiusKm * 1000}
              pathOptions={{ color: "#D4A24E", fillColor: "#D4A24E", fillOpacity: 0.1 }}
            />
          </>
        )}
      </MapContainer>
    </div>
  );
}