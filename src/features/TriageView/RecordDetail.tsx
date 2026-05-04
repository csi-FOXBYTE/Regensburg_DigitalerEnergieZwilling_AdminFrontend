import type { BuildingRecord } from "@/assets/types";
import { statusConfig } from "@/assets/types";
import { useAuth } from "@/components/AuthContext";
import { addAuditEntry } from "@/hooks/auditLog";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { RecordsContext } from "@/components/RecordsContext";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BuildIcon from "@mui/icons-material/Build";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import FoundationIcon from "@mui/icons-material/Foundation";
import LayersIcon from "@mui/icons-material/Layers";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import RoofingIcon from "@mui/icons-material/Roofing";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import WindowIcon from "@mui/icons-material/Window";
import type { SvgIconProps } from "@mui/material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

export function RecordDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { records, updateRecord, setRecords } = useContext(RecordsContext)!;
  const [record, setRecord] = useState<BuildingRecord | null>(null);
  const [notes, setNotes] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const hasChangesRef = useRef(false);

  // Kept fresh on every render so the unmount cleanup sees current values
  const updateRecordRef = useRef(updateRecord);
  updateRecordRef.current = updateRecord;
  const snapshotRef = useRef({ record, notes, currentUser });
  snapshotRef.current = { record, notes, currentUser };

  const variantSiblings = useMemo(() => {
    if (!record?.variantGroup) return [];
    return records.filter((r) => r.variantGroup === record.variantGroup);
  }, [record, records]);

  useEffect(() => {
    const foundRecord = records.find((r) => r.id === id);
    if (foundRecord) {
      setRecord(foundRecord);
      if (!hasChangesRef.current) setNotes(foundRecord.notes);
    }
  }, [id, records]);

  // Auto-save notes when navigating away, and log the action
  useEffect(() => {
    return () => {
      if (hasChangesRef.current && snapshotRef.current.record) {
        const { record, notes, currentUser } = snapshotRef.current;
        updateRecordRef.current({ ...record, notes });
        addAuditEntry("note", record, currentUser, notes.trim() || undefined);
      }
    };
  }, []);

  if (!record) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Typography color="text.secondary" gutterBottom>
            Datensatz nicht gefunden
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate({ to: "/dashboard" })}
          >
            Zurück zur Übersicht
          </Button>
        </Box>
      </Box>
    );
  }

  const isAssignedToMe = record.assignedTo === currentUser?.name;
  const isAssignedToOther = !!record.assignedTo && !isAssignedToMe;
  const canAssign =
    record.status === "NEU" && !record.assignedTo && !!currentUser;
  const canUnassign = isAssignedToMe && record.status === "IN_PRUEFUNG";
  const canDecide = isAssignedToMe && record.status === "IN_PRUEFUNG";
  const StatusIcon = statusConfig[record.status].icon;

  const handleAssignToMe = () => {
    if (!currentUser) return toast.error("Bitte zuerst einloggen.");
    updateRecord({
      ...record,
      status: "IN_PRUEFUNG",
      assignedTo: currentUser.name,
      assignedAt: new Date(),
    });
    addAuditEntry("assign", record, currentUser);
    toast.success("Datensatz zugewiesen. Status: In Prüfung");
  };

  const handleUnassign = () => {
    updateRecord({
      ...record,
      status: "NEU",
      assignedTo: null,
      assignedAt: null,
      notes: "",
    });
    addAuditEntry("deassign", record, currentUser);
    setNotes("");
    hasChangesRef.current = false;
    toast.success("Zuweisung aufgehoben.");
  };

  const handleAblehnen = () => {
    if (!notes.trim())
      return toast.error("Ein Kommentar ist bei Ablehnung erforderlich.");
    updateRecord({
      ...record,
      status: "UNPLAUSIBEL",
      notes,
      resolvedAt: new Date(),
      resolvedBy: currentUser?.name ?? null,
    });
    addAuditEntry("decline", record, currentUser, notes.trim());
    hasChangesRef.current = false;
    toast.success("Datensatz abgelehnt.");
  };

  const handleFreigeben = () => {
    const siblingsToAutoDecline = variantSiblings.filter(
      (s) => s.id !== record.id && s.status !== "FREIGEGEBEN" && s.status !== "UNPLAUSIBEL",
    );
    updateRecord({
      ...record,
      status: "FREIGEGEBEN",
      notes,
      resolvedAt: new Date(),
      resolvedBy: currentUser?.name ?? null,
    });
    addAuditEntry("approve", record, currentUser, notes.trim() || undefined);
    siblingsToAutoDecline.forEach((sibling) =>
      addAuditEntry(
        "auto_decline",
        sibling,
        null,
        `Automatisch abgelehnt durch Freigabe von ${record.variantLabel ?? record.id}`,
      ),
    );
    hasChangesRef.current = false;
    toast.success("Datensatz freigegeben.");
  };

  const handleDelete = () => {
    addAuditEntry("delete_building", record, currentUser);
    setRecords((prev) => prev.filter((r) => r.id !== record.id));
    toast.success("Datensatz gelöscht.");
    navigate({ to: "/dashboard" });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", p: 3 }}>
      <Box
        sx={{
          maxWidth: 960,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate({ to: "/dashboard" })}
              sx={{ mt: 0.5 }}
            >
              Zurück
            </Button>
            <Box>
              <Typography variant="h5">{record.buildingAddress}</Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.5 }}
              >
                <Typography variant="body2" color="text.secondary">
                  Eingegangen:{" "}
                  {new Date(record.receivedDate).toLocaleString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  •
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  ID: {record.id}
                </Typography>
              </Box>
            </Box>
          </Box>
          <Chip
            icon={<StatusIcon />}
            label={statusConfig[record.status].label}
            color={statusConfig[record.status].chipColor}
            sx={{ fontSize: "0.9rem", px: 1 }}
          />
        </Box>

        {isAssignedToOther && (
          <Alert severity="warning">
            Dieser Datensatz ist bereits <strong>{record.assignedTo}</strong>{" "}
            zugewiesen.
          </Alert>
        )}

        {/* Einreichungen panel */}
        {variantSiblings.length > 1 && (
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  mb: 0.5,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <LayersIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                  <Typography variant="h6">
                    Einreichungen ({variantSiblings.length})
                  </Typography>
                </Box>
                <Box sx={{ textAlign: "right" }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    gutterBottom
                  >
                    Einreichung auswählen
                  </Typography>
                  <Select
                    size="small"
                    value={record.id}
                    onChange={(e) =>
                      navigate({
                        to: "/record/$id",
                        params: { id: e.target.value },
                      })
                    }
                    sx={{ minWidth: 280 }}
                  >
                    {variantSiblings.map((s) => (
                      <MenuItem key={s.id} value={s.id}>
                        {s.variantLabel} -{" "}
                        {new Date(s.receivedDate).toLocaleString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        Uhr{s.status === "FREIGEGEBEN" ? " ✓" : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Wählen Sie eine Einreichung zur Detailansicht
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body2" fontWeight={600} sx={{ mb: 1.5 }}>
                Status-Übersicht aller Einreichungen
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {variantSiblings.map((s) => (
                  <Box
                    key={s.id}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2,
                      py: 1.25,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor:
                        s.id === record.id ? "primary.light" : "divider",
                      bgcolor:
                        s.id === record.id ? "primary.50" : "transparent",
                    }}
                  >
                    <Typography
                      variant="body2"
                      fontWeight={s.id === record.id ? 600 : 400}
                    >
                      {s.variantLabel}
                    </Typography>
                    {s.status === "FREIGEGEBEN" ? (
                      <Chip
                        label="✓ Freigegebene Einreichung"
                        size="small"
                        color="success"
                        variant="outlined"
                      />
                    ) : s.rejectedDueToApprovalOf ? (
                      <Chip
                        label={`Automatisch abgelehnt durch ${s.rejectedDueToApprovalOfLabel}`}
                        size="small"
                        color="warning"
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        label={statusConfig[s.status].label}
                        size="small"
                        color={statusConfig[s.status].chipColor}
                        variant="outlined"
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Assignment info with toggle button */}
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", gap: 4 }}>
                <Box>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Zugewiesen an
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={isAssignedToMe ? 600 : 400}
                  >
                    {record.assignedTo ?? "Nicht zugewiesen"}
                  </Typography>
                </Box>
                {record.assignedAt && (
                  <Box>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Zugewiesen am
                    </Typography>
                    <Typography variant="body2">
                      {new Date(record.assignedAt).toLocaleString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Typography>
                  </Box>
                )}
              </Box>
              {(canAssign || canUnassign) && (
                <Button
                  variant="outlined"
                  color={canUnassign ? "warning" : "primary"}
                  onClick={canUnassign ? handleUnassign : handleAssignToMe}
                >
                  {canUnassign ? "Zuweisung aufheben" : "Sich zuweisen"}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Building info */}
        <InfoCard icon={ApartmentIcon} title="Gebäudeinformationen" cols={2}>
          <InfoItem
            label="Gebäudetyp"
            value={fmt(record.detInput?.general.type, undefined, BUILDING_TYPE_LABELS)}
          />
          <InfoItem
            label="Baujahr"
            value={record.detInput?.general.buildingYear ?? "Nicht angegeben"}
          />
          <InfoItem
            label="Wohnfläche"
            value={`${record.detInput?.general.livingArea ?? "Nicht angegeben"} m²`}
          />
          <InfoItem
            label="Geschosse"
            value={
              record.detInput?.general.numberOfStories ?? "Nicht angegeben"
            }
          />
        </InfoCard>

        {/* Dach */}
        <InfoCard icon={RoofingIcon} title="Dach" cols={3}>
          <InfoItem
            label="Baujahr / Letzte Sanierung"
            value={fmt(record.detInput?.roof.year)}
          />
          <InfoItem
            label="Dachfläche"
            value={fmt(record.detInput?.roof.area, "m²")}
          />
          <InfoItem
            label="Dachkonstruktion"
            value={fmt(
              record.detInput?.roof.constructionType,
              undefined,
              ROOF_CONSTRUCTION_LABELS,
            )}
          />
          <InfoItem
            label="Gedämmt"
            value={fmt(record.detInput?.roof.hasInsulation)}
          />
          <InfoItem
            label="Dämmdicke"
            value={fmt(record.detInput?.roof.insulationThickness, "cm")}
          />
          <InfoItem
            label="Dämmungstyp"
            value={fmt(
              record.detInput?.roof.insulationType,
              undefined,
              ROOF_INSULATION_LABELS,
            )}
          />
        </InfoCard>

        {/* Heizung */}
        <InfoCard icon={LocalFireDepartmentIcon} title="Heizung" cols={2}>
          <InfoItem
            label="Baujahr Heizungssystem"
            value={fmt(record.detInput?.heat.heatingSystemConstructionYear)}
          />
          <InfoItem
            label="Primärenergieträger"
            value={fmt(
              record.detInput?.heat.primaryEnergyCarrier,
              undefined,
              ENERGY_CARRIER_LABELS,
            )}
          />
          <InfoItem
            label="Heizungstyp"
            value={fmt(
              record.detInput?.heat.heatingSystemType,
              undefined,
              HEATING_SYSTEM_LABELS,
            )}
          />
          <InfoItem
            label="Wärmeabgabesystem"
            value={fmt(
              record.detInput?.heat.heatingSurfaceType,
              undefined,
              HEATING_SURFACE_LABELS,
            )}
          />
        </InfoCard>

        {/* Dachfenster */}
        {(record.detInput?.roofWindows?.area ?? 0) > 0 && (
          <InfoCard icon={WindowIcon} title="Dachfenster" cols={2}>
            <InfoItem
              label="Fläche"
              value={fmt(record.detInput?.roofWindows?.area, "m²")}
            />
            <InfoItem
              label="Baujahr / Letzte Sanierung"
              value={fmt(record.detInput?.roofWindows?.year)}
            />
            <InfoItem
              label="Fenstertyp"
              value={fmt(
                record.detInput?.roofWindows?.windowType,
                undefined,
                WINDOW_TYPE_LABELS,
              )}
            />
            <InfoItem
              label="U-Wert"
              value={fmt(record.detInput?.roofWindows?.uValue, "W/(m²K)")}
            />
          </InfoCard>
        )}

        {/* Außenwandfenster */}
        <InfoCard icon={WindowIcon} title="Außenwandfenster" cols={2}>
          <InfoItem
            label="Fläche"
            value={fmt(record.detInput?.exteriorWallWindows.area, "m²")}
          />
          <InfoItem
            label="Baujahr / Letzte Sanierung"
            value={fmt(record.detInput?.exteriorWallWindows.year)}
          />
          <InfoItem
            label="Fenstertyp"
            value={fmt(
              record.detInput?.exteriorWallWindows.windowType,
              undefined,
              WINDOW_TYPE_LABELS,
            )}
          />
          <InfoItem
            label="U-Wert"
            value={fmt(record.detInput?.exteriorWallWindows.uValue, "W/(m²K)")}
          />
        </InfoCard>

        {/* Oberste Geschossdecke */}
        <InfoCard icon={LayersIcon} title="Oberste Geschossdecke" cols={3}>
          <InfoItem
            label="Fläche"
            value={fmt(record.detInput?.topFloor.area, "m²")}
          />
          <InfoItem
            label="Baujahr / Letzte Sanierung"
            value={fmt(record.detInput?.topFloor.year)}
          />
          <InfoItem
            label="Deckenkonstruktion"
            value={fmt(
              record.detInput?.topFloor.topFloorType,
              undefined,
              TOP_FLOOR_TYPE_LABELS,
            )}
          />
          <InfoItem
            label="Hat Dachgeschoss"
            value={fmt(record.detInput?.topFloor.hasAttic)}
          />
          <InfoItem
            label="Dachgeschoss beheizt"
            value={fmt(record.detInput?.topFloor.isAtticHeated)}
          />
          <InfoItem
            label="Gedämmt"
            value={fmt(record.detInput?.topFloor.hasInsulation)}
          />
          <InfoItem
            label="Dämmdicke"
            value={fmt(record.detInput?.topFloor.insulationThickness, "cm")}
          />
        </InfoCard>

        {/* Außenwand */}
        <InfoCard icon={BuildIcon} title="Außenwand" cols={3}>
          <InfoItem
            label="Fläche"
            value={fmt(record.detInput?.outerWall.area, "m²")}
          />
          <InfoItem
            label="Baujahr / Letzte Sanierung"
            value={fmt(record.detInput?.outerWall.year)}
          />
          <InfoItem
            label="Konstruktionstyp"
            value={fmt(
              record.detInput?.outerWall.constructionType,
              undefined,
              OUTER_WALL_LABELS,
            )}
          />
          <InfoItem
            label="Gedämmt"
            value={fmt(record.detInput?.outerWall.hasInsulation)}
          />
          <InfoItem
            label="Dämmdicke"
            value={fmt(record.detInput?.outerWall.insulationThickness, "cm")}
          />
        </InfoCard>

        {/* Bodenplatte / Keller */}
        <InfoCard icon={FoundationIcon} title="Bodenplatte / Keller" cols={3}>
          <InfoItem
            label="Fläche"
            value={fmt(record.detInput?.bottomFloor.area, "m²")}
          />
          <InfoItem
            label="Baujahr / Letzte Sanierung"
            value={fmt(record.detInput?.bottomFloor.year)}
          />
          <InfoItem
            label="Konstruktionstyp"
            value={fmt(
              record.detInput?.bottomFloor.constructionType,
              undefined,
              BOTTOM_FLOOR_LABELS,
            )}
          />
          <InfoItem
            label="Beheizt"
            value={fmt(record.detInput?.bottomFloor.isHeated)}
          />
          <InfoItem
            label="Gedämmt"
            value={fmt(record.detInput?.bottomFloor.hasInsulation)}
          />
          <InfoItem
            label="Dämmdicke"
            value={fmt(record.detInput?.bottomFloor.insulationThickness, "cm")}
          />
          <InfoItem
            label="Hat Keller"
            value={fmt(record.detInput?.bottomFloor.hasBasement)}
          />
          <InfoItem
            label="Keller beheizt"
            value={fmt(record.detInput?.bottomFloor.isBasementHeated)}
          />
        </InfoCard>

        {/* Prüfung und Freigabe / Audit-Protokoll */}
        {record.status === "FREIGEGEBEN" || record.status === "UNPLAUSIBEL" ? (
          <Card>
            <CardHeader
              title="Audit-Protokoll"
              subheader="Nachvollziehbare Historie aller Änderungen"
            />
            <CardContent>
              <Box
                sx={{
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  p: 2,
                  display: "flex",
                  gap: 2,
                  alignItems: "flex-start",
                }}
              >
                <AccessTimeIcon
                  sx={{ color: "text.secondary", fontSize: 20, mt: 0.25 }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    STATUS_CHANGED
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {record.rejectedDueToApprovalOf
                      ? `Automatisch abgelehnt - Einreichung "${record.rejectedDueToApprovalOfLabel}" wurde freigegeben`
                      : `Status geändert von "In Prüfung" zu "${statusConfig[record.status].label}"`}
                  </Typography>
                  {record.resolvedAt && record.resolvedBy && (
                    <Typography variant="caption" color="text.secondary">
                      {new Date(record.resolvedAt).toLocaleString("de-DE")} von{" "}
                      {record.resolvedBy}
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader
              title="Prüfung und Freigabe"
              subheader="Bewerten Sie die Einreichung und treffen Sie eine Entscheidung"
            />
            <CardContent>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Kommentar (optional bei Freigabe, erforderlich bei Ablehnung)
              </Typography>
              <TextField
                multiline
                rows={4}
                fullWidth
                placeholder="Fügen Sie hier Ihre Anmerkungen hinzu..."
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  hasChangesRef.current = true;
                }}
                disabled={!isAssignedToMe}
                sx={{
                  mb: 2,
                  "& .MuiInputBase-root": {
                    bgcolor: !isAssignedToMe ? "grey.100" : undefined,
                  },
                }}
              />
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  color="success"
                  fullWidth
                  size="large"
                  startIcon={<TaskAltIcon />}
                  disabled={!canDecide}
                  onClick={handleFreigeben}
                  sx={{
                    "&.Mui-disabled": {
                      bgcolor: "success.main",
                      color: "white",
                      opacity: 0.38,
                    },
                  }}
                >
                  Freigeben
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  fullWidth
                  size="large"
                  startIcon={<CancelIcon />}
                  disabled={!canDecide}
                  onClick={handleAblehnen}
                  sx={{
                    "&.Mui-disabled": {
                      bgcolor: "error.main",
                      color: "white",
                      opacity: 0.38,
                    },
                  }}
                >
                  Ablehnen
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Danger zone */}
        <Card>
          <CardContent>
            <Typography
              variant="h6"
              color="error"
              gutterBottom
              fontWeight={700}
            >
              Gefahrenzone
            </Typography>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Unwiderrufliche Aktionen - Vorsicht geboten
            </Typography>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setDeleteDialogOpen(true)}
              sx={{ mt: 1 }}
            >
              Gebäude löschen
            </Button>
          </CardContent>
        </Card>

        <Box sx={{ mb: 2 }} />
      </Box>

      <ConfirmDeleteDialog
        open={deleteDialogOpen}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />
    </Box>
  );
}

const ENERGY_CARRIER_LABELS: Record<string, string> = {
  electricity: "Strom",
  natural_gas: "Erdgas",
  heating_oil_light: "Heizöl (leicht)",
  wood_pellets: "Holzpellets",
  district_heating: "Fernwärme",
  renewable_electricity: "Erneuerbarer Strom",
};

const HEATING_SYSTEM_LABELS: Record<string, string> = {
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

const HEATING_SURFACE_LABELS: Record<string, string> = {
  radiant_surface_heating: "Fußbodenheizung",
  free_heat_emitter: "Heizkörper",
};

const ROOF_CONSTRUCTION_LABELS: Record<string, string> = {
  wood_construction: "Holzkonstruktion",
  solid_construction: "Massivbauweise",
};

const ROOF_INSULATION_LABELS: Record<string, string> = {
  betweenRafter: "Zwischen den Sparren",
  aboveRafter: "Über den Sparren",
};

const BUILDING_TYPE_LABELS: Record<string, string> = {
  singleFamily: "Einfamilienhaus",
  multiFamily: "Mehrfamilienhaus",
};

const WINDOW_TYPE_LABELS: Record<string, string> = {
  plastic_window_insulated_glazing: "Kunststofffenster (Isolierverglasung)",
  wooden_window_double_glazing: "Holzfenster (Doppelverglasung)",
  wooden_window_single_glazing: "Holzfenster (Einfachverglasung)",
};

const TOP_FLOOR_TYPE_LABELS: Record<string, string> = {
  wood_beam_ceiling: "Holzbalkendecke",
  solid_ceiling: "Massivdecke",
};

const OUTER_WALL_LABELS: Record<string, string> = {
  solid_wall_with_thermal_insulation_composite_system: "Massivwand mit WDVS",
  brick_wall: "Ziegelmauerwerk",
  other_wall: "Sonstige",
};

const BOTTOM_FLOOR_LABELS: Record<string, string> = {
  reinforced_concrete_on_ground: "Stahlbeton (erdberührt)",
  reinforced_concrete_ceiling: "Stahlbetondecke",
};

function fmt(
  value: unknown,
  suffix?: string,
  map?: Record<string, string>,
): string {
  if (value === null || value === undefined) return "Nicht angegeben";
  if (typeof value === "boolean") return value ? "Ja" : "Nein";
  const str = String(value);
  const translated = map ? (map[str] ?? str) : str;
  return suffix ? `${translated} ${suffix}` : translated;
}

function InfoCard({
  icon: Icon,
  title,
  cols,
  children,
}: {
  icon: React.ComponentType<SvgIconProps>;
  title: string;
  cols?: number;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader
        avatar={<Icon sx={{ fontSize: 22, color: "error.main" }} />}
        title={title}
      />
      <CardContent>
        {cols ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: `repeat(${cols}, 1fr)` },
              gap: 2,
            }}
          >
            {children}
          </Box>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}

function InfoItem({ label, value }: { label: string; value: string | number }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
