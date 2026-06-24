import { postApiAdminSubmissionsSubmissionIdDecline } from "@/api/api.gen";
import { statusConfig } from "@/assets/types";
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog";
import { AppFooter } from "@/components/Footer";
import {
  toDetailStatus,
  useAcceptSubmission,
  useAssignSubmission,
  useDeclineSubmission,
  useDeleteSubmission,
  useSubmission,
  useSubmissions,
  useUnassignSubmission,
} from "@/hooks/submissionHooks";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import {
  calculate,
  type DETConfig,
} from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import { GasMeter, LightbulbOutlineRounded, Power } from "@mui/icons-material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ApartmentIcon from "@mui/icons-material/Apartment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import BuildIcon from "@mui/icons-material/Build";
import CancelIcon from "@mui/icons-material/Cancel";
import DeleteIcon from "@mui/icons-material/Delete";
import FoundationIcon from "@mui/icons-material/Foundation";
import HistoryIcon from "@mui/icons-material/History";
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
  CircularProgress,
  TextField,
  Typography,
} from "@mui/material";
import { useStore } from "@nanostores/react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  BUILDING_TYPE_SELECTIONS,
  ROOF_INSULATION_SELECTIONS,
  resolveLabel,
  type LocalizableSelection,
} from "../../assets/labelResolver";
import { useLoadConfig } from "../../hooks/configHooks";
import { config } from "../../hooks/store";

