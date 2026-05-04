import type { DETInput } from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

export type RecordStatus =
  | "NEU"
  | "IN_PRUEFUNG"
  | "FREIGEGEBEN"
  | "UNPLAUSIBEL";

export interface BuildingRecord {
  id: string;
  buildingAddress: string;
  receivedDate: string;
  status: RecordStatus;
  assignedTo: string | null;
  assignedAt: Date | null;
  notes: string;
  variantGroup?: string;
  variantLabel?: string;
  rejectedDueToApprovalOf?: string;
  rejectedDueToApprovalOfLabel?: string;
  resolvedAt?: Date | null;
  resolvedBy?: string | null;
  detInput?: DETInput;
}

export const statusConfig = {
  NEU: {
    label: "Neu",
    icon: ErrorOutlineIcon,
    chipColor: "primary" as const,
    iconColor: "primary.main",
  },
  IN_PRUEFUNG: {
    label: "In Prüfung",
    icon: AccessTimeIcon,
    chipColor: "warning" as const,
    iconColor: "warning.main",
  },
  FREIGEGEBEN: {
    label: "Freigegeben",
    icon: CheckCircleOutlineIcon,
    chipColor: "success" as const,
    iconColor: "success.main",
  },
  UNPLAUSIBEL: {
    label: "Unplausibel",
    icon: HighlightOffIcon,
    chipColor: "error" as const,
    iconColor: "error.main",
  },
};
