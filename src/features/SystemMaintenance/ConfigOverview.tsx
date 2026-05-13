import ComunityParameterSection from "@/features/SystemMaintenance/sections/ComunityParameterSection";
import ElectricityTypesSection from "@/features/SystemMaintenance/sections/ElectricityTypesSection";
import FoerderprogrammeSection from "@/features/SystemMaintenance/sections/FoerderprogrammeSection";
import HeatingSurfaceTypesSection from "@/features/SystemMaintenance/sections/HeatingSurfaceTypesSection";
import HeatingTypesSection from "@/features/SystemMaintenance/sections/HeatingTypesSection";
import OgdSection from "@/features/SystemMaintenance/sections/OgdSection";
import OuterWallSection from "@/features/SystemMaintenance/sections/OuterWallSection";
import { PrimaryEnergyCarrierSection } from "@/features/SystemMaintenance/sections/PrimaryEnergyCarrierSection";
import RoofSection from "@/features/SystemMaintenance/sections/RoofSection";
import SurfaceTempResistenceSection from "@/features/SystemMaintenance/sections/SurfaceTempResistenceSection";
import UgdSection from "@/features/SystemMaintenance/sections/UgdSection";
import WindowSection from "@/features/SystemMaintenance/sections/WindowSection";
import { Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import { useStore } from "@nanostores/react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "../../components/ConfirmDeleteDialog";
import { EditDialog } from "../../components/EditDialog";
import { SaveDialog } from "../../components/SaveDialog";
import {
  config,
  type EnergyEfficiencyEntry,
  type YearBandEntry,
} from "../../hooks/store";
import { EnergyEfficiencySection } from "./sections/EnergyEfficiencySection";
import { GeneralParametersSection } from "./sections/GeneralParametersSection";
import { YearBandSection } from "./sections/YearBandSection";

export interface EditState {
  open: boolean;
  title: string;
  fields: Array<{
    key: string;
    label: string;
    value: string | number;
    type?: "text" | "number" | "color" | "select";
    required?: boolean;
  }>;
  onSave: (strings: Record<string, string>, numbers: Record<string, number>) => void;
}

export interface DeleteConfirmState {
  open: boolean;
  onConfirm: () => void;
}

export interface NamedTypeItem {
  value?: string;
  key?: string;
  localization?: { de: string; en: string };
}

export interface BandValidationResult {
  valid: boolean;
  errors: { index: number; error: string }[];
}

const YEAR_BAND_ERRORS: Record<string, string> = {
  first_must_have_only_to: "Erstes Band darf nur 'Bis' haben",
  middle_must_have_both: "Mittleres Band braucht 'Von' und 'Bis'",
  last_must_have_only_from: "Letztes Band darf nur 'Von' haben",
  gap_between_bands: "Lücke zum vorherigen Band",
  overlap_between_bands: "Überschneidung mit vorherigem Band",
  single_must_be_empty: "Einzelnes Band darf keine Werte haben",
};

const ENERGY_BAND_ERRORS: Record<string, string> = {
  ...YEAR_BAND_ERRORS,
  single_must_be_empty: "Einzelnes Band darf keine Bereichswerte haben",
  missing_value: "Klasse fehlt",
  missing_color: "Farbe fehlt",
};

function validateYearBands(bands: YearBandEntry[]): BandValidationResult {
  const errors: { index: number; error: string }[] = [];
  if (bands.length === 0) return { valid: true, errors: [] };
  if (bands.length === 1) {
    if (bands[0]!.from !== undefined || bands[0]!.to !== undefined)
      errors.push({ index: 0, error: YEAR_BAND_ERRORS["single_must_be_empty"]! });
    return { valid: errors.length === 0, errors };
  }
  bands.forEach((band, i) => {
    const isFirst = i === 0;
    const isLast = i === bands.length - 1;
    if (isFirst) {
      if (band.to === undefined || band.from !== undefined)
        errors.push({ index: i, error: YEAR_BAND_ERRORS["first_must_have_only_to"]! });
    } else if (isLast) {
      if (band.from === undefined || band.to !== undefined)
        errors.push({ index: i, error: YEAR_BAND_ERRORS["last_must_have_only_from"]! });
    } else {
      if (band.from === undefined || band.to === undefined)
        errors.push({ index: i, error: YEAR_BAND_ERRORS["middle_must_have_both"]! });
    }
    if (i > 0) {
      const prevTo = bands[i - 1]!.to;
      const currFrom = band.from;
      if (prevTo !== undefined && currFrom !== undefined) {
        if (currFrom > prevTo + 1)
          errors.push({ index: i, error: YEAR_BAND_ERRORS["gap_between_bands"]! });
        else if (currFrom <= prevTo)
          errors.push({ index: i, error: YEAR_BAND_ERRORS["overlap_between_bands"]! });
      }
    }
  });
  return { valid: errors.length === 0, errors };
}

function validateEnergyClasses(bands: EnergyEfficiencyEntry[]): BandValidationResult {
  const errors: { index: number; error: string }[] = [];
  if (bands.length === 0) return { valid: true, errors: [] };
  if (bands.length === 1) {
    const b = bands[0]!;
    if (b.from !== undefined || b.to !== undefined)
      errors.push({ index: 0, error: ENERGY_BAND_ERRORS["single_must_be_empty"]! });
    if (!b.value)
      errors.push({ index: 0, error: ENERGY_BAND_ERRORS["missing_value"]! });
    if (!b.color)
      errors.push({ index: 0, error: ENERGY_BAND_ERRORS["missing_color"]! });
    return { valid: errors.length === 0, errors };
  }
  bands.forEach((band, i) => {
    const isFirst = i === 0;
    const isLast = i === bands.length - 1;
    if (isFirst) {
      if (band.to === undefined || band.from !== undefined)
        errors.push({ index: i, error: ENERGY_BAND_ERRORS["first_must_have_only_to"]! });
    } else if (isLast) {
      if (band.from === undefined || band.to !== undefined)
        errors.push({ index: i, error: ENERGY_BAND_ERRORS["last_must_have_only_from"]! });
    } else {
      if (band.from === undefined || band.to === undefined)
        errors.push({ index: i, error: ENERGY_BAND_ERRORS["middle_must_have_both"]! });
    }
    if (!band.value)
      errors.push({ index: i, error: ENERGY_BAND_ERRORS["missing_value"]! });
    if (!band.color)
      errors.push({ index: i, error: ENERGY_BAND_ERRORS["missing_color"]! });
    if (i > 0) {
      const prevTo = bands[i - 1]!.to;
      const currFrom = band.from;
      if (prevTo !== undefined && currFrom !== undefined) {
        if (currFrom > prevTo)
          errors.push({ index: i, error: ENERGY_BAND_ERRORS["gap_between_bands"]! });
        else if (currFrom < prevTo)
          errors.push({ index: i, error: ENERGY_BAND_ERRORS["overlap_between_bands"]! });
      }
    }
  });
  return { valid: errors.length === 0, errors };
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

  const handleConfirmDelete = () => {
    deleteConfirm.onConfirm();
    setDeleteConfirm({ open: false, onConfirm: () => {} });
  };

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  const [saveDialogOpen, setSaveDialogOpen] = useState(false);

  const configFilesDummies = [
    { value: "config1.json" },
    { value: "currentconfig.json" },
    { value: "default.json" },
  ];

  const [configFiles, setConfigFiles] = useState(configFilesDummies);

  const handleSaveAll = (fileName: string) => {
    if (!fileName.endsWith(".json")) {
      toast.error(`Konfigurationsdatei muss mit .json enden`);
    } else if (configFiles.find((file) => file.value === fileName)) {
      toast.error(`Es existiert schon eine Datei mit den Namen „${fileName}" `);
    } else {
      setConfigFiles((prev) => [...prev, { value: fileName }]);
      setSelectedConfigFile(fileName);
      toast.success(`Konfiguration gespeichert als „${fileName}"`);
      // Deal with new config that is contained in the nanostore
    }
  };

  const [selectedConfigFile, setSelectedConfigFile] = useState<string>(
    configFiles[2]!.value,
  );

  const yearBandValidation = useMemo(
    () => validateYearBands(configStore.general.generalYearBands as YearBandEntry[]),
    [configStore.general.generalYearBands],
  );
  const energyClassValidation = useMemo(
    () => validateEnergyClasses(configStore.general.energyEfficiencyClasses as EnergyEfficiencyEntry[]),
    [configStore.general.energyEfficiencyClasses],
  );
  const canSave = yearBandValidation.valid && energyClassValidation.valid;
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h2" gutterBottom>
              Systempflege
            </Typography>
            <Typography variant="body1">
              Konfiguration und Anpassung der Systemeinstellungen
            </Typography>
          </Box>
          <TextField
            select
            label="Konfigurationsdatei"
            value={selectedConfigFile}
            onChange={(e) => setSelectedConfigFile(e.target.value)}
            sx={{ width: 250 }}
          >
            {configFiles.map((option) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{ lineHeight: 1.5 }}
              >
                {option.value}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box
          sx={{
            bgcolor: "white",
            display: "flex",
            flexDirection: "column",
            gap: 1,
          }}
        >
          <GeneralParametersSection
            configStore={configStore}
            setEditState={setEditState}
            setDeleteConfirm={setDeleteConfirm}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <ComunityParameterSection
            configStore={configStore}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <YearBandSection
            configStore={configStore}
            setEditState={setEditState}
            setDeleteConfirm={setDeleteConfirm}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <PrimaryEnergyCarrierSection
            configStore={configStore}
            setEditState={setEditState}
            setDeleteConfirm={setDeleteConfirm}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <ElectricityTypesSection
            configStore={configStore}
            setEditState={setEditState}
            setDeleteConfirm={setDeleteConfirm}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <HeatingTypesSection
            configStore={configStore}
            setEditState={setEditState}
            setDeleteConfirm={setDeleteConfirm}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <HeatingSurfaceTypesSection
            configStore={configStore}
            setEditState={setEditState}
            setDeleteConfirm={setDeleteConfirm}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <EnergyEfficiencySection
            configStore={configStore}
            setEditState={setEditState}
            setDeleteConfirm={setDeleteConfirm}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <SurfaceTempResistenceSection
            configStore={configStore}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <RoofSection
            configStore={configStore}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <OgdSection
            configStore={configStore}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <OuterWallSection
            configStore={configStore}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <WindowSection
            configStore={configStore}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <UgdSection
            configStore={configStore}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <FoerderprogrammeSection
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />

          <Box sx={{ mb: 10 }} />
        </Box>
      </Box>

      <Box
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1200,
          bgcolor: "white",
          borderTop: "2px solid rgb(229, 229, 229)",
          py: 2.5,
        }}
      >
        <Box
          sx={{
            maxWidth: 1170,
            mx: "auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {!canSave && (
            <Typography color="error" variant="body2">
              {[
                ...(yearBandValidation.errors.length > 0
                  ? [
                      `Jahresbänder: ${yearBandValidation.errors.map((e) => e.error).join(", ")}`,
                    ]
                  : []),
                ...(energyClassValidation.errors.length > 0
                  ? [
                      `Energieeffizienzklassen: ${energyClassValidation.errors.map((e) => e.error).join(", ")}`,
                    ]
                  : []),
              ].join(" | ")}
            </Typography>
          )}
          <Box sx={{ ml: "auto" }}>
            <Button
              variant="contained"
              color="error"
              disabled={!canSave}
              onClick={() => setSaveDialogOpen(true)}
            >
              Speichern
            </Button>
          </Box>
        </Box>
      </Box>

      <SaveDialog
        key={String(saveDialogOpen)}
        open={saveDialogOpen}
        defaultName={selectedConfigFile}
        onClose={() => setSaveDialogOpen(false)}
        onSave={handleSaveAll}
      />

      <EditDialog
        key={String(editState.open)}
        open={editState.open}
        title={editState.title}
        fields={editState.fields}
        onClose={() => setEditState({ ...editState, open: false })}
        onSave={editState.onSave}
      />

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ open: false, onConfirm: () => {} })}
      />
    </Box>
  );
}
