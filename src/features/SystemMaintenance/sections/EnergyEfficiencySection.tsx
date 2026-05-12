import type { EnergyEfficiencyClass } from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
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
import { ConfirmDeleteDialog } from "../../../components/ConfirmDeleteDialog";
import { EditDialog } from "../../../components/EditDialog";
import {
  addEnergyEfficiencyClass,
  deleteEnergyEfficiencyClass,
  type EnergyEfficiencyEntry,
  updateEnergyEfficiencyClass,
} from "../../../hooks/store";
import { type DeleteConfirmState, type EditState } from "../ConfigOverview";

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
    const bands = configStore.general
      .energyEfficiencyClasses as EnergyEfficiencyEntry[];
    const item = bands[index];
    if (!item) return;
    const isFirst = index === 0 && bands.length > 1;
    const isLast = index === bands.length - 1 && bands.length > 1;

    setEditState({
      open: true,
      title: "Energieeffizienzklasse bearbeiten",
      fields: [
        ...(!isFirst
          ? [
              {
                key: "from",
                label: "Von (kWh/m²a)",
                value: item.from ?? "",
                type: "number" as const,
              },
            ]
          : []),
        ...(!isLast
          ? [
              {
                key: "to",
                label: "Bis (kWh/m²a)",
                value: item.to ?? "",
                type: "number" as const,
              },
            ]
          : []),
        {
          key: "value",
          label: "Klasse",
          value: item.value ?? "",
          type: "text" as const,
          required: true,
        },
        {
          key: "color",
          label: "Farbe",
          value: item.color ?? "#6b7280",
          type: "color" as const,
          required: true,
        },
      ],
      onSave: (values) => {
        updateEnergyEfficiencyClass(index, (draft) => {
          if (values.from === "") {
            delete draft.from;
          } else if (values.from !== undefined) {
            draft.from = values.from as number;
          }
          if (values.to === "") {
            delete draft.to;
          } else if (values.to !== undefined) {
            draft.to = values.to as number;
          }
          if (values.value) draft.value = values.value as EnergyEfficiencyClass;
          if (values.color) draft.color = values.color as string;
        });
      },
    });
  };

  const handleAddEnergyEfficiencyClass = () => {
    const bands = configStore.general
      .energyEfficiencyClasses as EnergyEfficiencyEntry[];
    const isEmpty = bands.length === 0;

    setEditState({
      open: true,
      title: "Neue Energieeffizienzklasse hinzufügen",
      fields: [
        ...(!isEmpty
          ? [
              {
                key: "from",
                label: "Von (kWh/m²a) — leer = neuer Anfang",
                value: "",
                type: "number" as const,
              },
            ]
          : []),
        ...(!isEmpty
          ? [
              {
                key: "to",
                label: "Bis (kWh/m²a) — leer = neues Ende",
                value: "",
                type: "number" as const,
              },
            ]
          : []),
        {
          key: "value",
          label: "Klasse",
          value: "",
          type: "text" as const,
          required: true,
        },
        {
          key: "color",
          label: "Farbe",
          value: "#22c55e",
          type: "color" as const,
          required: true,
        },
      ],
      onSave: (values) => {
        const from = values.from !== "" ? (values.from as number) : undefined;
        const to = values.to !== "" ? (values.to as number) : undefined;

        addEnergyEfficiencyClass({
          from,
          to,
          value: values.value as EnergyEfficiencyClass,
          color: values.color as string,
        });
      },
    });
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
          onClick={() => toggleSection("energyEfficiency")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.energyEfficiency ? (
              <ExpandMore />
            ) : (
              <ChevronRight />
            )}
            <Typography variant="h3" color="#e30613">
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
                    <Typography fontWeight={"bold"}>Klasse</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={"bold"}>Hex-Wert Farbe</Typography>
                  </TableCell>
                  <TableCell>
                    <Typography fontWeight={"bold"}>
                      Primärenergiebedarf
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={"bold"}>Aktionen</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configStore.general.energyEfficiencyClasses.map(
                  (item: EnergyEfficiencyEntry, index: number) => (
                    <TableRow key={index} hover>
                      <TableCell>
                        <Chip
                          label={item.value}
                          size="small"
                          sx={{
                            minWidth: 50,
                            bgcolor: item.color ?? "#6b7280",
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
                              bgcolor: item.color ?? "#6b7280",
                              border: "1px solid rgba(0,0,0,0.15)",
                            }}
                          />
                          <Typography variant="body1">
                            {item.color ?? "#6b7280"}
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
