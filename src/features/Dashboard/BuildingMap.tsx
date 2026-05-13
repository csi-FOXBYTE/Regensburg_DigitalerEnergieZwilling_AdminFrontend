import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  type BuildingRecord,
} from "../../assets/types";

interface BuildingMapProps {
  buildings: BuildingRecord[];
  onBuildingClick?: (building: BuildingRecord) => void;
  selectedBuildingId?: string;
}

const REGENSBURG_PLZ: Record<string, [number, number]> = {
  "93047": [49.0207, 12.0972], // Altstadt / Innenstadt
  "93049": [49.022, 12.052], // Westenviertel / Prüfening
  "93051": [49.008, 12.115], // Ostenviertel / Stadtamhof
  "93053": [49.002, 12.107], // Kumpfmühl / Galgenberg

  "93055": [48.998, 12.138], // Burgweinting / Harting
  "93057": [49.044, 12.105], // Reinhausen / Steinweg
  "93059": [49.014, 12.068], // Konradsiedlung / Weichs
};

function coordsForRecord(record: BuildingRecord): [number, number] | null {
  const plzMatch = record.buildingAddress.match(/\b(\d{5})\b/);
  if (plzMatch?.[1]) {
    const coords = REGENSBURG_PLZ[plzMatch[1]];
    if (coords) {
      const jitter =
        (Math.abs(
          record.id.charCodeAt(0) * 31 +
            record.id.charCodeAt(record.id.length - 1),
        ) %
          100) /
        10000;
      const sign = record.id.charCodeAt(0) % 2 === 0 ? 1 : -1;
      return [coords[0] + jitter * sign, coords[1] + jitter];
    }
  }
  return null;
}

export default function BuildingMap({
  buildings,
  onBuildingClick,
  selectedBuildingId,
}: BuildingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const onBuildingClickRef = useRef(onBuildingClick);

  // Keep ref in sync without triggering the marker-rebuild effect
  useEffect(() => {
    onBuildingClickRef.current = onBuildingClick;
  });

  // Destroy map on unmount to avoid Leaflet memory leaks
  useEffect(() => {
    return () => {
      mapInstanceRef.current?.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [49.0207, 12.0972],
        13,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current);
    }

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    buildings.forEach((record) => {
      const coords = coordsForRecord(record);
      if (!coords) return;

      const isSelected = record.id === selectedBuildingId;
      const color = STATUS_COLORS[record.status];
      const size = isSelected ? 24 : 18;
      const border = isSelected ? 4 : 3;

      const icon = L.divIcon({
        className: "",
        html: `<div style="
          background-color:${color};
          width:${size}px;height:${size}px;
          border-radius:50%;
          border:${border}px solid white;
          box-shadow:0 2px 6px rgba(0,0,0,0.35);
          transform:translate(-50%,-50%);
        "></div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker(coords, { icon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(
          `<div style="font-family:system-ui,sans-serif;min-width:180px">
            <strong style="font-size:13px">${record.buildingAddress.split(",")[0]}</strong><br/>
            <span style="font-size:11px;color:#555">${record.buildingAddress.split(",").slice(1).join(",").trim()}</span><br/><br/>
            <span style="font-size:12px;color:#333">Status: <strong>${STATUS_LABELS[record.status]}</strong></span><br/>
            <span style="font-size:11px;color:#777">Eingereicht: ${new Date(record.receivedDate).toLocaleDateString("de-DE")}</span>
          </div>`,
        );

      marker.on("click", () => onBuildingClickRef.current?.(record));

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
    };
  }, [buildings, selectedBuildingId]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", minHeight: 360 }}
      role="application"
      aria-label="Interaktive Karte der eingereichten Gebäude"
    />
  );
}
