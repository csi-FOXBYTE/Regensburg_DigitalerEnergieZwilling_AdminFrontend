import { ChevronRight, Delete, Edit, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "../../../components/ConfirmDeleteDialog";
import { EditDialog } from "../../../components/EditDialog";
import {
  addAllowedHeatingSystemType,
  addPrimaryEnergyCarrier,
  config,
  deleteAllowedHeatingSystemType,
  deletePrimaryEnergyCarrier,
  updateCO2Factor,
  updateConfig,
  updateDefaultHeatingSystemType,
  updatePrimaryEnergyCarrier,
  updatePrimaryEnergyCarrierData,
  updatePrimaryEnergyCarrierEfficiencyFactor,
  updateSimpleValue,
} from "../../../hooks/store";
import { type DeleteConfirmState, type EditState } from "../ConfigOverview";

export function PrimaryEnergyCarrierSection({
  configStore,
  editState,
  setEditState,
  setDeleteConfirm,
  deleteConfirm,
  expandedSections,
  toggleSection,
}: {
  configStore: ReturnType<typeof config.get>;
  editState: EditState;
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
  deleteConfirm: DeleteConfirmState;
  setDeleteConfirm: React.Dispatch<React.SetStateAction<DeleteConfirmState>>;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  const [expandedEnergyCarriers, setExpandedEnergyCarriers] = useState<
    Record<number, boolean>
  >({});

  const handleDeleteConfirm = (onConfirm: () => void) => {
    setDeleteConfirm({ open: true, onConfirm });
  };

  const handleConfirmDelete = () => {
    deleteConfirm.onConfirm();
    setDeleteConfirm({ open: false, onConfirm: () => {} });
  };

  const toggleEnergyCarrier = (index: number) => {
    setExpandedEnergyCarriers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleAddPrimaryEnergyCarrier = () => {
    setEditState({
      open: true,
      title: "Neuer Energieträger hinzufügen",
      fields: [
        {
          key: "value",
          label: "Key (technischer Bezeichner)",
          value: "",
          type: "text",
          required: true,
        },
        {
          key: "de",
          label: "Bezeichnung (Deutsch)",
          value: "",
          type: "text",
          required: true,
        },
      ],
      onSave: (values) => {
        addPrimaryEnergyCarrier({
          value: values.value as string,
          localization: { de: values.de as string, en: values.de as string },
        });
        toast.success("Energieträger hinzugefügt");
      },
    });
  };

  const handleEditPrimaryEnergyCarrier = (item: {
    value: string;
    localization: Record<string, string>;
  }) => {
    setEditState({
      open: true,
      title: "Energieträger bearbeiten",
      fields: [
        {
          key: "value",
          label: "Key (technischer Bezeichner)",
          value: item.value,
          type: "text",
          required: true,
        },
        {
          key: "de",
          label: "Bezeichnung (Deutsch)",
          value: item.localization.de ?? "",
          type: "text",
          required: true,
        },
      ],
      onSave: (values) => {
        const oldKey = item.value;
        const newKey = String(values.value).trim();
        if (newKey !== oldKey) {
          updateConfig((draft) => {
            const carrier = draft.heat.primaryEnergyCarriers.find(
              (c) => c.value === oldKey,
            );
            if (carrier) {
              carrier.value = newKey;
              carrier.localization.de = String(values.de);
              carrier.localization.en = String(values.de);
            }
            const data = draft.heat.primaryEnergyCarrierData.find(
              (d) => d.key === oldKey,
            );
            if (data) data.key = newKey;
            const allowed = draft.heat.allowedHeatingSystemTypesByCarrier.find(
              (c) => c.key === oldKey,
            );
            if (allowed) allowed.key = newKey;
            if (draft.heat.defaultPrimaryEnergyCarrier === oldKey)
              draft.heat.defaultPrimaryEnergyCarrier = newKey;
            const defaultHeat = draft.heat.defaultHeatingSystemType.find(
              (e) => e.key === oldKey,
            );
            if (defaultHeat) defaultHeat.key = newKey;
          });
        } else {
          const idx = configStore.heat.primaryEnergyCarriers.findIndex(
            (c) => c.value === oldKey,
          );
          if (idx >= 0) {
            updatePrimaryEnergyCarrier(idx, (draft) => {
              draft.localization.de = values.de as string;
            });
          }
        }
        toast.success("Energieträger aktualisiert");
      },
    });
  };

  const gridSx = {
    display: "grid",
    gridTemplateColumns: "1fr 140px 2rem 1fr 140px",
    gap: 1.5,
    alignItems: "center",
  };

  const labelOverrides: Record<string, string> = {
    heating_oil_light: "Heizöl",
    renewable_electricity: "Strom (erneuerbare Quelle)",
    electricity: "Strom (Mix)",
  };

  const displayCarriers = configStore.heat.primaryEnergyCarriers.filter(
    (c) => c.value !== "heating_oil_heavy",
  );

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
          onClick={() => toggleSection("energyCarriers")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.energyCarriers ? (
              <ExpandMore />
            ) : (
              <ChevronRight />
            )}
            <Typography variant="h3" color="#e30613">
              Primäre Energieträger (
              {configStore.heat.primaryEnergyCarriers.length})
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleAddPrimaryEnergyCarrier();
            }}
          >
            Neuer Energieträger +
          </Button>
        </Box>

        <Collapse in={expandedSections.energyCarriers}>
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Box sx={{ ...gridSx }}>
              <Typography variant="body1">Standard-Energieträger</Typography>
              <TextField
                select
                size="small"
                value={configStore.heat.defaultPrimaryEnergyCarrier}
                onChange={(e) =>
                  updateSimpleValue(
                    "heat.defaultPrimaryEnergyCarrier",
                    e.target.value,
                  )
                }
                sx={{ gridColumn: "span 2" }}
              >
                {configStore.heat.primaryEnergyCarriers.map((c) => (
                  <MenuItem key={c.value} value={c.value}>
                    {labelOverrides[c.value] ?? c.localization.de}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography sx={{ fontWeight: "bold" }}>
                      Bezeichnung
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: "bold" }}>
                      Aktionen
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {displayCarriers.map((item, index) => (
                  <Fragment key={index}>
                    <TableRow hover>
                      <TableCell sx={{ fontSize: "medium" }}>
                        <IconButton
                          size="small"
                          onClick={() => toggleEnergyCarrier(index)}
                        >
                          {expandedEnergyCarriers[index] ? (
                            <ExpandMore fontSize="small" />
                          ) : (
                            <ChevronRight fontSize="small" />
                          )}
                        </IconButton>
                        {labelOverrides[item.value] ?? item.localization.de}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEditPrimaryEnergyCarrier(item)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDeleteConfirm(() => {
                              deletePrimaryEnergyCarrier(item.value);
                              toast.success("Energieträger gelöscht");
                            })
                          }
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    <TableRow>
                      <TableCell colSpan={4} sx={{ p: 0 }}>
                        <Collapse
                          in={expandedEnergyCarriers[index]}
                          unmountOnExit
                        >
                          <Box sx={{ p: 2 }}>
                            <Typography
                              variant="body2"
                              fontWeight={"bold"}
                              mb={1}
                            >
                              Daten zum Energieträger
                            </Typography>

                            <Box sx={{ ...gridSx, mb: 1.5 }}>
                              <Typography variant="body2">
                                Primärenergiefaktor
                              </Typography>
                              <TextField
                                size="small"
                                type="number"
                                value={
                                  configStore.heat.primaryEnergyCarrierData.find(
                                    (c) => c.key === item.value,
                                  )?.value.primaryEnergyFactor ?? ""
                                }
                                onChange={(e) =>
                                  updatePrimaryEnergyCarrierEfficiencyFactor(
                                    item.value,
                                    parseFloat(e.target.value),
                                  )
                                }
                              />
                            </Box>

                            <Box sx={{ ...gridSx, mb: 2 }}>
                              <Typography variant="body2">
                                CO₂-Faktor gemäß Informationsblatt
                                <br />
                                CO₂-Faktoren der Bafa [gCO₂/kWh]
                              </Typography>
                              <TextField
                                size="small"
                                type="number"
                                value={
                                  configStore.heat.primaryEnergyCarrierData.find(
                                    (c) => c.key === item.value,
                                  )?.value.co2Factor ?? ""
                                }
                                onChange={(e) =>
                                  updateCO2Factor(
                                    item.value,
                                    parseFloat(e.target.value),
                                  )
                                }
                              />
                            </Box>

                            <Typography
                              variant="body2"
                              fontWeight={"bold"}
                              mb={1}
                            >
                              Brennstoffdaten gemäß GEG/EnEV
                            </Typography>
                            <Box sx={{ ...gridSx, mb: 2 }}>
                              <Typography variant="body2">
                                Heizwert [kWh/x]
                              </Typography>
                              <TextField
                                size="small"
                                type="number"
                                value={
                                  configStore.heat.primaryEnergyCarrierData.find(
                                    (c) => c.key === item.value,
                                  )?.value.energyPerUnit ?? ""
                                }
                                onChange={(e) =>
                                  updatePrimaryEnergyCarrierData(
                                    item.value,
                                    (draft) => {
                                      draft.energyPerUnit = parseFloat(
                                        e.target.value,
                                      );
                                    },
                                  )
                                }
                              />

                              <Box />

                              <Typography variant="body2">
                                Arbeitspreis [€/x]
                              </Typography>
                              <TextField
                                size="small"
                                type="number"
                                value={
                                  configStore.heat.primaryEnergyCarrierData.find(
                                    (c) => c.key === item.value,
                                  )?.value.unitRate ?? ""
                                }
                                onChange={(e) =>
                                  updatePrimaryEnergyCarrierData(
                                    item.value,
                                    (draft) => {
                                      draft.unitRate = parseFloat(
                                        e.target.value,
                                      );
                                    },
                                  )
                                }
                              />

                              <Typography variant="body2">
                                Grundpreis [€/a]
                              </Typography>
                              <TextField
                                size="small"
                                type="number"
                                value={
                                  configStore.heat.primaryEnergyCarrierData.find(
                                    (c) => c.key === item.value,
                                  )?.value.baseRate ?? ""
                                }
                                onChange={(e) =>
                                  updatePrimaryEnergyCarrierData(
                                    item.value,
                                    (draft) => {
                                      draft.baseRate = parseFloat(
                                        e.target.value,
                                      );
                                    },
                                  )
                                }
                              />

                              <Box />
                              <Box />
                              <Box />
                            </Box>

                            <Typography
                              variant="body2"
                              fontWeight={"bold"}
                              mb={1}
                            >
                              Erlaubte Heizsysteme
                            </Typography>
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 1fr",
                                gap: 0,
                              }}
                            >
                              {configStore.heat.heatingSystemTypes.map(
                                (sys) => {
                                  const allowedValues =
                                    configStore.heat.allowedHeatingSystemTypesByCarrier.find(
                                      (c) => c.key === item.value,
                                    )?.allowedValues ?? [];
                                  const isAllowed = allowedValues.includes(
                                    sys.value,
                                  );
                                  return (
                                    <FormControlLabel
                                      key={sys.value}
                                      control={
                                        <Checkbox
                                          size="small"
                                          checked={isAllowed}
                                          onChange={() => {
                                            const idx = allowedValues.indexOf(
                                              sys.value,
                                            );
                                            if (idx >= 0) {
                                              deleteAllowedHeatingSystemType(
                                                item.value,
                                                idx,
                                              );
                                            } else {
                                              addAllowedHeatingSystemType(
                                                item.value,
                                                sys.value,
                                              );
                                            }
                                          }}
                                        />
                                      }
                                      label={sys.localization.de}
                                      sx={{ mr: 2 }}
                                    />
                                  );
                                },
                              )}
                            </Box>

                            <Box sx={{ ...gridSx, mt: 1.5 }}>
                              <Typography variant="body2">
                                Standard-Heizsystem
                              </Typography>
                              <TextField
                                select
                                size="small"
                                value={
                                  configStore.heat.defaultHeatingSystemType.find(
                                    (e) => e.key === item.value,
                                  )?.value ?? ""
                                }
                                onChange={(e) =>
                                  updateDefaultHeatingSystemType(
                                    item.value,
                                    e.target.value,
                                  )
                                }
                                sx={{ gridColumn: "span 2" }}
                              >
                                {configStore.heat.allowedHeatingSystemTypesByCarrier
                                  .find((c) => c.key === item.value)
                                  ?.allowedValues.map((v: string) => {
                                    const sys =
                                      configStore.heat.heatingSystemTypes.find(
                                        (s) => s.value === v,
                                      );
                                    return (
                                      <MenuItem key={v} value={v}>
                                        {sys?.localization.de ?? v}
                                      </MenuItem>
                                    );
                                  })}
                              </TextField>
                            </Box>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
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
