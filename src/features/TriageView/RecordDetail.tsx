import { statusConfig } from "@/assets/types";
import { useAuth } from "@/components/AuthContext";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { RecordsContext } from "@/components/RecordsContext";
import { addAuditEntry } from "@/hooks/auditLog";
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
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "@nanostores/react";
import { toast } from "sonner";
import {
  BUILDING_TYPE_SELECTIONS,
  ROOF_INSULATION_SELECTIONS,
  resolveLabel,
  type LocalizableSelection,
} from "../../assets/labelResolver";
import { config } from "../../hooks/store";

export function RecordDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { records, updateRecord, setRecords } = useContext(RecordsContext)!;
  const cfg = useStore(config);
  const record = useMemo(
    () => records.find((r) => r.id === id) ?? null,
    [id, records],
  );
  // key={id} on this component ensures a fresh mount per record, so lazy init is safe
  const [notes, setNotes] = useState(() => record?.notes ?? "");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const hasChangesRef = useRef(false);

  const updateRecordRef = useRef(updateRecord);
  const snapshotRef = useRef({ record, notes, currentUser });

  // Kept fresh after every render so the unmount cleanup sees current values
  useEffect(() => {
    updateRecordRef.current = updateRecord;
    snapshotRef.current = { record, notes, currentUser };
  });

  const variantSiblings = useMemo(() => {
    if (!record?.variantGroup) return [];
    return records.filter((r) => r.variantGroup === record.variantGroup);
  }, [record, records]);

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
          <Typography variant="h3" gutterBottom>
            Datensatz nicht gefunden
          </Typography>
          <Button
            variant="outlined"
            onClick={() => navigate({ to: "/maintenance" })}
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
      status: "ABGELEHNT",
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
      (s) =>
        s.id !== record.id &&
        s.status !== "FREIGEGEBEN" &&
        s.status !== "ABGELEHNT",
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
    <Box sx={{ width: "full" }}>
      <Box
        sx={{
          maxWidth: 1170,
          mx: "auto",
          py: 3,
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
              color="error"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate({ to: "/maintenance" })}
              sx={{ mt: 0.5 }}
            >
              Zurück
            </Button>
            <Box>
              <Typography variant="h2">{record.buildingAddress}</Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.5 }}
              >
                <Typography variant="h4">
                  Eingegangen:{" "}
                  {new Date(record.receivedDate).toLocaleString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
                <Typography variant="h4">•</Typography>
                <Typography variant="h4">ID: {record.id}</Typography>
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
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}
              >
                <LayersIcon sx={{ fontSize: 20 }} />
                <Typography variant="h3">
                  Einreichungen ({variantSiblings.length})
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {variantSiblings.map((s) => (
                  <Box
                    key={s.id}
                    onClick={() =>
                      navigate({ to: "/record/$id", params: { id: s.id } })
                    }
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2,
                      py: 1.25,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: s.id === record.id ? "#E30613" : "divider",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Typography
                      variant="body1"
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
                  <Typography variant="h4" display="block">
                    Zugewiesen an
                  </Typography>
                  <Typography
                    variant="body1"
                    fontWeight={isAssignedToMe ? 600 : 400}
                  >
                    {record.assignedTo ?? "Nicht zugewiesen"}
                  </Typography>
                </Box>
                {record.assignedAt && (
                  <Box>
                    <Typography variant="h4" display="block">
                      Zugewiesen am
                    </Typography>
                    <Typography variant="body1">
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
                  onClick={canUnassign ? handleUnassign : handleAssignToMe}
                  color="error"
                >
                  {canUnassign ? "Zuweisung aufheben" : "Mir zuweisen"}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Building info */}
        <InfoCard icon={ApartmentIcon} title="Gebäudeinformationen" cols={2}>
          <InfoItem
            label="Gebäudetyp"
            value={fmt(
              record.detInput?.general.type,
              undefined,
              BUILDING_TYPE_SELECTIONS,
            )}
          />
          <InfoItem
            label="Baujahr"
            value={fmt(record.detInput?.general.buildingYear)}
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
              cfg.roof.constructionTypes,
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
              ROOF_INSULATION_SELECTIONS,
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
                cfg.windows.windowTypes,
              )}
            />
            <InfoItem
              label="U-Wert"
              value={fmt(record.detInput?.roofWindows?.uValue, "W/(m²K)")}
            />
          </InfoCard>
        )}

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
              cfg.outerWall.constructionTypes,
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
              cfg.windows.windowTypes,
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
              cfg.topFloor.topFloorTypes,
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

        {/* Untere Geschossdecke */}
        <InfoCard icon={FoundationIcon} title="Untere Geschossdecke" cols={3}>
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
              cfg.bottomFloor.constructionTypes,
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
              cfg.heat.primaryEnergyCarriers,
            )}
          />
          <InfoItem
            label="Heizungstyp"
            value={fmt(
              record.detInput?.heat.heatingSystemType,
              undefined,
              cfg.heat.heatingSystemTypes,
            )}
          />
          <InfoItem
            label="Wärmeabgabesystem"
            value={fmt(
              record.detInput?.heat.heatingSurfaceType,
              undefined,
              cfg.heat.heatingSurfaceTypes,
            )}
          />
        </InfoCard>

        {/* Prüfung und Freigabe / Audit-Protokoll */}
        {record.status === "FREIGEGEBEN" || record.status === "ABGELEHNT" ? (
          <Card>
            <CardHeader
              title={<Typography variant="h4">Audit-Protokoll</Typography>}
              subheader={
                <Typography variant="body1" color="text.secondary">
                  Nachvollziehbare Historie aller Änderungen
                </Typography>
              }
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
              title={
                <Typography variant="h3" gutterBottom>
                  Prüfung und Freigabe
                </Typography>
              }
              subheader={
                <Typography variant="body1">
                  Bewerten Sie die Einreichung und treffen Sie eine Entscheidung
                </Typography>
              }
            />
            <CardContent>
              <Typography variant="h4" gutterBottom>
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
            <Typography variant="h3" color="error" gutterBottom>
              Gefahrenzone
            </Typography>
            <Typography variant="body1" gutterBottom>
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

function fmt(
  value: unknown,
  suffix?: string,
  selections?: LocalizableSelection[],
): string {
  if (value === null || value === undefined) return "Nicht angegeben";
  if (typeof value === "boolean") return value ? "Ja" : "Nein";
  if (typeof value === "object") {
    const { from, to } = value as { from?: number; to?: number };
    if (from != null && to != null) return `${from} – ${to}`;
    if (from != null) return `ab ${from}`;
    if (to != null) return `bis ${to}`;
    return "Nicht angegeben";
  }
  const str = String(value);
  const translated = selections ? (resolveLabel(selections, str) ?? str) : str;
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
        avatar={<Icon sx={{ fontSize: 26, color: "error.main" }} />}
        title={<Typography variant="h3">{title}</Typography>}
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
      <Typography variant="body1" color="text.secondary" display="block">
        {label}
      </Typography>
      <Typography variant="body1">{value}</Typography>
    </Box>
  );
}