export function RecordDetail({ id }: { id: string }) {
  const navigate = useNavigate();
  const currentUser = useCurrentUser();
  const queryClient = useQueryClient();
  const cfg = useStore(config);

  const { data: detail, isPending } = useSubmission(id);
  const { data: submissions } = useSubmissions();
  const { data: configData } = useLoadConfig(
    detail?.usedConfig.versionName ?? "",
  );

  const raw = detail?.detInput;
  let detInput = raw;
  if (raw && configData?.calculationConfig) {
    try {
      const parsedConfig = JSON.parse(configData.calculationConfig) as DETConfig;
      detInput = calculate(parsedConfig, raw).resolvedInput;
    } catch {
      // keep raw
    }
  }

  const [notes, setNotes] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [freigebenPending, setFreigebenPending] = useState(false);

  const assignMutation = useAssignSubmission();
  const unassignMutation = useUnassignSubmission();
  const acceptMutation = useAcceptSubmission();
  const declineMutation = useDeclineSubmission();
  const deleteMutation = useDeleteSubmission();

  const variantSiblings = useMemo(() => {
    if (!detail?.otherSubmissionIds.length) return [];
    const siblingIds = new Set([id, ...detail.otherSubmissionIds]);
    return (submissions ?? []).filter((s) => siblingIds.has(s.id));
  }, [submissions, detail, id]);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["submissions"] });
    void queryClient.invalidateQueries({ queryKey: ["submission", id] });
  };

  if (isPending) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", p: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!detail) {
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

  const status = detail.status;
  const isAssignedToMe =
    !!currentUser?.sub && detail.assignedToId === currentUser.sub;
  const isAssignedToOther = !!detail.assignedToId && !isAssignedToMe;
  const canAssign = status === "NEU" && !detail.assignedToId && !!currentUser;
  const canUnassign = isAssignedToMe && status === "IN_PRUEFUNG";
  const canDecide = isAssignedToMe && status === "IN_PRUEFUNG";
  const StatusIcon = statusConfig[status].icon;

  const handleAssignToMe = () => {
    if (!currentUser?.sub) return toast.error("Kein Benutzer — Token fehlt.");
    assignMutation.mutate(
      { submissionId: id, userId: currentUser.sub },
      {
        onSuccess: () => {
          invalidate();
          toast.success("Datensatz zugewiesen. Status: In Prüfung");
        },
        onError: () => toast.error("Zuweisung fehlgeschlagen."),
      },
    );
  };

  const handleUnassign = () => {
    unassignMutation.mutate(
      { submissionId: id },
      {
        onSuccess: () => {
          setNotes("");
          invalidate();
          toast.success("Zuweisung aufgehoben.");
        },
        onError: () => toast.error("Aufheben der Zuweisung fehlgeschlagen."),
      },
    );
  };

  const handleAblehnen = () => {
    if (!notes.trim())
      return toast.error("Ein Kommentar ist bei Ablehnung erforderlich.");
    declineMutation.mutate(
      { submissionId: id },
      {
        onSuccess: () => {
          invalidate();
          toast.success("Datensatz abgelehnt.");
        },
        onError: () => toast.error("Ablehnung fehlgeschlagen."),
      },
    );
  };

  const handleFreigeben = async () => {
    setFreigebenPending(true);
    try {
      await acceptMutation.mutateAsync({ submissionId: id });
    } catch {
      toast.error("Freigabe fehlgeschlagen.");
      setFreigebenPending(false);
      return;
    }

    const siblingsToDecline = variantSiblings.filter(
      (s) =>
        s.id !== id && s.status !== "FREIGEGEBEN" && s.status !== "ABGELEHNT",
    );
    if (siblingsToDecline.length > 0) {
      try {
        await Promise.all(
          siblingsToDecline.map((s) =>
            postApiAdminSubmissionsSubmissionIdDecline(s.id),
          ),
        );
        toast.success(
          "Datensatz freigegeben. Andere Einreichungen automatisch abgelehnt.",
        );
      } catch {
        toast.warning(
          "Datensatz freigegeben. Andere Einreichungen konnten nicht automatisch abgelehnt werden.",
        );
      }
    } else {
      toast.success("Datensatz freigegeben.");
    }

    invalidate();
    setFreigebenPending(false);
  };

  const handleDelete = () => {
    deleteMutation.mutate(
      { submissionId: id },
      {
        onSuccess: () => {
          void queryClient.invalidateQueries({ queryKey: ["submissions"] });
          toast.success("Datensatz gelöscht.");
          navigate({ to: "/maintenance" });
        },
        onError: () => toast.error("Löschen fehlgeschlagen."),
      },
    );
  };

  return (
    <Box sx={{ width: "100%" }}>
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
              <Typography variant="h2">{detail.buildingAddress}</Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 2, mt: 0.5 }}
              >
                <Typography variant="h4">
                  Eingegangen:{" "}
                  {new Date(detail.receivedDate).toLocaleString("de-DE", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
                <Typography variant="h4">•</Typography>
                <Typography variant="h4">ID: {id}</Typography>
              </Box>
            </Box>
          </Box>
          <Chip
            icon={<StatusIcon />}
            label={statusConfig[status].label}
            color={statusConfig[status].chipColor}
            sx={{ fontSize: "0.9rem", px: 1 }}
          />
        </Box>

        {isAssignedToOther && (
          <Alert severity="warning">
            Dieser Datensatz ist bereits <strong>{detail?.assignedTo}</strong>{" "}
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
                      borderColor: s.id === id ? "#E30613" : "divider",
                      cursor: "pointer",
                      "&:hover": { bgcolor: "action.hover" },
                    }}
                  >
                    <Typography
                      variant="body1"
                      fontWeight={s.id === id ? 600 : 400}
                    >
                      {s.variantLabel}
                    </Typography>
                    <Chip
                      label={
                        s.status === "FREIGEGEBEN"
                          ? "✓ Freigegebene Einreichung"
                          : statusConfig[s.status].label
                      }
                      size="small"
                      color={statusConfig[s.status].chipColor}
                      variant="outlined"
                    />
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
                    {detail?.assignedTo ?? "Nicht zugewiesen"}
                  </Typography>
                </Box>
                {detail?.assignedAt && (
                  <Box>
                    <Typography variant="h4" display="block">
                      Zugewiesen am
                    </Typography>
                    <Typography variant="body1">
                      {new Date(detail.assignedAt).toLocaleString("de-DE", {
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
                  disabled={
                    assignMutation.isPending || unassignMutation.isPending
                  }
                  color="error"
                >
                  {canUnassign ? "Zuweisung aufheben" : "Mir zuweisen"}
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Building info */}
        <InfoCard icon={ApartmentIcon} title="Gebäudeinformationen" cols={3}>
          <InfoItem
            label="Gebäudetyp"
            value={fmt(
              detInput?.general.type,
              undefined,
              BUILDING_TYPE_SELECTIONS,
            )}
          />
          <InfoItem
            label="Baujahr"
            value={fmt(detInput?.general.buildingYear)}
          />
          <InfoItem
            label="Wohnfläche"
            value={fmt(detInput?.general.livingArea, "m²")}
          />
          <InfoItem
            label="Geschosse"
            value={fmt(detInput?.general.numberOfStories)}
          />
          <InfoItem
            label="Gebäudehöhe"
            value={fmt(detInput?.general.buildingHeight, "m")}
          />
          <InfoItem
            label="Grundfläche"
            value={fmt(detInput?.general.buildingBaseArea, "m²")}
          />
        </InfoCard>

        {/* Dach */}
        <InfoCard icon={RoofingIcon} title="Dach" cols={3}>
          <InfoItem
            label="Baujahr / Letzte Sanierung"
            value={fmt(detInput?.roof.year)}
          />
          <InfoItem label="Dachfläche" value={fmt(detInput?.roof.area, "m²")} />
          <InfoItem
            label="Dachkonstruktion"
            value={fmt(
              detInput?.roof.constructionType,
              undefined,
              cfg.roof.constructionTypes,
            )}
          />
          <InfoItem label="Gedämmt" value={fmt(detInput?.roof.hasInsulation)} />
          <InfoItem
            label="Dämmdicke"
            value={fmt(detInput?.roof.insulationThickness, "cm")}
          />
          <InfoItem
            label="Dämmungstyp"
            value={fmt(
              detInput?.roof.insulationType,
              undefined,
              ROOF_INSULATION_SELECTIONS,
            )}
          />
          <InfoItem
            label="U-Wert"
            value={fmt(detInput?.roof.uValue, "W/(m²K)")}
          />
        </InfoCard>

        {/* Dachfenster */}
        {(detInput?.roofWindows?.area ?? 0) > 0 && (
          <InfoCard icon={WindowIcon} title="Dachfenster" cols={2}>
            <InfoItem
              label="Fläche"
              value={fmt(detInput?.roofWindows?.area, "m²")}
            />
            <InfoItem
              label="Baujahr / Letzte Sanierung"
              value={fmt(detInput?.roofWindows?.year)}
            />
            <InfoItem
              label="Fenstertyp"
              value={fmt(
                detInput?.roofWindows?.windowType,
                undefined,
                cfg.windows.windowTypes,
              )}
            />
            <InfoItem
              label="U-Wert"
              value={fmt(detInput?.roofWindows?.uValue, "W/(m²K)")}
            />
          </InfoCard>
        )}

        {/* Außenwand */}
        <InfoCard icon={BuildIcon} title="Außenwand" cols={3}>
          <InfoItem
            label="Fläche"
            value={fmt(detInput?.outerWall.area, "m²")}
          />
          <InfoItem
            label="Angrenzende Wandfläche"
            value={fmt(detInput?.outerWall.adjacentWallArea, "m²")}
          />
          <InfoItem
            label="Baujahr / Letzte Sanierung"
            value={fmt(detInput?.outerWall.year)}
          />
          <InfoItem
            label="Konstruktionstyp"
            value={fmt(
              detInput?.outerWall.constructionType,
              undefined,
              cfg.outerWall.constructionTypes,
            )}
          />
          <InfoItem
            label="Gedämmt"
            value={fmt(detInput?.outerWall.hasInsulation)}
          />
          <InfoItem
            label="Dämmdicke"
            value={fmt(detInput?.outerWall.insulationThickness, "cm")}
          />
          <InfoItem
            label="U-Wert"
            value={fmt(detInput?.outerWall.uValue, "W/(m²K)")}
          />
        </InfoCard>

        {/* Außenwandfenster */}
        <InfoCard icon={WindowIcon} title="Außenwandfenster" cols={2}>
          <InfoItem
            label="Fläche"
            value={fmt(detInput?.exteriorWallWindows.area, "m²")}
          />
          <InfoItem
            label="Baujahr / Letzte Sanierung"
            value={fmt(detInput?.exteriorWallWindows.year)}
          />
          <InfoItem
            label="Fenstertyp"
            value={fmt(
              detInput?.exteriorWallWindows.windowType,
              undefined,
              cfg.windows.windowTypes,
            )}
          />
          <InfoItem
            label="U-Wert"
            value={fmt(detInput?.exteriorWallWindows.uValue, "W/(m²K)")}
          />
        </InfoCard>

        {/* Oberste Geschossdecke */}
        <InfoCard icon={LayersIcon} title="Oberste Geschossdecke" cols={3}>
          <InfoItem label="Fläche" value={fmt(detInput?.topFloor.area, "m²")} />
          <InfoItem
            label="Baujahr / Letzte Sanierung"
            value={fmt(detInput?.topFloor.year)}
          />
          <InfoItem
            label="Deckenkonstruktion"
            value={fmt(
              detInput?.topFloor.topFloorType,
              undefined,
              cfg.topFloor.topFloorTypes,
            )}
          />
          <InfoItem
            label="Hat Dachgeschoss"
            value={fmt(detInput?.topFloor.hasAttic)}
          />
          <InfoItem
            label="Dachgeschoss beheizt"
            value={fmt(detInput?.topFloor.isAtticHeated)}
          />
          <InfoItem
            label="Gedämmt"
            value={fmt(detInput?.topFloor.hasInsulation)}
          />
          <InfoItem
            label="Dämmdicke"
            value={fmt(detInput?.topFloor.insulationThickness, "cm")}
          />
          <InfoItem
            label="U-Wert"
            value={fmt(detInput?.topFloor.uValue, "W/(m²K)")}
          />
        </InfoCard>

        {/* Untere Geschossdecke */}
        <InfoCard icon={FoundationIcon} title="Untere Geschossdecke" cols={3}>
          <InfoItem
            label="Fläche"
            value={fmt(detInput?.bottomFloor.area, "m²")}
          />
          <InfoItem
            label="Baujahr / Letzte Sanierung"
            value={fmt(detInput?.bottomFloor.year)}
          />
          <InfoItem
            label="Konstruktionstyp"
            value={fmt(
              detInput?.bottomFloor.constructionType,
              undefined,
              cfg.bottomFloor.constructionTypes,
            )}
          />
          <InfoItem
            label="Beheizt"
            value={fmt(detInput?.bottomFloor.isHeated)}
          />
          <InfoItem
            label="Gedämmt"
            value={fmt(detInput?.bottomFloor.hasInsulation)}
          />
          <InfoItem
            label="Dämmdicke"
            value={fmt(detInput?.bottomFloor.insulationThickness, "cm")}
          />
          <InfoItem
            label="Hat Keller"
            value={fmt(detInput?.bottomFloor.hasBasement)}
          />
          <InfoItem
            label="Keller beheizt"
            value={fmt(detInput?.bottomFloor.isBasementHeated)}
          />
          <InfoItem
            label="U-Wert"
            value={fmt(detInput?.bottomFloor.uValue, "W/(m²K)")}
          />
        </InfoCard>

        {/* Wärmeversorgung */}
        <InfoCard icon={GasMeter} title="Wärmeversorgung" cols={2}>
          <InfoItem
            label="Gasanschluss vorhanden"
            value={fmt(detInput?.heat.hasGasSupply)}
          />
          <InfoItem label="Biogas" value={fmt(detInput?.heat.hasBioGas)} />
          <InfoItem
            label="Speicher vorhanden"
            value={fmt(detInput?.heat.hasStorage)}
          />
        </InfoCard>

        {/* Heizung */}
        <InfoCard icon={LocalFireDepartmentIcon} title="Heizung" cols={2}>
          <InfoItem
            label="Baujahr Heizungssystem"
            value={fmt(detInput?.heat.heatingSystemConstructionYear)}
          />
          <InfoItem
            label="Primärenergieträger"
            value={fmt(
              detInput?.heat.primaryEnergyCarrier,
              undefined,
              cfg.heat.primaryEnergyCarriers,
            )}
          />
          <InfoItem
            label="Heizungstyp"
            value={fmt(
              detInput?.heat.heatingSystemType,
              undefined,
              cfg.heat.heatingSystemTypes,
            )}
          />
          <InfoItem
            label="Wärmeabgabesystem"
            value={fmt(
              detInput?.heat.heatingSurfaceType,
              undefined,
              cfg.heat.heatingSurfaceTypes,
            )}
          />
        </InfoCard>

        {/* Wärmeverbrauch */}
        <InfoCard
          icon={LightbulbOutlineRounded}
          title="Wärmeverbrauch"
          cols={2}
        >
          <InfoItem
            label="Wärmepreis"
            value={fmt(detInput?.heat.userThermalUnitRate, "€/kWh")}
          />
          <InfoItem
            label="Grundpreis Wärme"
            value={fmt(detInput?.heat.userThermalBaseRate, "€/Jahr")}
          />
          <InfoItem
            label="Jährliche Wärmekosten"
            value={fmt(detInput?.heat.userThermalTotalCost, "€")}
          />
        </InfoCard>

        {/* Strom */}
        <InfoCard icon={Power} title="Strom" cols={2}>
          <InfoItem
            label="Stromart"
            value={fmt(
              detInput?.electricity.electricityType,
              undefined,
              cfg.heat.electricityTypes,
            )}
          />
          <InfoItem
            label="Strompreis"
            value={fmt(detInput?.electricity.electricityUnitRate, "€/kWh")}
          />
          <InfoItem
            label="Grundpreis Strom"
            value={fmt(detInput?.electricity.userElectricityBaseRate, "€/Jahr")}
          />
          <InfoItem
            label="Jährlicher Stromverbrauch"
            value={fmt(detInput?.electricity.userElectricityConsumption, "kWh")}
          />
        </InfoCard>

        {/* Vorsanierungswerte */}
        {detInput?.preRenovationValues && (
          <InfoCard icon={HistoryIcon} title="Vorsanierungswerte" cols={2}>
            <InfoItem
              label="Gesamtenergiebedarf"
              value={fmt(
                detInput?.preRenovationValues.totalEnergyDemand,
                "kWh",
              )}
            />
            <InfoItem
              label="Primärenergieträger"
              value={fmt(
                detInput?.preRenovationValues.primaryEnergyCarrier,
                undefined,
                cfg.heat.primaryEnergyCarriers,
              )}
            />
            <InfoItem
              label="Heizungstyp"
              value={fmt(
                detInput?.preRenovationValues.heatingSystemType,
                undefined,
                cfg.heat.heatingSystemTypes,
              )}
            />
            <InfoItem
              label="Strom-Offset"
              value={fmt(
                detInput?.preRenovationValues.electricityOffset,
                "kWh",
              )}
            />
            <InfoItem
              label="Interne Wärmegewinne"
              value={fmt(detInput?.preRenovationValues.hadInternalGains)}
            />
          </InfoCard>
        )}

        {/* Prüfung und Freigabe / Audit-Protokoll */}
        {status === "FREIGEGEBEN" || status === "ABGELEHNT" ? (
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
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {(detail?.history ?? []).map((entry) => (
                  <Box
                    key={entry.id}
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
                        {statusConfig[toDetailStatus(entry.from)].label}
                        {" → "}
                        {statusConfig[toDetailStatus(entry.to)].label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(entry.createdAt).toLocaleString("de-DE")} von{" "}
                        {[entry.by.given_name, entry.by.family_name]
                          .filter(Boolean)
                          .join(" ") || entry.by.email}
                      </Typography>
                    </Box>
                  </Box>
                ))}
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
                  disabled={!canDecide || freigebenPending}
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
                  disabled={!canDecide || declineMutation.isPending}
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
              disabled={deleteMutation.isPending}
              sx={{ mt: 1 }}
            >
              Gebäude löschen
            </Button>
          </CardContent>
        </Card>

        <Box sx={{ mb: 2 }} />
      </Box>

      <AppFooter />
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
    const r = (n: number) => +n.toFixed(2);
    if (from != null && to != null) return `${r(from)} – ${r(to)}`;
    if (from != null) return `ab ${r(from)}`;
    if (to != null) return `bis ${r(to)}`;
    return "Nicht angegeben";
  }
  if (typeof value === "number") value = +value.toFixed(2);
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
