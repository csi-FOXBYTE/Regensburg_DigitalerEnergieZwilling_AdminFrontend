import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { MapContainer, Marker, TileLayer, Tooltip } from "react-leaflet";
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

function createIcon(color: string, size: number, border: number) {
  return L.divIcon({
    className: "",
    html: `<div style="background-color:${color};width:${size}px;height:${size}px;border-radius:50%;border:${border}px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.35);transform:translate(-50%,-50%);"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

export default function BuildingMap({
  submissions,
  onBuildingClick,
  selectedSubmissionId,
}: BuildingMapProps) {
  return (
    <MapContainer
      center={[49.0207, 12.0972]}
      zoom={13}
      style={{ width: "100%", height: "100%", minHeight: 360 }}
      role="application"
      aria-label="Interaktive Karte der eingereichten Gebäude"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      {submissions.map((submission) => {
        const isSelected = submission.id === selectedSubmissionId;
        const size = isSelected ? 24 : 18;
        const border = isSelected ? 4 : 3;
        const icon = createIcon(STATUS_COLORS[submission.status], size, border);
        const street = submission.buildingAddress.split(",")[0];

        return (
          <Marker
            key={submission.id}
            position={[submission.latitude, submission.longitude]}
            icon={icon}
            eventHandlers={{ click: () => onBuildingClick?.(submission) }}
          >
            <Tooltip>
              <div
                style={{ fontFamily: "system-ui, sans-serif", minWidth: 180 }}
              >
                <strong style={{ fontSize: 13 }}>{street}</strong>
                <br />
                <br />
                <span style={{ fontSize: 12, color: "#333" }}>
                  Status: <strong>{STATUS_LABELS[submission.status]}</strong>
                </span>
                <br />
                <span style={{ fontSize: 11, color: "#777" }}>
                  Eingereicht:{" "}
                  {new Date(submission.receivedDate).toLocaleDateString(
                    "de-DE",
                  )}
                </span>
              </div>
            </Tooltip>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
