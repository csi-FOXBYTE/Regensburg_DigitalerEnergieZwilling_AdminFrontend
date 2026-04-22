import { HeatFlowDirection } from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import { ChevronRight, Delete, Edit, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Container,
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
import { Fragment, useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { EditDialog } from "../components/EditDialog";
import {
  addCorrectionFactor,
  addEnergyEfficiencyClass,
  addHeatingSurfaceType,
  addHeatingSystemType,
  addPrimaryEnergyCarrier,
  addYearBand,
  config,
  deleteEnergyEfficiencyClass,
  deleteHeatingSurfaceType,
  deletePrimaryEnergyCarrier,
  deleteYearBand,
  updateallowedHeatingSystemType,
  updateBottomFloorUValue,
  updateCO2Factor,
  updateCorrectionFactor,
  updateEnergyEfficiencyClass,
  updateHeatingSurfaceType,
  updateHeatingSystemType,
  updateOuterWallUValue,
  updatePrimaryEnergyCarrier,
  updatePrimaryEnergyCarrierData,
  updatePrimaryEnergyCarrierEfficiencyFactor,
  updateRoofUValue,
  updateSimpleValue,
  updateWindowsUValue,
  updateYearBand,
} from "../hooks/store";

interface EditState {
  open: boolean;
  title: string;
  fields: Array<{
    key: string;
    label: string;
    value: any;
    type?: "text" | "number";
    required?: boolean;
  }>;
  onSave: (values: Record<string, any>) => void;
}

interface DeleteConfirmState {
  open: boolean;
  onConfirm: () => void;
}

export function ConfigOverview() {
  const configStore = useStore(config);

  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({});
  const [editState, setEditState] = useState<EditState>({
    open: false,
    title: "",
    fields: [],
    onSave: () => {},
  });

  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
    onConfirm: () => {},
  });

  const getChipColor = (energyClass: string): string => {
    const colorMap: Record<string, string> = {
      "A++": "#22c55e",
      "A+": "#22c55e",
      A: "#84cc16",
      B: "#eab308",
      C: "#f97316",
      D: "#ef4444",
      E: "#dc2626",
      F: "#991b1b",
      G: "#7f1d1d",
    };
    return colorMap[energyClass] || "#6b7280";
  };

  const handleDeleteConfirm = (onConfirm: () => void) => {
    setDeleteConfirm({
      open: true,
      onConfirm,
    });
  };

  const handleConfirmDelete = () => {
    deleteConfirm.onConfirm();
    setDeleteConfirm({ open: false, onConfirm: () => {} });
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const [expandedEnergyCarriers, setExpandedEnergyCarriers] = useState<
    Record<number, boolean>
  >({});

  const toggleEnergyCarrierRow = (index: number) => {
    setExpandedEnergyCarriers((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleSaveAll = () => {
    toast.success("Konfiguration gespeichert");
  };

  const handleEditEnergyClass = (index: number) => {
    const item = configStore.general.energyEfficiencyClasses[index];
    if (item === undefined) return;
    setEditState({
      open: true,
      title: "Energieeffizienzklasse bearbeiten",
      fields: [
        { key: "from", label: "Von", value: item.from ?? "", type: "number" },
        { key: "to", label: "Bis", value: item.to ?? "", type: "number" },
        {
          key: "value",
          label: "Klasse",
          value: item.value,
          type: "text",
          required: true,
        },
      ],
      onSave: (values) => {
        updateEnergyEfficiencyClass(index, (draft) => {
          draft.from = values.from || undefined;
          draft.to = values.to || undefined;
          draft.value = values.value;
        });
        toast.success("Energieeffizienzklasse aktualisiert");
      },
    });
  };

  const handleEditYearBand = (index: number) => {
    setEditState({
      open: true,
      title: "Jahresband bearbeiten",
      fields: [
        { key: "from", label: "Von Jahr", value: "", type: "number" },
        { key: "to", label: "Bis Jahr", value: "", type: "number" },
      ],
      onSave: (values) => {
        updateYearBand(index, (draft) => {
          draft.from = values.from;
          draft.to = values.to;
        });
        toast.success("Jahresband aktualisiert");
      },
    });
  };

  const handleEditEnergyCarrier = (index: number) => {
    const item = configStore.heat.primaryEnergyCarriers[index];
    if (!item) return;
    setEditState({
      open: true,
      title: "Energieträger bearbeiten",
      fields: [
        { key: "value", label: "Wert (Key)", value: item.value, type: "text" },
        {
          key: "de",
          label: "Deutsch",
          value: item.localization.de,
          type: "text",
        },
        {
          key: "en",
          label: "Englisch",
          value: item.localization.en,
          type: "text",
        },
      ],
      onSave: (values) => {
        updatePrimaryEnergyCarrier(index, (draft) => {
          draft.value = values.value;
          draft.localization.de = values.de;
          draft.localization.en = values.en;
        });
        toast.success("Energieträger aktualisiert");
      },
    });
  };

  const handleEditHeatingSystemType = (index: number) => {
    const item = configStore.heat.heatingSystemTypes[index];
    if (!item) return;
    setEditState({
      open: true,
      title: "Heizungstyp bearbeiten",
      fields: [
        { key: "value", label: "Wert (Key)", value: item.value, type: "text" },
        {
          key: "de",
          label: "Deutsch",
          value: item.localization.de,
          type: "text",
        },
        {
          key: "en",
          label: "Englisch",
          value: item.localization.en,
          type: "text",
        },
      ],
      onSave: (values) => {
        updateHeatingSystemType(index, (draft) => {
          draft.value = values.value;
          draft.localization.de = values.de;
          draft.localization.en = values.en;
        });
        toast.success("Heizungstyp aktualisiert");
      },
    });
  };

  const handleEditHeatingSurfaceType = (index: number) => {
    const item = configStore.heat.heatingSurfaceTypes[index];
    if (!item) return;
    setEditState({
      open: true,
      title: "Heizflächentyp bearbeiten",
      fields: [
        { key: "value", label: "Wert (Key)", value: item.value, type: "text" },
        {
          key: "de",
          label: "Deutsch",
          value: item.localization.de,
          type: "text",
        },
        {
          key: "en",
          label: "Englisch",
          value: item.localization.en,
          type: "text",
        },
      ],
      onSave: (values) => {
        updateHeatingSurfaceType(index, (draft) => {
          draft.value = values.value;
          draft.localization.de = values.de;
          draft.localization.en = values.en;
        });
        toast.success("Heizflächentyp aktualisiert");
      },
    });
  };

  const handleEditHeatingSystemTypesByCarrier = (
    key: string,
    index: number,
  ) => {
    const item = configStore.heat.allowedHeatingSystemTypesByCarrier.find(
      (val) => val.key === key,
    );

    setEditState({
      open: true,
      title: "Erlaubtes Heizsystem bearbeiten",
      fields: [
        {
          key: "heatingSystemType",
          label: "Heizsystemtyp",
          value: item?.allowedValues[index] ?? "",
          type: "text",
        },
      ],
      onSave: (values) => {
        updateallowedHeatingSystemType(key, index, values.heatingSystemType);

        toast.success("Erlaubtes Heizsystem aktualisiert");
      },
    });
  };

  const handleEditCorrectionFactor = (index: number) => {
    const item = configStore.general.heatedAirVolumeCorrectionFactor[index];
    setEditState({
      open: true,
      title: "Korrekturfaktor bearbeiten",
      fields: [
        { key: "from", label: "Von (m³)", value: item.from, type: "number" },
        { key: "to", label: "Bis (m³)", value: item.to, type: "number" },
        { key: "value", label: "Faktor", value: item.value, type: "number" },
      ],
      onSave: (values) => {
        updateCorrectionFactor(index, (draft) => {
          draft.from = values.from;
          draft.to = values.to;
          draft.value = values.value;
        });
        toast.success("Korrekturfaktor aktualisiert");
      },
    });
  };

  const handleEditSimpleValue = (path: string, label: string, value: any) => {
    setEditState({
      open: true,
      title: label,
      fields: [{ key: "value", label, value, type: "number" }],
      onSave: (values) => {
        updateSimpleValue(path, values.value);
        toast.success(`${label} aktualisiert`);
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
          type: "select",
          required: true,
          options: [
            { label: "Grün (#22c55e)", value: "#22c55e" },
            { label: "Leuchtend Grün (#84cc16)", value: "#84cc16" },
            { label: "Gelb (#eab308)", value: "#eab308" },
            { label: "Orange (#f97316)", value: "#f97316" },
            { label: "Rot (#ef4444)", value: "#ef4444" },
            { label: "Dunkelrot (#dc2626)", value: "#dc2626" },
            { label: "Sehr Dunkelrot (#991b1b)", value: "#991b1b" },
            { label: "Schwarz (#7f1d1d)", value: "#7f1d1d" },
          ],
        },
      ],
      onSave: (values) => {
        addEnergyEfficiencyClass({
          from: values.from || undefined,
          to: values.to || undefined,
          value: values.value,
        });
        // TODO: Store color separately wenn needed
        toast.success("Energieeffizienzklasse hinzugefügt");
      },
    });
  };

  const handleAddYearBand = () => {
    setEditState({
      open: true,
      title: "Neuer Jahresband hinzufügen",
      fields: [
        { key: "from", label: "Von Jahr", value: "", type: "number" },
        { key: "to", label: "Bis Jahr", value: "", type: "number" },
      ],
      onSave: (values) => {
        addYearBand({
          from: values.from || undefined,
          to: values.to || undefined,
        });
        toast.success("Jahresband hinzugefügt");
      },
    });
  };

  const handleAddPrimaryEnergyCarrier = () => {
    setEditState({
      open: true,
      title: "Neuer Energieträger hinzufügen",
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
        addPrimaryEnergyCarrier({
          value: key,
          localization: { de: values.de, en: values.de },
        });
        toast.success("Energieträger hinzugefügt");
      },
    });
  };

  const handleAddHeatingSystemType = () => {
    setEditState({
      open: true,
      title: "Neuer Heizungstyp hinzufügen",
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
        addHeatingSystemType({
          value: key,
          localization: { de: values.de, en: values.de },
        });
        toast.success("Heizungstyp hinzugefügt");
      },
    });
  };

  const handleAddHeatingSurfaceType = () => {
    setEditState({
      open: true,
      title: "Neuer Heizflächentyp hinzufügen",
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

  const handleAddCorrectionFactor = () => {
    setEditState({
      open: true,
      title: "Neuer Korrekturfaktor hinzufügen",
      fields: [
        { key: "from", label: "Von (m³)", value: "", type: "number" },
        { key: "to", label: "Bis (m³)", value: "", type: "number" },
        { key: "value", label: "Faktor", value: "", type: "number" },
      ],
      onSave: (values) => {
        addCorrectionFactor({
          from: values.from || undefined,
          to: values.to || undefined,
          value: values.value,
        });
        toast.success("Korrekturfaktor hinzugefügt");
      },
    });
  };

  const handleAddAllowedHeatingSystem = (carrierKey: string) => {
    setEditState({
      open: true,
      title: `Erlaubtes Heizsystem hinzufügen`,
      fields: [
        {
          key: "heatingSystemType",
          label: "Heizsystemtyp",
          value: "",
          type: "select",
          required: true,
          options: configStore.heat.heatingSystemTypes.map((sys) => ({
            label: sys.localization.de,
            value: sys.value,
          })),
        },
      ],
      onSave: (values) => {
        // Note: This would require a proper update function in the store
        toast.success("Heizsystem hinzugefügt");
      },
    });
  };

  const lookUpHeatFlowEnum = (key: HeatFlowDirection) => {
    const lookUpTable: Record<HeatFlowDirection, string> = {
      [HeatFlowDirection.UPWARD]: "Aufwärts",
      [HeatFlowDirection.DOWNWARD]: "Abwärts",
      [HeatFlowDirection.HORIZONTAL]: "Horinzontal",
    };
    return lookUpTable[key];
  };

  const lookUpForNames = (key: string) => {
    const lookUpTable: Record<string, string> = {
      ["singleFamily"]: "Einfamilienhaus",
      ["multiFamily"]: "Mehrfamilienhaus",
      ["solid_construction"]: "Massive Konstruktion",
      ["wood_construction"]: "Holzkonstruktion",
      ["solid_ceiling"]: "Massive Decke",
      ["wood_beam_ceiling"]: "Holzbalkendecke",
      ["brick_wall"]: "Vollziegelwand",
      ["other_wall"]: "Sonstige Wand",
      ["solid_wall_with_thermal_insulation_composite_system"]:
        "Massivwand mit Wärmedämmverbundsystem",
      ["reinforced_concrete_on_ground"]: "Massiver Stahlbeton gegen Boden",
      ["reinforced_concrete_ceiling"]: "Massiver Stahlbeton Kellerdecke",
      ["timber_joist_ceiling"]: "Holzbalkendecke",
      ["wooden_window_single_glazing"]: "Holzfenster, einfach verglast",
      ["wooden_window_double_glazing"]: "Holzfenster, zweifach verglast",
      ["plastic_window_insulated_glazing"]:
        "Kunststofffenster, Isolierverglasung",
      ["aluminum_or_steel_window_insulated_glazing"]:
        "Aluminium- oder Stahlfenster, Isolierverglasung",
    };
    return lookUpTable[key];
  };

  const configFiles = [
    {
      value: "config1.json",
    },
    {
      value: "currentconfig.json",
    },
    {
      value: "default.json",
    },
  ];

  const [selectedConfigFile, setselectedConfigFile] = useState<string>(
    configFiles[2]!.value,
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              DET Konfigurationsverwaltung
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verwalten Sie die DET-Konfigurationsparameter
            </Typography>
          </Box>
          <TextField
            select
            label="Konfigurationsdatei"
            size="small"
            value={selectedConfigFile}
            onChange={(e) => setselectedConfigFile(e.target.value)}
            sx={{ width: 250 }}
          >
            {configFiles.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.value}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      </Box>
      {/* Energieeffizienzklassen */}
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="h6" fontWeight="600">
            Energieeffizienzklassen
          </Typography>
          <Button
            onClick={handleAddEnergyEfficiencyClass}
            sx={{
              bgcolor: "#C1272D",
              color: "white",
              "&:hover": { bgcolor: "#9B1F24" },
            }}
          >
            Neue Energieeffizienzklasse
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Von</TableCell>
                <TableCell>Bis</TableCell>
                <TableCell>Klasse</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configStore.general.energyEfficiencyClasses.map(
                (item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>
                      {item.from != null ? `${item.from} kWh/m²a` : "-"}
                    </TableCell>
                    <TableCell>
                      {item.to != null ? `${item.to} kWh/m²a` : "-"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={item.value}
                        size="small"
                        sx={{
                          minWidth: 50,
                          bgcolor: getChipColor(item.value),
                          color: "white",
                          fontWeight: "600",
                        }}
                      />
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
      </Paper>
      {/* Jahresbänder */}
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="h6" fontWeight="600">
            Jahresbänder
          </Typography>
          <Button
            onClick={handleAddYearBand}
            sx={{
              bgcolor: "#C1272D",
              color: "white",
              "&:hover": { bgcolor: "#9B1F24" },
            }}
          >
            Neuer Jahresband
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Von Jahr</TableCell>
                <TableCell>Bis Jahr</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {configStore.general.generalYearBands.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell>{item.from ?? "-"}</TableCell>
                  <TableCell>{item.to ?? "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleEditYearBand(index)}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleDeleteConfirm(() => {
                          deleteYearBand(index);
                          toast.success("Jahresband gelöscht");
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
      </Paper>

      {/* Allgemeine Parameter */}
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            alignItems: "center",
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="h6" fontWeight="600">
            Allgemeine Parameter
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" fontWeight="600" mb={1}>
            Geometrische Annahmen
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 140px",
              gap: 1.5,
              mb: 3,
            }}
          >
            <Typography>Geschossdeckenstärke (m)</Typography>
            <TextField
              size="small"
              type="number"
              value={configStore.general.assumedFloorSlabThickness}
            />

            <Typography>Geschosshöhe Innenraum (m)</Typography>
            <TextField
              size="small"
              type="number"
              value={configStore.general.assumedInteriorStoryHeight}
            />

            <Typography>Nutzflächenfaktor</Typography>
            <TextField
              size="small"
              type="number"
              value={configStore.general.usableFloorAreaFactor}
            />

            <Typography>Nettogrundfläche aus Wohnfläche</Typography>
            <TextField
              size="small"
              type="number"
              value={configStore.general.netFloorAreaFromLivingAreaFactor}
            />
          </Box>
          <Typography variant="subtitle2" fontWeight="600" mb={1}>
            Luftvolumen‑Korrekturfaktoren
          </Typography>

          <TableContainer sx={{ mb: 3 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Von (m)</TableCell>
                  <TableCell>Bis (m)</TableCell>
                  <TableCell>Faktor</TableCell>
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {configStore.general.heatedAirVolumeCorrectionFactor.map(
                  (item, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{item.from ?? "-"}</TableCell>
                      <TableCell>{item.to ?? "-"}</TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={item.value}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small">
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="subtitle2" fontWeight="600" mb={1}>
            Nettogrundfläche aus Nutzfläche
          </Typography>

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Gebäudetyp</TableCell>
                <TableCell align="center">Ohne Keller</TableCell>
                <TableCell align="center">Mit Keller</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {configStore.general.netFloorAreaFromUsableFloorAreaFactor.map(
                (entry) => (
                  <TableRow key={entry.key}>
                    <TableCell>{lookUpForNames(entry.key)}</TableCell>

                    {entry.value.map((v) => (
                      <TableCell key={String(v.key)} align="center">
                        <TextField
                          size="small"
                          type="number"
                          value={v.value}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ),
              )}
            </TableBody>
          </Table>
        </Box>
      </Paper>

      {/* Primäre Energieträger - Aufklappbar */}
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
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
            <Typography variant="h6" fontWeight="600">
              Primäre Energieträger (
              {configStore.heat.primaryEnergyCarriers.length})
            </Typography>
          </Box>
          <Button
            onClick={handleAddPrimaryEnergyCarrier}
            sx={{
              bgcolor: "#C1272D",
              color: "white",
              "&:hover": { bgcolor: "#9B1F24" },
            }}
          >
            Energieträger hinzufügen
          </Button>
        </Box>
        <Collapse in={expandedSections.energyCarriers}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Bezeichnung</TableCell>
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {configStore.heat.primaryEnergyCarriers.map((item, index) => (
                  <Fragment key={index}>
                    {/* Haupt-Zeile */}
                    <TableRow hover>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleEnergyCarrierRow(index)}
                        >
                          {expandedEnergyCarriers[index] ? (
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
                            handleDeleteConfirm(() => {
                              deletePrimaryEnergyCarrier(index);
                              toast.success("Energieträger gelöscht");
                            })
                          }
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>

                    {/* 🔽 INNERES COLLAPSE */}
                    <TableRow>
                      <TableCell colSpan={4} sx={{ p: 0 }}>
                        <Collapse
                          in={expandedEnergyCarriers[index]}
                          unmountOnExit
                        >
                          <Box sx={{ p: 2, bgcolor: "grey.100" }}>
                            <Typography sx={{ pb: 2 }}>
                              <strong>Daten zum Energieträger</strong>
                            </Typography>
                            <TableRow>
                              {/* Primärenergieeffizienzfaktoren für die jeweiligen Energieträger */}
                              <TableCell>
                                <Typography>Primärenergiefaktor pb:</Typography>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={
                                    configStore.heat.primaryEnergyCarrierEfficiencyFactor.find(
                                      (carrier) => carrier.key === item.value,
                                    )?.value ?? ""
                                  }
                                  onChange={(e) =>
                                    updatePrimaryEnergyCarrierEfficiencyFactor(
                                      item.value,
                                      parseFloat(e.target.value),
                                    )
                                  }
                                />
                              </TableCell>
                              {/* CO2 Faktoren für die jeweiligen Energieträger */}
                              <TableCell>
                                <Typography>
                                  CO<sub>2</sub> Faktor in gCO<sub>2</sub>
                                  /kWh:{" "}
                                </Typography>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={
                                    configStore.heat.co2Factor.find(
                                      (carrier) => carrier.key === item.value,
                                    )?.value ?? ""
                                  }
                                  onChange={(e) =>
                                    updateCO2Factor(
                                      item.value,
                                      parseFloat(e.target.value),
                                    )
                                  }
                                />
                              </TableCell>
                            </TableRow>

                            {/* Preisdaten */}

                            <TableRow>
                              <TableCell>
                                <Typography>Heizwert in kWh/x:</Typography>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={
                                    configStore.heat.primaryEnergyCarrierData.find(
                                      (carrier) => carrier.key === item.value,
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
                              </TableCell>
                              <TableCell>
                                <Typography>Arbeitspreis in €/x:</Typography>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={
                                    configStore.heat.primaryEnergyCarrierData.find(
                                      (carrier) => carrier.key === item.value,
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
                              </TableCell>
                              <TableCell>
                                <Typography>Grundpreis in €/a:</Typography>
                                <TextField
                                  size="small"
                                  type="number"
                                  value={
                                    configStore.heat.primaryEnergyCarrierData.find(
                                      (carrier) => carrier.key === item.value,
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
                              </TableCell>
                            </TableRow>
                            {/* Liste an erlaubten Heizsysteme für die jeweiligen Energieträger */}
                            <Typography
                              variant="subtitle2"
                              fontWeight="600"
                              gutterBottom
                            >
                              Erlaubte Heizsysteme
                              <Button
                                onClick={() =>
                                  handleAddAllowedHeatingSystem(item.value)
                                }
                                sx={{
                                  bgcolor: "#C1272D",
                                  color: "white",
                                  "&:hover": { bgcolor: "#9B1F24" },
                                  ml: 1,
                                }}
                              >
                                Erlaubtes Heizsystem hinzufügen für{" "}
                                {item.localization.de}
                              </Button>
                            </Typography>
                            {configStore.heat.allowedHeatingSystemTypesByCarrier
                              .find((carrier) => carrier.key === item.value)
                              ?.allowedValues.map((heatingSystemType, idx) => (
                                <TableRow>
                                  <TableCell>
                                    <Chip
                                      label={
                                        configStore.heat.heatingSystemTypes.find(
                                          (sys) =>
                                            sys.value === heatingSystemType,
                                        )?.localization.de
                                      }
                                      size="small"
                                      color="primary"
                                    />
                                  </TableCell>
                                  <TableCell align="right">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleDeleteConfirm(() => {
                                          toast.success("Wert gelöscht");
                                        })
                                      }
                                    >
                                      <Delete fontSize="small" />
                                    </IconButton>
                                  </TableCell>
                                </TableRow>
                              ))}
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
      {/* Heizungstypen - Aufklappbar */}
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
            cursor: "pointer",
          }}
          onClick={() => toggleSection("heatingSystemTypes")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.heatingSystemTypes ? (
              <ExpandMore />
            ) : (
              <ChevronRight />
            )}
            <Typography variant="h6" fontWeight="600">
              Heizungstypen ({configStore.heat.heatingSystemTypes.length})
            </Typography>
          </Box>
          <Button
            onClick={handleAddHeatingSystemType}
            sx={{
              bgcolor: "#C1272D",
              color: "white",
              "&:hover": { bgcolor: "#9B1F24" },
            }}
          >
            Neuer Heizungstyp hinzufügen
          </Button>
        </Box>
        <Collapse in={expandedSections.heatingSystemTypes}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Bezeichnung</TableCell>
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configStore.heat.heatingSystemTypes.map((item, index) => {
                  const isOpen = expandedRows[index];

                  return (
                    <Fragment key={index}>
                      <TableRow hover>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => toggleRow(index)}
                          >
                            {isOpen ? <ExpandMore /> : <ChevronRight />}
                          </IconButton>
                          {item.localization.de}
                        </TableCell>

                        <TableCell align="right">
                          <IconButton
                            size="small"
                            onClick={() => handleEditHeatingSystemType(index)}
                          >
                            <Edit fontSize="small" />
                          </IconButton>

                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDeleteConfirm(() => {
                                // deleteHeatingSystemType(index);
                                toast.success("Heizungstyp gelöscht");
                              })
                            }
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      {/* Heizleistungsfaktoren */}
                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{ p: 0, borderBottom: "none" }}
                        >
                          <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2, bgcolor: "grey.50" }}>
                              <Typography
                                variant="subtitle2"
                                fontWeight="600"
                                mb={1}
                              >
                                Heizleistungsfaktoren:
                              </Typography>
                              {configStore.heat.heatingPerformanceFactor.find(
                                (e) => e.key === item.value,
                              ) && (
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Baujahr \ Leistung</TableCell>

                                      {/* Spalten = Leistungsbereiche */}
                                      {(configStore.heat.heatingPerformanceFactor.find(
                                        (e) => e.key === item.value,
                                      )!.value[0].value.length === 1
                                        ? [null] // nur eine Spalte: "Alle Leistungen"
                                        : configStore.heat.heatingPerformanceFactor.find(
                                            (e) => e.key === item.value,
                                          )!.value[0].value
                                      ).map((range, powerIndex) => (
                                        <TableCell
                                          key={powerIndex}
                                          align="center"
                                        >
                                          Aufwandzahl e
                                          {range == null && "Alle Leistungen"}
                                          {range?.from != null &&
                                            range?.to != null &&
                                            `${range.from}–${range.to}`}
                                          {range?.to != null &&
                                            range?.from == null &&
                                            `≤ ${range.to}`}
                                          {range?.from != null &&
                                            range?.to == null &&
                                            `> ${range.from}`}{" "}
                                          m²
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {/* Zeilen = Baujahre */}
                                    {configStore.heat.heatingPerformanceFactor
                                      .find((e) => e.key === item.value)!
                                      .value.map((datedEntry, yearIndex) => (
                                        <TableRow key={yearIndex}>
                                          {/* Baujahr */}
                                          <TableCell>
                                            {datedEntry.from != null &&
                                              datedEntry.to != null &&
                                              `${datedEntry.from}–${datedEntry.to}`}
                                            {datedEntry.to != null &&
                                              datedEntry.from == null &&
                                              `≤ ${datedEntry.to}`}
                                            {datedEntry.from != null &&
                                              datedEntry.to == null &&
                                              `ab ${datedEntry.from}`}
                                            {datedEntry.from == null &&
                                              datedEntry.to == null &&
                                              "alle"}
                                          </TableCell>

                                          {(datedEntry.value.length === 1
                                            ? [datedEntry.value[0]]
                                            : datedEntry.value
                                          ).map((range, powerIndex) => (
                                            <TableCell
                                              key={powerIndex}
                                              align="center"
                                            >
                                              {range.value}
                                            </TableCell>
                                          ))}
                                        </TableRow>
                                      ))}
                                  </TableBody>
                                </Table>
                              )}
                              <Typography
                                variant="subtitle2"
                                fontWeight="600"
                                mb={1}
                                mt={2}
                              >
                                {/* Temperaturregelungs‑Leistungsfaktoren */}
                                Temperaturregelungs‑Leistungsfaktoren:
                              </Typography>
                              {configStore.heat.temperatureControlPerformanceFactor.find(
                                (e) => e.key === item.value,
                              ) && (
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Baujahr \ Regelung</TableCell>

                                      {/* Spalten = Regelungsarten */}
                                      {configStore.heat.temperatureControlPerformanceFactor
                                        .find((e) => e.key === item.value)!
                                        .value[0].value.map(
                                          (controlType, controlIndex) => (
                                            <TableCell
                                              key={controlIndex}
                                              align="center"
                                            >
                                              {
                                                configStore.heat.heatingSurfaceTypes.find(
                                                  (htype) =>
                                                    htype.value ===
                                                    controlType.key,
                                                )?.localization.de
                                              }
                                            </TableCell>
                                          ),
                                        )}
                                    </TableRow>
                                  </TableHead>

                                  <TableBody>
                                    {/* Zeilen = Baujahre */}
                                    {configStore.heat.temperatureControlPerformanceFactor
                                      .find((e) => e.key === item.value)!
                                      .value.map((datedEntry, yearIndex) => (
                                        <TableRow key={yearIndex}>
                                          {/* Baujahr */}
                                          <TableCell>
                                            {datedEntry.from != null &&
                                              datedEntry.to != null &&
                                              `${datedEntry.from}–${datedEntry.to}`}
                                            {datedEntry.to != null &&
                                              datedEntry.from == null &&
                                              `≤ ${datedEntry.to}`}
                                            {datedEntry.from != null &&
                                              datedEntry.to == null &&
                                              `ab ${datedEntry.from}`}
                                            {datedEntry.from == null &&
                                              datedEntry.to == null &&
                                              "alle"}
                                          </TableCell>

                                          {/* Faktoren je Regelungsart */}
                                          {configStore.heat.temperatureControlPerformanceFactor
                                            .find((e) => e.key === item.value)!
                                            .value[0].value.map(
                                              (controlType) => (
                                                <TableCell
                                                  key={controlType.key}
                                                  align="center"
                                                >
                                                  {datedEntry.value.find(
                                                    (v) =>
                                                      v.key === controlType.key,
                                                  )?.value ?? "-"}
                                                </TableCell>
                                              ),
                                            )}
                                        </TableRow>
                                      ))}
                                  </TableBody>
                                </Table>
                              )}
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
      {/* Heizflächentypen */}
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
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
              Heizflächentypen ({configStore.heat.heatingSurfaceTypes.length})
            </Typography>
          </Box>
          <Button
            onClick={handleAddHeatingSurfaceType}
            sx={{
              bgcolor: "#C1272D",
              color: "white",
              "&:hover": { bgcolor: "#9B1F24" },
            }}
          >
            Neuer Heizflächentyp hinzufügen
          </Button>
        </Box>

        <Collapse in={expandedSections.heatingSurfaceTypes}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Bezeichnung</TableCell>
                  <TableCell align="right">Aktionen</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configStore.heat.heatingSurfaceTypes.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell>{item.localization.de}</TableCell>
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

      {/* Heizparameter */}
      <Paper sx={{ overflow: "hidden", mb: 2 }}>
        <Box sx={{ p: 2, bgcolor: "grey.50" }}>
          <Typography variant="h6" fontWeight="600">
            Parameter für Energie‑ und Anlagenberechnung
          </Typography>
        </Box>

        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle2" fontWeight="600" mb={1}>
            Standard‑Auswahl
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 280px",
              gap: 2,
              mb: 4,
            }}
          >
            <Typography>Primärenergieträger</Typography>
            <TextField
              select
              size="small"
              value={configStore.heat.defaultPrimaryEnergyCarrier}
            >
              {configStore.heat.primaryEnergyCarriers.map((carrier) => (
                <MenuItem key={carrier.value} value={carrier.value}>
                  {carrier.localization.de}
                </MenuItem>
              ))}
            </TextField>

            <Typography>Heizungssystem</Typography>
            <TextField
              select
              size="small"
              value={configStore.heat.defaultHeatingSystemType}
            >
              {configStore.heat.heatingSystemTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.localization.de}
                </MenuItem>
              ))}
            </TextField>

            <Typography>Heizflächentyp</Typography>
            <TextField
              select
              size="small"
              value={configStore.heat.defaultHeatingSurfaceType}
            >
              <MenuItem value="radiant_surface_heating">
                Flächenheizung
              </MenuItem>
              <MenuItem value="free_heat_emitter">Freie Wärmeabgabe</MenuItem>
            </TextField>
          </Box>

          <Typography variant="subtitle2" fontWeight="600" mb={1}>
            Energetische Kennwerte
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 180px",
              gap: 2,
            }}
          >
            <Typography>Heizgradtage (HDD)</Typography>
            <TextField
              size="small"
              type="number"
              value={configStore.heat.heatingDegreeDays}
            />

            <Typography>Lüftungs‑Wärmeverlust (kHv)</Typography>
            <TextField
              size="small"
              type="number"
              inputProps={{ step: 0.01 }}
              value={configStore.heat.ventilationHeatLossCorrectionFactor}
            />

            <Typography>
              Warmwasserbedarf (kWh/m<sup>2</sup>a)
            </Typography>
            <TextField
              size="small"
              type="number"
              inputProps={{ step: 0.1 }}
              value={configStore.heat.hotWaterEnergyDemandFromAreaFactor}
            />
          </Box>
        </Box>
      </Paper>

      {/* Gebäudeparameter */}
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="h6" fontWeight="600">
            Gebäudeparameter
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Parameter</TableCell>
                <TableCell>Wert</TableCell>
                <TableCell align="right">Aktionen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow hover>
                <TableCell>Geschossdeckenstärke (m)</TableCell>
                <TableCell>
                  {configStore.general.assumedFloorSlabThickness}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleEditSimpleValue(
                        "general.assumedFloorSlabThickness",
                        "Geschossdeckenstärke",
                        configStore.general.assumedFloorSlabThickness,
                      )
                    }
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Geschosshöhe Innenraum (m)</TableCell>
                <TableCell>
                  {configStore.general.assumedInteriorStoryHeight}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleEditSimpleValue(
                        "general.assumedInteriorStoryHeight",
                        "Geschosshöhe Innenraum",
                        configStore.general.assumedInteriorStoryHeight,
                      )
                    }
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Nutzflächenfaktor</TableCell>
                <TableCell>
                  {configStore.general.usableFloorAreaFactor}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleEditSimpleValue(
                        "general.usableFloorAreaFactor",
                        "Nutzflächenfaktor",
                        configStore.general.usableFloorAreaFactor,
                      )
                    }
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Nettogrundfläche aus Wohnflächenfaktor</TableCell>
                <TableCell>
                  {configStore.general.netFloorAreaFromLivingAreaFactor}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleEditSimpleValue(
                        "general.netFloorAreaFromLivingAreaFactor",
                        "Nettogrundfläche aus Wohnflächenfaktor",
                        configStore.general.netFloorAreaFromLivingAreaFactor,
                      )
                    }
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Heizgradtage (HDD)</TableCell>
                <TableCell>{configStore.heat.heatingDegreeDays}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleEditSimpleValue(
                        "heat.heatingDegreeDays",
                        "Heizgradtage",
                        configStore.heat.heatingDegreeDays,
                      )
                    }
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>Lüftungswärmeverlust Korrekturfaktor</TableCell>
                <TableCell>
                  {configStore.heat.ventilationHeatLossCorrectionFactor}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleEditSimpleValue(
                        "heat.ventilationHeatLossCorrectionFactor",
                        "Lüftungswärmeverlust Korrekturfaktor",
                        configStore.heat.ventilationHeatLossCorrectionFactor,
                      )
                    }
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
              <TableRow hover>
                <TableCell>
                  Warmwasser Energiebedarf aus Flächenfaktor
                </TableCell>
                <TableCell>
                  {configStore.heat.hotWaterEnergyDemandFromAreaFactor}
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() =>
                      handleEditSimpleValue(
                        "heat.hotWaterEnergyDemandFromAreaFactor",
                        "Warmwasser Energiebedarf",
                        configStore.heat.hotWaterEnergyDemandFromAreaFactor,
                      )
                    }
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Oberflächen‑Wärmeübergangswiderstände */}
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
          }}
        >
          <Typography variant="h6" fontWeight="600">
            Oberflächen‑Wärmeübergangswiderstände
          </Typography>
        </Box>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Wärmeflussrichtung</TableCell>
                <TableCell>
                  Innen (R<sub>si</sub>)
                </TableCell>
                <TableCell>
                  Außen (R<sub>se</sub>)
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {configStore.heat.innerSurfaceThermalResistance.map(
                (innerEntry, index) => {
                  const outerEntry =
                    configStore.heat.outerSurfaceThermalResistance.find(
                      (o) => o.key === innerEntry.key,
                    );

                  return (
                    <TableRow key={innerEntry.key} hover>
                      <TableCell>
                        {lookUpHeatFlowEnum(innerEntry.key)}
                      </TableCell>
                      {/* Innen */}
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={innerEntry.value}
                        />
                      </TableCell>
                      {/* Außen */}
                      <TableCell>
                        <TextField
                          size="small"
                          type="number"
                          value={outerEntry?.value ?? ""}
                          sx={{ width: 100 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                },
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {/* Dach - Aufklappbar */}
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
            cursor: "pointer",
          }}
          onClick={() => toggleSection("roof")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.roof ? <ExpandMore /> : <ChevronRight />}
            <Typography variant="h6" fontWeight="600">
              Dach
            </Typography>
          </Box>
        </Box>

        {/* Inhalt */}
        <Collapse in={expandedSections.roof}>
          <Box sx={{ p: 2 }}>
            {/* Basisparameter */}
            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Allgemeine Parameter
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 120px auto",
                gap: 1.5,
                mb: 3,
              }}
            >
              <Typography>Wärmeverlustfaktor</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.roof.heatLossFactor}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleEditSimpleValue(
                    "roof.heatLossFactor",
                    "Wärmeverlustfaktor Dach",
                    configStore.roof.heatLossFactor,
                  )
                }
              >
                <Edit fontSize="small" />
              </IconButton>

              <Typography>Angenommene Dämmstärke (m)</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.roof.assumedInsulationThickness}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleEditSimpleValue(
                    "roof.assumedInsulationThickness",
                    "Angenommene Dämmstärke Dach",
                    configStore.roof.assumedInsulationThickness,
                  )
                }
              >
                <Edit fontSize="small" />
              </IconButton>

              <Typography>Wärmeleitfähigkeit λ</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.roof.thermalConductivity}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleEditSimpleValue(
                    "roof.thermalConductivity",
                    "Wärmeleitfähigkeit Dach",
                    configStore.roof.thermalConductivity,
                  )
                }
              >
                <Edit fontSize="small" />
              </IconButton>

              <Typography>Dämmungs‑Reduktionsfaktor</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.roof.insulationReductionFactor}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleEditSimpleValue(
                    "roof.insulationReductionFactor",
                    "Dämmungs-Reduktionsfaktor Dach",
                    configStore.roof.insulationReductionFactor,
                  )
                }
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>
            {/* U-Werte */}
            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Pauschalwerte für den Wärmedurchgangskoeffizienten in W/(m² * K)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Konstruktion \ Baujahr</TableCell>

                  {configStore.roof.uValue[0]?.value.map((band, bandIndex) => (
                    <TableCell key={bandIndex} align="center">
                      {band.from != null &&
                        band.to != null &&
                        `${band.from} – ${band.to}`}
                      {band.to != null && band.from == null && `≤ ${band.to}`}
                      {band.from != null &&
                        band.to == null &&
                        `ab ${band.from}`}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {configStore.roof.uValue.map(
                  (construction, constructionIndex) => (
                    <TableRow key={construction.key}>
                      <TableCell>{lookUpForNames(construction.key)}</TableCell>

                      {configStore.roof.uValue[0]?.value.map((_, bandIndex) => (
                        <TableCell key={bandIndex} align="center">
                          <TextField
                            size="small"
                            type="number"
                            value={construction.value[bandIndex]?.value ?? ""}
                            onChange={(e) =>
                              updateRoofUValue(
                                constructionIndex,
                                bandIndex,
                                parseFloat(e.target.value),
                              )
                            }
                            sx={{ width: 80 }}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </Box>
        </Collapse>
      </Paper>
      {/* Außenwand - Aufklappbar */}
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
            cursor: "pointer",
          }}
          onClick={() => toggleSection("outerWall")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.outerWall ? <ExpandMore /> : <ChevronRight />}
            <Typography variant="h6" fontWeight="600">
              Außenwand
            </Typography>
          </Box>
        </Box>

        {/* Inhalt */}
        <Collapse in={expandedSections.outerWall}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Allgemeine Parameter
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 140px auto",
                gap: 1.5,
                mb: 3,
              }}
            >
              <Typography>Wärmeverlustfaktor</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.outerWall.heatLossFactor}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleEditSimpleValue(
                    "outerWall.heatLossFactor",
                    "Wärmeverlustfaktor Außenwand",
                    configStore.outerWall.heatLossFactor,
                  )
                }
              >
                <Edit fontSize="small" />
              </IconButton>

              <Typography>Angenommene Dämmstärke (m)</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.outerWall.assumedInsulationThickness}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleEditSimpleValue(
                    "outerWall.assumedInsulationThickness",
                    "Angenommene Dämmstärke Außenwand",
                    configStore.outerWall.assumedInsulationThickness,
                  )
                }
              >
                <Edit fontSize="small" />
              </IconButton>

              <Typography>Wärmeleitfähigkeit λ</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.outerWall.thermalConductivity}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleEditSimpleValue(
                    "outerWall.thermalConductivity",
                    "Wärmeleitfähigkeit Außenwand",
                    configStore.outerWall.thermalConductivity,
                  )
                }
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Standard‑Konstruktion nach Baujahr
            </Typography>

            <Box sx={{ mb: 3 }}>
              {configStore.outerWall.defaultConstructionType.map(
                (band, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 0.75,
                      pl: 1,
                    }}
                  >
                    <Typography sx={{ minWidth: 200 }}>
                      Baujahr&nbsp;
                      {band.from != null &&
                        band.to != null &&
                        `${band.from} – ${band.to}`}
                      {band.to != null && band.from == null && `≤ ${band.to}`}
                      {band.from != null &&
                        band.to == null &&
                        `ab ${band.from}`}
                    </Typography>

                    <TextField
                      size="small"
                      value={lookUpForNames(band.value)}
                      sx={{ width: 260 }}
                    />
                  </Box>
                ),
              )}
            </Box>

            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Pauschalwerte für den Wärmedurchgangskoeffizienten in W/(m² * K)
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Konstruktion \ Baujahr</TableCell>

                  {Array.from(
                    new Map(
                      configStore.outerWall.uValue.flatMap((c) =>
                        c.value
                          .filter((b) => b.from != null || b.to != null)
                          .map((b) => [`${b.from ?? "≤"}-${b.to ?? "∞"}`, b]),
                      ),
                    ).values(),
                  ).map((band, index) => (
                    <TableCell key={index} align="center">
                      {band.from != null &&
                        band.to != null &&
                        `${band.from}–${band.to}`}
                      {band.to != null && band.from == null && `≤ ${band.to}`}
                      {band.from != null &&
                        band.to == null &&
                        `ab ${band.from}`}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {configStore.outerWall.uValue.map(
                  (construction, constructionIndex) => (
                    <TableRow key={construction.key}>
                      <TableCell>
                        <strong>{lookUpForNames(construction.key)}</strong>
                      </TableCell>
                      {Array.from(
                        new Map(
                          configStore.outerWall.uValue.flatMap((c) =>
                            c.value
                              .filter((b) => b.from != null || b.to != null)
                              .map((b) => [
                                `${b.from ?? "≤"}-${b.to ?? "∞"}`,
                                b,
                              ]),
                          ),
                        ).values(),
                      ).map((yearBand, bandIndex) => {
                        const matchingBand =
                          construction.value.find(
                            (b) =>
                              (b.from ?? -Infinity) <=
                                (yearBand.from ?? Infinity) &&
                              (b.to ?? Infinity) >= (yearBand.to ?? -Infinity),
                          ) ||
                          construction.value.find(
                            (b) => b.from == null && b.to == null,
                          );

                        return (
                          <TableCell key={bandIndex} align="center">
                            <TextField
                              size="small"
                              type="number"
                              value={matchingBand?.value ?? ""}
                              onChange={(e) => {
                                const valueIndex = construction.value.indexOf(
                                  matchingBand!,
                                );
                                if (valueIndex !== -1) {
                                  updateOuterWallUValue(
                                    constructionIndex,
                                    valueIndex,
                                    parseFloat(e.target.value),
                                  );
                                }
                              }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </Box>
        </Collapse>
      </Paper>
      {/* Oberste Geschossdecke */}
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
            cursor: "pointer",
          }}
          onClick={() => toggleSection("topFloor")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.topFloor ? <ExpandMore /> : <ChevronRight />}
            <Typography variant="h6" fontWeight="600">
              Oberste Geschossdecke
            </Typography>
          </Box>
        </Box>

        {/* Inhalt */}
        <Collapse in={expandedSections.topFloor}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Allgemeine Parameter
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 140px auto",
                gap: 1.5,
                mb: 3,
              }}
            >
              <Typography>Wärmeverlustfaktor</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.topFloor.heatLossFactor}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleEditSimpleValue(
                    "topFloor.heatLossFactor",
                    "Wärmeverlustfaktor Obergeschossdecke",
                    configStore.topFloor.heatLossFactor,
                  )
                }
              >
                <Edit fontSize="small" />
              </IconButton>

              <Typography>Angenommene Dämmstärke (m)</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.topFloor.assumedInsulationThickness}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleEditSimpleValue(
                    "topFloor.assumedInsulationThickness",
                    "Angenommene Dämmstärke Obergeschossdecke",
                    configStore.topFloor.assumedInsulationThickness,
                  )
                }
              >
                <Edit fontSize="small" />
              </IconButton>

              <Typography>Wärmeleitfähigkeit λ</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.topFloor.thermalConductivity}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleEditSimpleValue(
                    "topFloor.thermalConductivity",
                    "Wärmeleitfähigkeit Obergeschossdecke",
                    configStore.topFloor.thermalConductivity,
                  )
                }
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Standard‑Deckentyp nach Baujahr
            </Typography>

            <Box sx={{ mb: 3 }}>
              {configStore.topFloor.defaultTopFloorType.map(
                (band, bandIndex) => (
                  <Box
                    key={bandIndex}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 0.75,
                      pl: 1,
                    }}
                  >
                    {/* Baujahr */}
                    <Typography sx={{ minWidth: 200 }}>
                      Baujahr&nbsp;
                      {band.from != null &&
                        band.to != null &&
                        `${band.from}–${band.to}`}
                      {band.to != null && band.from == null && `≤ ${band.to}`}
                      {band.from != null &&
                        band.to == null &&
                        `ab ${band.from}`}
                    </Typography>

                    {/* Deckentyp */}
                    <TextField
                      select
                      size="small"
                      value={band.value}
                      onChange={(e) => uuid(bandIndex, e.target.value)}
                      sx={{ width: 280 }}
                    >
                      {configStore.topFloor.topFloorTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.localization.de}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Box>
                ),
              )}
            </Box>
            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Pauschalwerte für den Wärmedurchgangskoeffizienten in W/(m² * K)
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Deckentyp \ Baujahr</TableCell>

                  {Array.from(
                    new Map(
                      configStore.topFloor.uValue.flatMap((t) =>
                        t.value
                          .filter((b) => b.from != null || b.to != null)
                          .map((b) => [`${b.from ?? "≤"}-${b.to ?? "∞"}`, b]),
                      ),
                    ).values(),
                  ).map((band, index) => (
                    <TableCell key={index} align="center">
                      {band.from != null &&
                        band.to != null &&
                        `${band.from}–${band.to}`}
                      {band.to != null && band.from == null && `≤ ${band.to}`}
                      {band.from != null &&
                        band.to == null &&
                        `ab ${band.from}`}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {configStore.topFloor.uValue.map(
                  (ceilingType, ceilingIndex) => (
                    <TableRow key={ceilingType.key}>
                      {/* Deckentyp */}
                      <TableCell>
                        <strong>{lookUpForNames(ceilingType.key)}</strong>
                      </TableCell>

                      {/* U‑Werte pro Baujahr */}
                      {Array.from(
                        new Map(
                          configStore.topFloor.uValue.flatMap((t) =>
                            t.value
                              .filter((b) => b.from != null || b.to != null)
                              .map((b) => [
                                `${b.from ?? "≤"}-${b.to ?? "∞"}`,
                                b,
                              ]),
                          ),
                        ).values(),
                      ).map((yearBand, bandIndex) => {
                        const matchingBand =
                          ceilingType.value.find(
                            (b) =>
                              (b.from ?? -Infinity) <=
                                (yearBand.from ?? Infinity) &&
                              (b.to ?? Infinity) >= (yearBand.to ?? -Infinity),
                          ) ||
                          ceilingType.value.find(
                            (b) => b.from == null && b.to == null,
                          );

                        return (
                          <TableCell key={bandIndex} align="center">
                            <TextField
                              size="small"
                              type="number"
                              value={matchingBand?.value ?? ""}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </Box>
        </Collapse>
      </Paper>
      {/* Unterste Geschossdecke */}
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        {/* Header */}
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
            cursor: "pointer",
          }}
          onClick={() => toggleSection("bottomFloor")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.bottomFloor ? <ExpandMore /> : <ChevronRight />}
            <Typography variant="h6" fontWeight="600">
              Unterste Geschossdecke
            </Typography>
          </Box>
        </Box>

        {/* Inhalt */}
        <Collapse in={expandedSections.bottomFloor}>
          <Box sx={{ p: 2 }}>
            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Allgemeine Parameter
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 140px auto",
                gap: 1.5,
                mb: 3,
              }}
            >
              <Typography>Wärmeverlustfaktor</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.bottomFloor.heatLossFactor}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleEditSimpleValue(
                    "bottomFloor.heatLossFactor",
                    "Wärmeverlustfaktor Boden/Kellerdecke",
                    configStore.bottomFloor.heatLossFactor,
                  )
                }
              >
                <Edit fontSize="small" />
              </IconButton>

              <Typography>Angenommene Dämmstärke (m)</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.bottomFloor.assumedInsulationThickness}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleEditSimpleValue(
                    "bottomFloor.assumedInsulationThickness",
                    "Angenommene Dämmstärke Boden/Kellerdecke",
                    configStore.bottomFloor.assumedInsulationThickness,
                  )
                }
              >
                <Edit fontSize="small" />
              </IconButton>

              <Typography>Wärmeleitfähigkeit λ</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.bottomFloor.thermalConductivity}
              />
              <IconButton
                size="small"
                onClick={() =>
                  handleEditSimpleValue(
                    "bottomFloor.thermalConductivity",
                    "Wärmeleitfähigkeit Boden/Kellerdecke",
                    configStore.bottomFloor.thermalConductivity,
                  )
                }
              >
                <Edit fontSize="small" />
              </IconButton>
            </Box>

            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Erlaubte Konstruktionen nach beheiztem Keller
            </Typography>

            <Box sx={{ mb: 3 }}>
              {configStore.bottomFloor.allowedConstructionTypesByHeatedCellar.map(
                (entry, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: 0.75,
                      pl: 1,
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ minWidth: 220 }}>
                      Beheizter Keller:{" "}
                      {String(entry.key) == "true" ? "ja" : "nein"}
                    </Typography>

                    <TextField
                      size="small"
                      value={entry.allowedValues
                        .map((val) => lookUpForNames(val))
                        .join(", ")}
                      sx={{ flex: 1 }}
                    />
                  </Box>
                ),
              )}
            </Box>

            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Standard‑Konstruktion
            </Typography>

            <Box sx={{ mb: 3 }}>
              {configStore.bottomFloor.defaultConstructionType.map(
                (group, groupIndex) => (
                  <Box key={groupIndex} sx={{ mb: 2 }}>
                    <Typography fontWeight="500" sx={{ mb: 0.75 }}>
                      Beheizter Keller:{" "}
                      {String(group.key) == "true" ? "ja" : "nein"}
                    </Typography>

                    {group.value.map((band, bandIndex) => (
                      <Box
                        key={bandIndex}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          mb: 0.5,
                          pl: 2,
                        }}
                      >
                        <Typography sx={{ minWidth: 200 }}>
                          Baujahr&nbsp;
                          {band.from != null &&
                            band.to != null &&
                            `${band.from} – ${band.to}`}
                          {band.to != null &&
                            band.from == null &&
                            `≤ ${band.to}`}
                          {band.from != null &&
                            band.to == null &&
                            `ab ${band.from}`}
                          {band.from == null && band.to == null && "alle"}
                        </Typography>

                        <TextField
                          size="small"
                          value={lookUpForNames(band.value)}
                          sx={{ width: 260 }}
                        />
                      </Box>
                    ))}
                  </Box>
                ),
              )}
            </Box>

            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Pauschalwerte für den Wärmedurchgangskoeffizienten in W/(m² * K)
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Konstruktion \ Baujahr</TableCell>

                  {Array.from(
                    new Map(
                      configStore.bottomFloor.uValue.flatMap((c) =>
                        c.value
                          .filter((b) => b.from != null || b.to != null)
                          .map((b) => [`${b.from ?? "≤"}-${b.to ?? "∞"}`, b]),
                      ),
                    ).values(),
                  ).map((band, index) => (
                    <TableCell key={index} align="center">
                      {band.from != null &&
                        band.to != null &&
                        `${band.from}–${band.to}`}
                      {band.to != null && band.from == null && `≤ ${band.to}`}
                      {band.from != null &&
                        band.to == null &&
                        `ab ${band.from}`}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {configStore.bottomFloor.uValue.map(
                  (construction, constructionIndex) => (
                    <TableRow key={construction.key}>
                      {/* Konstruktion */}
                      <TableCell>
                        <strong>{lookUpForNames(construction.key)}</strong>
                      </TableCell>

                      {/* U‑Werte pro Baujahr */}
                      {Array.from(
                        new Map(
                          configStore.bottomFloor.uValue.flatMap((c) =>
                            c.value
                              .filter((b) => b.from != null || b.to != null)
                              .map((b) => [
                                `${b.from ?? "≤"}-${b.to ?? "∞"}`,
                                b,
                              ]),
                          ),
                        ).values(),
                      ).map((yearBand, bandIndex) => {
                        const matchingBand =
                          construction.value.find(
                            (b) =>
                              (b.from ?? -Infinity) <=
                                (yearBand.from ?? Infinity) &&
                              (b.to ?? Infinity) >= (yearBand.to ?? -Infinity),
                          ) ||
                          construction.value.find(
                            (b) => b.from == null && b.to == null,
                          );

                        return (
                          <TableCell key={bandIndex} align="center">
                            <TextField
                              size="small"
                              type="number"
                              value={matchingBand?.value ?? ""}
                              onChange={(e) => {
                                const valueIndex = construction.value.indexOf(
                                  matchingBand!,
                                );
                                if (valueIndex !== -1) {
                                  updateBottomFloorUValue(
                                    constructionIndex,
                                    valueIndex,
                                    parseFloat(e.target.value),
                                  );
                                }
                              }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </Box>
        </Collapse>
      </Paper>
      {/* Fenster - Aufklappbar */}
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: "grey.50",
            cursor: "pointer",
          }}
          onClick={() => toggleSection("windows")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.windows ? <ExpandMore /> : <ChevronRight />}
            <Typography variant="h6" fontWeight="600">
              Fenster
            </Typography>
          </Box>
        </Box>
        <Collapse in={expandedSections.windows}>
          <Box sx={{ p: 2 }}>
            {/* Basisparameter */}
            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Allgemeine Parameter
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 140px",
                gap: 1.5,
                mb: 3,
              }}
            >
              <Typography>Wärmeverlustfaktor – Dachfenster</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.windows.roofWindowsHeatLossFactor}
              />

              <Typography>Wärmeverlustfaktor – Außenwandfenster</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.windows.exteriorWallWindowsHeatLossFactor}
              />
            </Box>

            {/* Default-Fenstertyp nach Baujahr */}
            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Standard‑Fenstertyp nach Baujahr
            </Typography>

            <Box sx={{ mb: 3 }}>
              {configStore.windows.defaultWindowType.map((band, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    mb: 0.75,
                    pl: 1,
                  }}
                >
                  <Typography sx={{ minWidth: 200 }}>
                    Baujahr&nbsp;
                    {band.from != null &&
                      band.to != null &&
                      `${band.from} – ${band.to}`}
                    {band.to != null && band.from == null && `≤ ${band.to}`}
                    {band.from != null && band.to == null && `ab ${band.from}`}
                  </Typography>

                  <TextField
                    size="small"
                    value={lookUpForNames(band.value)}
                    sx={{ width: 320 }}
                  />
                </Box>
              ))}
            </Box>

            {/* U-Werte */}
            <Typography variant="subtitle2" fontWeight="600" mb={1}>
              Pauschalwerte für den Wärmedurchgangskoeffizienten in W/(m² * K)
            </Typography>

            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Fenstertyp \ Baujahr</TableCell>

                  {Array.from(
                    new Map(
                      configStore.windows.uValue.flatMap((w) =>
                        w.value
                          .filter((b) => b.from != null || b.to != null)
                          .map((b) => [`${b.from ?? "≤"}-${b.to ?? "∞"}`, b]),
                      ),
                    ).values(),
                  ).map((band, index) => (
                    <TableCell key={index} align="center">
                      {band.from != null &&
                        band.to != null &&
                        `${band.from}–${band.to}`}
                      {band.to != null && band.from == null && `≤ ${band.to}`}
                      {band.from != null &&
                        band.to == null &&
                        `ab ${band.from}`}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {configStore.windows.uValue.map(
                  (windowType, windowTypeIndex) => (
                    <TableRow key={windowType.key}>
                      {/* Fenstertyp */}
                      <TableCell>
                        <strong>{lookUpForNames(windowType.key)}</strong>
                      </TableCell>

                      {/* U‑Werte je Baujahr */}
                      {Array.from(
                        new Map(
                          configStore.windows.uValue.flatMap((w) =>
                            w.value
                              .filter((b) => b.from != null || b.to != null)
                              .map((b) => [
                                `${b.from ?? "≤"}-${b.to ?? "∞"}`,
                                b,
                              ]),
                          ),
                        ).values(),
                      ).map((yearBand, bandIndex) => {
                        // Passendes Baujahrsband finden oder "alle"-Wert verwenden
                        const matchingBand =
                          windowType.value.find(
                            (b) =>
                              (b.from ?? -Infinity) <=
                                (yearBand.from ?? Infinity) &&
                              (b.to ?? Infinity) >= (yearBand.to ?? -Infinity),
                          ) ||
                          windowType.value.find(
                            (b) => b.from == null && b.to == null,
                          );

                        return (
                          <TableCell key={bandIndex} align="center">
                            <TextField
                              size="small"
                              type="number"
                              value={matchingBand?.value ?? ""}
                              onChange={(e) => {
                                const valueIndex = windowType.value.indexOf(
                                  matchingBand!,
                                );
                                if (valueIndex !== -1) {
                                  updateWindowsUValue(
                                    windowTypeIndex,
                                    valueIndex,
                                    parseFloat(e.target.value),
                                  );
                                }
                              }}
                              sx={{ width: 80 }}
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ),
                )}
              </TableBody>
            </Table>
          </Box>
        </Collapse>
      </Paper>

      {/* Speichern Button */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 4, mb: 4 }}>
        <Button
          variant="contained"
          color="error"
          size="large"
          onClick={handleSaveAll}
        >
          Speichern
        </Button>
      </Box>
      {/* Edit Dialog */}
      <EditDialog
        open={editState.open}
        title={editState.title}
        fields={editState.fields}
        onClose={() => setEditState({ ...editState, open: false })}
        onSave={editState.onSave}
      />
      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, onConfirm: () => {} })}
      />
    </Container>
  );
}
