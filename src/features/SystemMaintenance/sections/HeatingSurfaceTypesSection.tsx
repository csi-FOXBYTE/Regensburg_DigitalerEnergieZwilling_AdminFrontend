import type { DeleteConfirmState, EditState } from "@/features/ConfigOverview";
import { ChevronRight, Delete, Edit, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Button,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useStore } from "@nanostores/react";
import { toast } from "sonner";
import {
  addHeatingSurfaceType,
  deleteHeatingSurfaceType,
  updateHeatingSurfaceType,
} from "../../../hooks/store";

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
          key: "de",
          label: "Bezeichnung (Deutsch)",
          value: "",
          type: "text",
          required: true,
        },
      ],
      onSave: (values) => {
        const key = values.de.toLowerCase().replace(/\s+/g, "_");
        addHeatingSurfaceType({
          value: key,
          localization: { de: values.de, en: values.de },
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
          label: "Wert",
          value: item.localization.de,
          type: "text",
        },
      ],
      onSave: (values) => {
        updateHeatingSurfaceType(index, (draft) => {
          draft.value = values.value;
          draft.localization.de = values.value;
          draft.localization.en = values.value;
        });
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
            alignItems: "center",
            bgcolor: "grey.100",
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
            <Typography variant="h6" fontWeight="600">
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
                {configStore.heat.heatingSurfaceTypes.map((item, index) => (
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
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </Paper>
    </>
  );
}
