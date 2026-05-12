import {
  Add,
  ChevronRight,
  Delete,
  Edit,
  ExpandMore,
} from "@mui/icons-material";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { useStore } from "@nanostores/react";
import { Fragment } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "../../../components/ConfirmDeleteDialog";
import { EditDialog } from "../../../components/EditDialog";
import {
  addCorrectionFactor,
  deleteCorrectionFactor,
  updateCorrectionFactor,
  updateInternalGainsFactorByBuildingType,
  updateNetFloorAreaFromUsableFloorAreaFactor,
  updateSimpleValue,
} from "../../../hooks/store";
import { type DeleteConfirmState, type EditState } from "../ConfigOverview";

function lookUpForNames(key: string): string {
  const BUILDING_TYPE_NAMES: Record<string, string> = {
    singleFamily: "Einfamilienhaus",
    multiFamily: "Mehrfamilienhaus",
  };
  return BUILDING_TYPE_NAMES[key] ?? key;
}

export function GeneralParametersSection({
  configStore,
  editState,
  setEditState,
  deleteConfirm,
  setDeleteConfirm,
  expandedSections,
  toggleSection,
}: {
  configStore: ReturnType<typeof useStore>;
  editState: EditState;
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
  deleteConfirm: DeleteConfirmState;
  setDeleteConfirm: React.Dispatch<React.SetStateAction<DeleteConfirmState>>;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  const handleDeleteConfirm = (onConfirm: () => void) => {
    setDeleteConfirm({ open: true, onConfirm });
  };

  const handleConfirmDelete = () => {
    deleteConfirm.onConfirm();
    setDeleteConfirm({ open: false, onConfirm: () => {} });
  };

  const handleEditCorrectionFactor = (index: number) => {
    const item = configStore.general.heatedAirVolumeCorrectionFactor[index];
    setEditState({
      open: true,
      title: "Korrekturfaktor bearbeiten",
      fields: [
        { key: "from", label: "Von", value: item.from, type: "number" },
        { key: "to", label: "Bis", value: item.to, type: "number" },
        { key: "value", label: "Faktor", value: item.value, type: "number" },
      ],
      onSave: (values) => {
        updateCorrectionFactor(index, (draft) => {
          draft.from = values.from as number;
          draft.to = values.to as number;
          draft.value = values.value as number;
        });
        toast.success("Korrekturfaktor aktualisiert");
      },
    });
  };

  const handleAddCorrectionFactor = () => {
    setEditState({
      open: true,
      title: "Neuer Korrekturfaktor hinzufügen für beheiztes Luftvolumen",
      fields: [
        { key: "from", label: "Von", value: "", type: "number" },
        { key: "to", label: "Bis", value: "", type: "number" },
        { key: "value", label: "Faktor", value: "", type: "number" },
      ],
      onSave: (values) => {
        addCorrectionFactor({
          from: values.from as number,
          to: values.to as number,
          value: values.value as number,
        });
        toast.success("Korrekturfaktor hinzugefügt");
      },
    });
  };

  const gridSx = {
    display: "grid",
    gridTemplateColumns: "1fr 140px 2rem 1fr 140px",
    gap: 1.5,
    alignItems: "center",
  };

  return (
    <>
      <Paper sx={{ mb: 3, overflow: "hidden", boxShadow: "none" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            color: "#e30613",
            borderBottom: "2px solid black",
            cursor: "pointer",
          }}
          onClick={() => toggleSection("generalParams")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.generalParams ? <ExpandMore /> : <ChevronRight />}
            <Typography variant="h3" color="#e30613">
              Allgemeine Parameter
            </Typography>
          </Box>
        </Box>

        <Collapse in={expandedSections.generalParams}>
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" fontWeight={"bold"} mb={1}>
              Geometrische Annahmen
            </Typography>
            <Box sx={{ ...gridSx, mb: 3 }}>
              <Typography>Geschossdeckenstärke [m]</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.general.assumedFloorSlabThickness}
                onChange={(e) =>
                  updateSimpleValue(
                    "general.assumedFloorSlabThickness",
                    parseFloat(e.target.value),
                  )
                }
              />
              <Box />
              <Typography>Geschosshöhe Innenraum [m]</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.general.assumedInteriorStoryHeight}
                onChange={(e) =>
                  updateSimpleValue(
                    "general.assumedInteriorStoryHeight",
                    parseFloat(e.target.value),
                  )
                }
              />

              <Typography>
                Faktor Nutzfläche über beheiztes Gebäudevolumen
              </Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.general.usableFloorAreaFactor}
                onChange={(e) =>
                  updateSimpleValue(
                    "general.usableFloorAreaFactor",
                    parseFloat(e.target.value),
                  )
                }
              />
              <Box />
              <Typography>Faktor Nettogrundfläche über Wohnfläche</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.general.netFloorAreaFromLivingAreaFactor}
                onChange={(e) =>
                  updateSimpleValue(
                    "general.netFloorAreaFromLivingAreaFactor",
                    parseFloat(e.target.value),
                  )
                }
              />

              <Typography>
                Faktor Lüftungswärmeverlust (Gesamtluftwechsel ohne mechanische
                Lüftung)
              </Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.heat.ventilationHeatLossCorrectionFactor}
                onChange={(e) =>
                  updateSimpleValue(
                    "heat.ventilationHeatLossCorrectionFactor",
                    parseFloat(e.target.value),
                  )
                }
              />
              <Box />
              <Typography>Heizgradtage [Kd]</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.heat.heatingDegreeDays}
                onChange={(e) =>
                  updateSimpleValue(
                    "heat.heatingDegreeDays",
                    parseFloat(e.target.value),
                  )
                }
              />

              <Typography>Brauchwasserbedarf je Fläche [kWh/m²]</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.heat.hotWaterEnergyDemandFromAreaFactor}
                onChange={(e) =>
                  updateSimpleValue(
                    "heat.hotWaterEnergyDemandFromAreaFactor",
                    parseFloat(e.target.value),
                  )
                }
              />
              <Box />
              <Box />
              <Box />
            </Box>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight={"bold"} mb={1}>
                Faktor Nettogrundfläche über Nutzfläche
              </Typography>
              <Box sx={gridSx}>
                {configStore.general.netFloorAreaFromUsableFloorAreaFactor.map(
                  (entry: {
                    key: string;
                    value: { key: boolean; value: number }[];
                  }) => {
                    const ohneKeller = entry.value.find((v) => v.key === false);
                    const mitKeller = entry.value.find((v) => v.key === true);
                    return (
                      <Fragment key={entry.key}>
                        <Typography>
                          {lookUpForNames(entry.key)} ohne Keller
                        </Typography>
                        <TextField
                          size="small"
                          type="number"
                          value={ohneKeller?.value ?? ""}
                          onChange={(e) =>
                            updateNetFloorAreaFromUsableFloorAreaFactor(
                              entry.key,
                              false,
                              parseFloat(e.target.value),
                            )
                          }
                        />
                        <Box />
                        <Typography>
                          {lookUpForNames(entry.key)} mit Keller
                        </Typography>
                        <TextField
                          size="small"
                          type="number"
                          value={mitKeller?.value ?? ""}
                          onChange={(e) =>
                            updateNetFloorAreaFromUsableFloorAreaFactor(
                              entry.key,
                              true,
                              parseFloat(e.target.value),
                            )
                          }
                        />
                      </Fragment>
                    );
                  },
                )}
              </Box>
            </Box>

            <Box sx={{ mb: 2 }}>
              <Typography variant="body1" fontWeight={"bold"} mb={1}>
                Faktor interne Wärmegewinne je Gebäudetyp
              </Typography>
              <Box sx={gridSx}>
                {configStore.heat.internalGainsFactorByBuildingType.map(
                  (entry: { key: string; value: number }) => (
                    <Fragment key={entry.key}>
                      <Typography>{lookUpForNames(entry.key)}</Typography>
                      <TextField
                        size="small"
                        type="number"
                        value={entry.value}
                        onChange={(e) =>
                          updateInternalGainsFactorByBuildingType(
                            entry.key,
                            parseFloat(e.target.value),
                          )
                        }
                      />
                      <Box />
                      <Box />
                      <Box />
                    </Fragment>
                  ),
                )}
              </Box>
            </Box>

            <Box sx={{ width: "50%" }}>
              <Typography variant="body1" fontWeight={"bold"} mb={1}>
                Faktor beheiztes Luftvolumen
              </Typography>
              {configStore.general.heatedAirVolumeCorrectionFactor.map(
                (
                  item: { from?: number; to?: number; value: number },
                  index: number,
                ) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                      mb: 0.25,
                    }}
                  >
                    <Typography sx={{ flex: 1 }}>
                      {item.from &&
                        item.to &&
                        `ab ${item.from} bis ${item.to} Geschosse`}
                      {item.from && !item.to && `ab ${item.from} Geschosse`}
                      {!item.from && item.to && `bis ${item.to} Geschosse`}
                    </Typography>
                    <TextField
                      size="small"
                      type="number"
                      value={item.value}
                      onChange={(e) =>
                        updateCorrectionFactor(index, (draft) => {
                          draft.value = parseFloat(e.target.value);
                        })
                      }
                      sx={{ width: 100 }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleEditCorrectionFactor(index)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleDeleteConfirm(() => {
                          deleteCorrectionFactor(index);
                          toast.success("Korrekturfaktor gelöscht");
                        })
                      }
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </Box>
                ),
              )}
              <IconButton
                size="small"
                onClick={handleAddCorrectionFactor}
                sx={{ color: "error.main", mt: 0.25 }}
              >
                <Add fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Collapse>
      </Paper>

      <EditDialog
        key={String(editState.open)}
        open={editState.open}
        title={editState.title}
        fields={editState.fields}
        onClose={() => setEditState((s) => ({ ...s, open: false }))}
        onSave={editState.onSave}
      />
      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, onConfirm: () => {} })}
      />
    </>
  );
}
