import { ChevronRight, Delete, Edit, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Button,
  Collapse,
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
  addElectricityType,
  config,
  deleteElectricityType,
  updateConfig,
  updateElectricityType,
  updateElectricityTypeData,
  updateSimpleValue,
} from "../../../hooks/store";
import { type DeleteConfirmState, type EditState } from "../ConfigOverview";

const gridSx = {
  display: "grid",
  gridTemplateColumns: "1fr 140px 2rem 1fr 140px",
  gap: 1.5,
  alignItems: "center",
};

export default function ElectricityTypesSection({
  configStore,
  editState,
  setEditState,
  deleteConfirm,
  setDeleteConfirm,
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
  const [expandedTypes, setExpandedTypes] = useState<Record<number, boolean>>(
    {},
  );

  const handleDeleteConfirm = (onConfirm: () => void) =>
    setDeleteConfirm({ open: true, onConfirm });

  const handleConfirmDelete = () => {
    deleteConfirm.onConfirm();
    setDeleteConfirm({ open: false, onConfirm: () => {} });
  };

  const toggleType = (index: number) =>
    setExpandedTypes((prev) => ({ ...prev, [index]: !prev[index] }));

  const handleAddElectricityType = () => {
    setEditState({
      open: true,
      title: "Neuen Stromtyp hinzufügen",
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
        addElectricityType({
          value: String(values.value),
          localization: { de: String(values.de), en: String(values.de) },
        });
        toast.success("Stromtyp hinzugefügt");
      },
    });
  };

  const handleEditElectricityType = (
    index: number,
    item: { value: string; localization: Record<string, string> },
  ) => {
    setEditState({
      open: true,
      title: "Stromtyp bearbeiten",
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
          label: "Bezeichnung",
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
            const type = draft.heat.electricityTypes.find(
              (t) => t.value === oldKey,
            );
            if (type) {
              type.value = newKey;
              type.localization.de = String(values.de);
              type.localization.en = String(values.de);
            }
            const data = draft.heat.electricityTypeData.find(
              (d) => d.key === oldKey,
            );
            if (data) data.key = newKey;
            if (draft.heat.defaultElectricityType === oldKey) {
              draft.heat.defaultElectricityType = newKey;
            }
          });
        } else {
          updateElectricityType(index, (draft) => {
            draft.localization.de = String(values.de);
            draft.localization.en = String(values.de);
          });
        }
        toast.success("Stromtyp aktualisiert");
      },
    });
  };

  return (
    <>
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            borderBottom: "2px solid #e30613",
            cursor: "pointer",
          }}
          onClick={() => toggleSection("electricityTypes")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.electricityTypes ? (
              <ExpandMore />
            ) : (
              <ChevronRight />
            )}
            <Typography variant="h3">
              Stromtypen ({configStore.heat.electricityTypes.length})
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleAddElectricityType();
            }}
          >
            Neuer Stromtyp +
          </Button>
        </Box>

        <Collapse in={expandedSections.electricityTypes}>
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Box sx={{ ...gridSx, mb: 1 }}>
              <Typography variant="body1">Standard-Stromtyp</Typography>
              <TextField
                select
                size="small"
                value={configStore.heat.defaultElectricityType}
                onChange={(e) =>
                  updateSimpleValue(
                    "heat.defaultElectricityType",
                    e.target.value,
                  )
                }
                sx={{ gridColumn: "span 2" }}
              >
                {configStore.heat.electricityTypes.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.localization.de}
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
                {configStore.heat.electricityTypes.map((item, index) => {
                  const data = configStore.heat.electricityTypeData.find(
                    (d) => d.key === item.value,
                  )?.value;

                  return (
                    <Fragment>
                      <TableRow hover key={index}>
                        <TableCell sx={{ fontSize: "medium" }}>
                          <IconButton
                            size="small"
                            onClick={() => toggleType(index)}
                          >
                            {expandedTypes[index] ? (
                              <ExpandMore fontSize="small" />
                            ) : (
                              <ChevronRight fontSize="small" />
                            )}
                          </IconButton>
                          {item.localization.de}
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleEditElectricityType(index, item)
                            }
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDeleteConfirm(() => {
                                deleteElectricityType(item.value);
                                toast.success("Stromtyp gelöscht");
                              })
                            }
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell colSpan={2} sx={{ p: 0 }}>
                          <Collapse in={!!expandedTypes[index]} unmountOnExit>
                            <Box sx={{ p: 2 }}>
                              <Box sx={{ ...gridSx, mb: 1.5 }}>
                                <Typography variant="body2">
                                  Primärenergiefaktor
                                </Typography>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={data?.primaryEnergyFactor ?? ""}
                                  onChange={(e) =>
                                    updateElectricityTypeData(
                                      item.value,
                                      (d) => {
                                        d.primaryEnergyFactor = parseFloat(
                                          e.target.value,
                                        );
                                      },
                                    )
                                  }
                                />
                                <Box />
                                <Typography variant="body2">
                                  CO₂-Faktor [gCO₂/kWh]
                                </Typography>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={data?.co2Factor ?? ""}
                                  onChange={(e) =>
                                    updateElectricityTypeData(
                                      item.value,
                                      (d) => {
                                        d.co2Factor = parseFloat(
                                          e.target.value,
                                        );
                                      },
                                    )
                                  }
                                />

                                <Typography variant="body2">
                                  Arbeitspreis [€/kWh]
                                </Typography>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={data?.unitRate ?? ""}
                                  onChange={(e) =>
                                    updateElectricityTypeData(
                                      item.value,
                                      (d) => {
                                        d.unitRate = parseFloat(e.target.value);
                                      },
                                    )
                                  }
                                />
                                <Box />
                                <Typography variant="body2">
                                  Grundpreis [€/a]
                                </Typography>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={data?.baseRate ?? ""}
                                  onChange={(e) =>
                                    updateElectricityTypeData(
                                      item.value,
                                      (d) => {
                                        d.baseRate = parseFloat(e.target.value);
                                      },
                                    )
                                  }
                                />
                              </Box>
                            </Box>
                          </Collapse>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </Paper>

      <EditDialog
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
