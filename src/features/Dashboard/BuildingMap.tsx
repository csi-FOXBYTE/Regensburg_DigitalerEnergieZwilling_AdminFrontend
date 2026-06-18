import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  type SubmissionSummary,
} from "../../assets/types";

interface BuildingMapProps {
  submissions: SubmissionSummary[];
  onBuildingClick?: (submission: SubmissionSummary) => void;
  selectedSubmissionId?: string;
}

export default function BuildingMap({
  submissions,
  onBuildingClick,
  selectedSubmissionId,
}: BuildingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const onBuildingClickRef = useRef(onBuildingClick);

  useEffect(() => {
    onBuildingClickRef.current = onBuildingClick;
  });

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

    submissions.forEach((submission: SubmissionSummary) => {
      const coords: [number, number] = [
        submission.latitude,
        submission.longitude,
      ];

      const isSelected = submission.id === selectedSubmissionId;
      const color = STATUS_COLORS[submission.status];
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
        .bindTooltip(
          `<div style="font-family:system-ui,sans-serif;min-width:180px">
            <strong style="font-size:13px">${submission.buildingAddress.split(",")[0]}</strong><br/><br/>
            <span style="font-size:12px;color:#333">Status: <strong>${STATUS_LABELS[submission.status]}</strong></span><br/>
            <span style="font-size:12px;color:#444">Eingereicht: ${new Date(submission.receivedDate).toLocaleDateString("de-DE")}</span>
          </div>`,
        );
      marker.on("mouseover", () => marker.openTooltip());
      marker.on("mouseout", () => marker.closeTooltip());
      marker.on("click", () => onBuildingClickRef.current?.(submission));

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.remove());
    };
  }, [submissions, selectedSubmissionId]);

  return (
    <div
      ref={mapRef}
      style={{ width: "100%", height: "100%", minHeight: 360 }}
      role="application"
      aria-label="Interaktive Karte der eingereichten Gebäude"
    />
  );
}
