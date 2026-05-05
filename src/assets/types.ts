import type { DETInput } from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

export type RecordStatus = "NEU" | "IN_PRUEFUNG" | "FREIGEGEBEN" | "ABGELEHNT";

export const STATUS_COLORS: Record<RecordStatus, string> = {
  NEU: "#3b82f6",
  IN_PRUEFUNG: "#f59e0b",
  FREIGEGEBEN: "#22c55e",
  ABGELEHNT: "#C1272D",
};

export const STATUS_LABELS: Record<RecordStatus, string> = {
  NEU: "Neu",
  IN_PRUEFUNG: "In Prüfung",
  FREIGEGEBEN: "Freigegeben",
  ABGELEHNT: "Abgelehnt",
};

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
  ABGELEHNT: {
    label: "Abgelehnt",
    icon: HighlightOffIcon,
    chipColor: "error" as const,
    iconColor: "error.main",
  },
};

export const ENERGY_CARRIER_LABELS: Record<string, string> = {
  electricity: "Strom",
  natural_gas: "Erdgas",
  heating_oil_light: "Heizöl (leicht)",
  wood_pellets: "Holzpellets",
  district_heating: "Fernwärme",
  renewable_electricity: "Erneuerbarer Strom",
};

export const HEATING_SYSTEM_LABELS: Record<string, string> = {
  air_source_heat_pump_lt_40: "Luftwärmepumpe (< 40°C)",
  air_source_heat_pump_55_45: "Luftwärmepumpe (55/45°C)",
  ground_source_heat_pump_lt_40: "Erdwärmepumpe (< 40°C)",
  condensing_boiler_70_55: "Brennwertkessel (70/55°C)",
  improved_condensing_boiler_55_45: "Verbesserter Brennwertkessel (55/45°C)",
  standard_boiler_70_55: "Standard-Heizkessel (70/55°C)",
  low_temperature_boiler_oil_gas_70_55:
    "Niedertemperaturkessel Öl/Gas (70/55°C)",
  district_heating_all_temperatures: "Fernwärme (alle Temperaturen)",
};

export const HEATING_SURFACE_LABELS: Record<string, string> = {
  radiant_surface_heating: "Fußbodenheizung",
  free_heat_emitter: "Heizkörper",
};

export const ROOF_CONSTRUCTION_LABELS: Record<string, string> = {
  wood_construction: "Holzkonstruktion",
  solid_construction: "Massivbauweise",
};

export const ROOF_INSULATION_LABELS: Record<string, string> = {
  betweenRafter: "Zwischen den Sparren",
  aboveRafter: "Über den Sparren",
};

export const BUILDING_TYPE_LABELS: Record<string, string> = {
  singleFamily: "Einfamilienhaus",
  multiFamily: "Mehrfamilienhaus",
};

export const WINDOW_TYPE_LABELS: Record<string, string> = {
  plastic_window_insulated_glazing: "Kunststofffenster (Isolierverglasung)",
  wooden_window_double_glazing: "Holzfenster (Doppelverglasung)",
  wooden_window_single_glazing: "Holzfenster (Einfachverglasung)",
};

export const TOP_FLOOR_TYPE_LABELS: Record<string, string> = {
  wood_beam_ceiling: "Holzbalkendecke",
  solid_ceiling: "Massivdecke",
};

export const OUTER_WALL_LABELS: Record<string, string> = {
  solid_wall_with_thermal_insulation_composite_system: "Massivwand mit WDVS",
  brick_wall: "Ziegelmauerwerk",
  other_wall: "Sonstige",
};

export const BOTTOM_FLOOR_LABELS: Record<string, string> = {
  reinforced_concrete_on_ground: "Stahlbeton (erdberührt)",
  reinforced_concrete_ceiling: "Stahlbetondecke",
};
