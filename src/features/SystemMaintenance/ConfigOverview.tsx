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
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "../../components/ConfirmDeleteDialog";
import { EditDialog } from "../../components/EditDialog";
import { SaveDialog } from "../../components/SaveDialog";
import { config } from "../../hooks/store";
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
    type?: "text" | "number" | "string" | "color" | "select";
    required?: boolean;
  }>;
  onSave: (values: Record<string, string | number>) => void;
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

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

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
    } else if (configFiles.find((file) => file.value == fileName)) {
      toast.error(`Es existiert schon eine Datei mit den Namen „${fileName}" `);
    } else {
      setConfigFiles((prev) => [...prev, { value: fileName }]);
      setselectedConfigFile(fileName);
      toast.success(`Konfiguration gespeichert als „${fileName}"`);
      // Deal with new config that is contained in the nanostore
    }
  };

  const [selectedConfigFile, setselectedConfigFile] = useState<string>(
    configFiles[2]!.value,
  );

  return (
    <Box sx={{ width: "full" }}>
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
            onChange={(e) => setselectedConfigFile(e.target.value)}
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
            editState={editState}
            setEditState={setEditState}
            deleteConfirm={deleteConfirm}
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
            editState={editState}
            setEditState={setEditState}
            deleteConfirm={deleteConfirm}
            setDeleteConfirm={setDeleteConfirm}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <PrimaryEnergyCarrierSection
            configStore={configStore}
            editState={editState}
            setEditState={setEditState}
            deleteConfirm={deleteConfirm}
            setDeleteConfirm={setDeleteConfirm}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <ElectricityTypesSection
            configStore={configStore}
            editState={editState}
            setEditState={setEditState}
            deleteConfirm={deleteConfirm}
            setDeleteConfirm={setDeleteConfirm}
            expandedSections={expandedSections}
            toggleSection={toggleSection}
          />
          <HeatingTypesSection
            configStore={configStore}
            editState={editState}
            setEditState={setEditState}
            deleteConfirm={deleteConfirm}
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
            editState={editState}
            setEditState={setEditState}
            deleteConfirm={deleteConfirm}
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
          bgcolor: "#191919",
          py: 2.5,
        }}
      >
        <Box
          sx={{
            maxWidth: 1170,
            mx: "auto",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="contained"
            color="error"
            onClick={() => setSaveDialogOpen(true)}
          >
            Speichern
          </Button>
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
