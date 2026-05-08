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
import { useStore } from "@nanostores/react";
import { toast } from "sonner";
import type { TempControlEntry } from "../../../hooks/store";
import {
  addHeatingSurfaceType,
  deleteHeatingSurfaceType,
  updateConfig,
  updateHeatingSurfaceType,
  updateSimpleValue,
} from "../../../hooks/store";
import type { DeleteConfirmState, EditState } from "../ConfigOverview";

export default function HeatingSurfaceTypesSection({
  configStore,
  setEditState,
  setDeleteConfirm,
  expandedSections,
  toggleSection,
}: {
  configStore: ReturnType<typeof useStore>;
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
  setDeleteConfirm: React.Dispatch<React.SetStateAction<DeleteConfirmState>>;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  const handleDeleteConfirm = (onConfirm: () => void) => {
    setDeleteConfirm({ open: true, onConfirm });
  };

  const handleAddHeatingSurfaceType = () => {
    setEditState({
      open: true,
      title: "Neue Heizflächenart hinzufügen",
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
        addHeatingSurfaceType({
          value: String(values.value),
          localization: { de: String(values.de), en: String(values.de) },
        });
        toast.success("Heizflächentyp hinzugefügt");
      },
    });
  };

  const handleEditHeatingSurfaceType = (index: number) => {
    const item = configStore.heat.heatingSurfaceTypes[index];
    if (!item) return;
    setEditState({
      open: true,
      title: "Heizflächenart bearbeiten",
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
          value: item.localization.de,
          type: "text",
          required: true,
        },
      ],
      onSave: (values) => {
        const oldKey = item.value;
        const newKey = String(values.value).trim();
        const newDe = String(values.de);
        if (newKey !== oldKey) {
          updateConfig((draft) => {
            const type = draft.heat.heatingSurfaceTypes.find(
              (t) => t.value === oldKey,
            );
            if (type) {
              type.value = newKey;
              type.localization.de = newDe;
              type.localization.en = newDe;
            }
            if (draft.heat.defaultHeatingSurfaceType === oldKey) {
              draft.heat.defaultHeatingSurfaceType = newKey;
            }
            (
              draft.heat
                .temperatureControlPerformanceFactor as TempControlEntry[]
            ).forEach((entry) => {
              entry.value.forEach((yearRow) => {
                yearRow.value.forEach((cell) => {
                  if (cell.key === oldKey) cell.key = newKey;
                });
              });
            });
          });
        } else {
          updateHeatingSurfaceType(index, (draft) => {
            draft.localization.de = newDe;
            draft.localization.en = newDe;
          });
        }
        toast.success("Heizflächenart aktualisiert");
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
          onClick={() => toggleSection("heatingSurfaceTypes")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.heatingSurfaceTypes ? (
              <ExpandMore />
            ) : (
              <ChevronRight />
            )}
            <Typography variant="h3">
              Heizflächenarten ({configStore.heat.heatingSurfaceTypes.length})
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleAddHeatingSurfaceType();
            }}
          >
            Neue Heizflächenart +
          </Button>
        </Box>

        <Collapse in={expandedSections.heatingSurfaceTypes}>
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 200px",
                gap: 1.5,
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="body1">Standard-Heizfläche</Typography>
              <TextField
                select
                size="small"
                value={configStore.heat.defaultHeatingSurfaceType}
                onChange={(e) =>
                  updateSimpleValue(
                    "heat.defaultHeatingSurfaceType",
                    e.target.value,
                  )
                }
              >
                {configStore.heat.heatingSurfaceTypes.map(
                  (t: { value: string; localization: { de: string } }) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.localization.de}
                    </MenuItem>
                  ),
                )}
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
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configStore.heat.heatingSurfaceTypes.map(
                  (
                    item: { value: string; localization: { de: string } },
                    index: number,
                  ) => (
                    <TableRow key={index} hover>
                      <TableCell sx={{ fontSize: "medium" }}>
                        {item.localization.de}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEditHeatingSurfaceType(index)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDeleteConfirm(() => {
                              deleteHeatingSurfaceType(index);
                              toast.success("Heizflächentyp gelöscht");
                            })
                          }
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </Paper>
    </>
  );
}
