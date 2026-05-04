import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import { type BuildingRecord, type RecordStatus } from "../../assets/types";

interface BuildingMapProps {
  buildings: BuildingRecord[];
  onBuildingClick?: (building: BuildingRecord) => void;
  selectedBuildingId?: string;
}

export const STATUS_COLORS: Record<RecordStatus, string> = {
  NEU: "#3b82f6",
  IN_PRUEFUNG: "#f59e0b",
  FREIGEGEBEN: "#22c55e",
  UNPLAUSIBEL: "#C1272D",
};

const BERLIN_PLZ: Record<string, [number, number]> = {
  "10115": [52.5308, 13.3836],
  "10117": [52.5155, 13.3885],
  "10178": [52.5213, 13.4069],
  "10243": [52.5127, 13.4469],
  "10405": [52.5337, 13.4269],
  "10435": [52.5408, 13.4174],
  "10439": [52.5478, 13.4123],
  "10623": [52.5087, 13.3231],
  "10625": [52.5108, 13.308],
  "10629": [52.5044, 13.3074],
  "10709": [52.4972, 13.3194],
  "10785": [52.5056, 13.3719],
  "10961": [52.4946, 13.406],
  "10967": [52.4893, 13.413],
  "10997": [52.501, 13.4388],
  "12057": [52.4767, 13.4338],
  "12099": [52.4667, 13.3891],
  "12439": [52.4418, 13.6025],
  "12489": [52.4452, 13.5491],
  "13353": [52.5441, 13.3558],
  "14059": [52.5153, 13.2742],
  "93047": [49.0207, 12.0972],
};

function coordsForRecord(record: BuildingRecord): [number, number] | null {
  const plzMatch = record.buildingAddress.match(/\b(\d{5})\b/);
  if (plzMatch?.[1]) {
    const coords = BERLIN_PLZ[plzMatch[1]];
    if (coords) {
      const jitter = (Math.abs(record.id.charCodeAt(0) * 31 + record.id.charCodeAt(record.id.length - 1)) % 100) / 10000;
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

  useEffect(() => {
    if (!mapRef.current) return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [52.52, 13.405],
        11,
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

      const statusLabels: Record<RecordStatus, string> = {
        NEU: "Neu",
        IN_PRUEFUNG: "In Prüfung",
        FREIGEGEBEN: "Freigegeben",
        UNPLAUSIBEL: "Unplausibel",
      };

      const marker = L.marker(coords, { icon })
        .addTo(mapInstanceRef.current!)
        .bindPopup(
          `<div style="font-family:system-ui,sans-serif;min-width:180px">
            <strong style="font-size:13px">${record.buildingAddress.split(",")[0]}</strong><br/>
            <span style="font-size:11px;color:#555">${record.buildingAddress.split(",").slice(1).join(",").trim()}</span><br/><br/>
            <span style="font-size:12px;color:#333">Status: <strong>${statusLabels[record.status]}</strong></span><br/>
            <span style="font-size:11px;color:#777">Eingereicht: ${new Date(record.receivedDate).toLocaleDateString("de-DE")}</span>
          </div>`,
        );

      if (onBuildingClick) {
        marker.on("click", () => onBuildingClick(record));
      }

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
    };
  }, [buildings, selectedBuildingId, onBuildingClick]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", minHeight: 360 }}
      role="application"
      aria-label="Interaktive Karte der eingereichten Gebäude"
    />
  );
}
