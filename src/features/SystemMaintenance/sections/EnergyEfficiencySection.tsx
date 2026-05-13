import type { EnergyEfficiencyClass } from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import { Delete, Edit } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  IconButton,
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
import { CollapsibleSection } from "../CollapsibleSection";
import {
  addEnergyEfficiencyClass,
  deleteEnergyEfficiencyClass,
  type EnergyEfficiencyEntry,
  updateEnergyEfficiencyClass,
} from "../../../hooks/store";
import { type DeleteConfirmState, type EditState } from "../ConfigOverview";

export function EnergyEfficiencySection({
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

  const handleEditEnergyClass = (index: number) => {
    const bands = configStore.general
      .energyEfficiencyClasses as EnergyEfficiencyEntry[];
    const item = bands[index];
    if (!item) return;

    setEditState({
      open: true,
      title: "Energieeffizienzklasse bearbeiten",
      fields: [
        {
          key: "from",
          label: "Von (kWh/m²a)",
          value: item.from ?? "",
          type: "number" as const,
        },
        {
          key: "to",
          label: "Bis (kWh/m²a)",
          value: item.to ?? "",
          type: "number" as const,
        },
        {
          key: "value",
          label: "Klasse",
          value: item.value,
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
      onSave: (strings, numbers) => {
        updateEnergyEfficiencyClass(index, (draft) => {
          draft.from = numbers.from;
          draft.to = numbers.to;
          if (strings.value) draft.value = strings.value as EnergyEfficiencyClass;
          if (strings.color) draft.color = strings.color;
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
      onSave: (strings, numbers) => {
        addEnergyEfficiencyClass({
          from: numbers.from,
          to: numbers.to,
          value: (strings.value ?? "") as EnergyEfficiencyClass,
          color: strings.color ?? "",
        });
      },
    });
  };

  return (
    <CollapsibleSection
      sectionKey="energyEfficiency"
      title="Energieeffizienzklassen"
      expandedSections={expandedSections}
      toggleSection={toggleSection}
      action={
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
      }
    >
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
    </CollapsibleSection>
  );
}
