import { ChevronRight, Delete, Edit, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
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
  type DeleteConfirmState,
  type EditState,
} from "../../features/ConfigOverview";
import {
  addEnergyEfficiencyClass,
  deleteEnergyEfficiencyClass,
  type EnergyEfficiencyEntry,
  updateEnergyEfficiencyClass,
} from "../../hooks/store";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { EditDialog } from "../EditDialog";


export function EnergyEfficiencySection({
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

  const handleEditEnergyClass = (index: number) => {
    const item = configStore.general.energyEfficiencyClasses[index];
    if (item === undefined) return;
    setEditState({
      open: true,
      title: "Energieeffizienzklasse bearbeiten",
      fields: [
        {
          key: "from",
          label: "Von (kWh/m²a)",
          value: item.from ?? "",
          type: "number",
        },
        {
          key: "to",
          label: "Bis (kWh/m²a)",
          value: item.to ?? "",
          type: "number",
        },
        {
          key: "value",
          label: "Klasse",
          value: item.value,
          type: "text",
          required: true,
        },
        {
          key: "color",
          label: "Farbe",
          value:
            (item as EnergyEfficiencyEntry).color ?? "#6b7280",
          type: "color",
          required: true,
        },
      ],
      onSave: (values) => {
        updateEnergyEfficiencyClass(index, (draft) => {
          draft.from = values.from || undefined;
          draft.to = values.to || undefined;
          draft.value = values.value;
          (draft as EnergyEfficiencyEntry).color = values.color;
        });
        toast.success("Energieeffizienzklasse aktualisiert");
      },
    });
  };

  const handleAddEnergyEfficiencyClass = () => {
    setEditState({
      open: true,
      title: "Neue Energieeffizienzklasse hinzufügen",
      fields: [
        { key: "from", label: "Von (kWh/m²a)", value: "", type: "number" },
        { key: "to", label: "Bis (kWh/m²a)", value: "", type: "number" },
        {
          key: "value",
          label: "Klasse",
          value: "",
          type: "text",
          required: true,
        },
        {
          key: "color",
          label: "Farbe",
          value: "#22c55e",
          type: "color",
          required: true,
        },
      ],
      onSave: (values) => {
        addEnergyEfficiencyClass({
          from: values.from || undefined,
          to: values.to || undefined,
          value: values.value,
          color: values.color,
        });
        toast.success("Energieeffizienzklasse hinzugefügt");
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
            bgcolor: "#F4F4F4",
            cursor: "pointer",
          }}
          onClick={() => toggleSection("energyEfficiency")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.energyEfficiency ? (
              <ExpandMore />
            ) : (
              <ChevronRight />
            )}
            <Typography variant="h6" fontWeight="600">
              Energieeffizienzklassen
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleAddEnergyEfficiencyClass();
            }}
          >
            Neue Energieeffizienzklasse +
          </Button>
        </Box>
        <Collapse in={expandedSections.energyEfficiency}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight={"bold"}>
                      Klasse
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight={"bold"}>
                      Hex-Wert Farbe
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle1" fontWeight={"bold"}>
                      Primärenergiebedarf
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle1" fontWeight={"bold"}>
                      Aktionen
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configStore.general.energyEfficiencyClasses.map(
                  (item, index) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Chip
                          label={item.value}
                          size="small"
                          sx={{
                            minWidth: 50,
                            bgcolor: (item as EnergyEfficiencyEntry).color ?? "#6b7280",
                            color: "white",
                            fontWeight: "600",
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Box
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: 0.5,
                              bgcolor: (item as EnergyEfficiencyEntry).color ?? "#6b7280",
                              border: "1px solid rgba(0,0,0,0.15)",
                            }}
                          />
                          <Typography variant="body1">
                            {(item as EnergyEfficiencyEntry).color ?? "#6b7280"}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          {item.to == null && item.from != null
                            ? ` > ${item.from} kWh/m²a`
                            : item.from == null
                              ? `< ${item.to} kWh/m²a`
                              : `${item.from} - ${item.to} kWh/m²a`}
                        </Typography>
                      </TableCell>

                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={() => handleEditEnergyClass(index)}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDeleteConfirm(() => {
                              deleteEnergyEfficiencyClass(index);
                              toast.success("Energieeffizienzklasse gelöscht");
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
