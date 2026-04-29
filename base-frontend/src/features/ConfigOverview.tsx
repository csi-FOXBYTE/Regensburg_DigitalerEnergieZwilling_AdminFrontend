import ComunityParameterSection from "@/components/sections/ComunityParameterSection";
import HeatingSurfaceTypesSection from "@/components/sections/HeatingSurfaceTypesSection";
import HeatingTypesSection from "@/components/sections/HeatingTypesSection";
import OgdSection from "@/components/sections/OgdSection";
import OuterWallSection from "@/components/sections/OuterWallSection";
import { PrimaryEnergyCarrierSection } from "@/components/sections/PrimaryEnergyCarrierSection";
import RoofSection from "@/components/sections/RoofSection";
import SurfaceTempResistenceSection from "@/components/sections/SurfaceTempResistenceSection";
import UgdSection from "@/components/sections/UgdSection";
import WindowSection from "@/components/sections/WindowSection";
import {
  Box,
  Button,
  Container,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import { useStore } from "@nanostores/react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "../components/ConfirmDeleteDialog";
import { EditDialog } from "../components/EditDialog";
import { EnergyEfficiencySection } from "../components/sections/EnergyEfficiencySection";
import { GeneralParametersSection } from "../components/sections/GeneralParametersSection";
import { YearBandSection } from "../components/sections/YearBandSection";
import { config } from "../hooks/store";

export interface EditState {
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

  const handleSaveAll = () => {
    toast.success("Konfiguration gespeichert");
  };

  const configFiles = [
    { value: "config1.json" },
    { value: "currentconfig.json" },
    { value: "default.json" },
  ];

  const [selectedConfigFile, setselectedConfigFile] = useState<string>(
    configFiles[2]!.value,
  );

  return (
    <Container maxWidth={false} sx={{ py: 4, maxWidth: 1152 }}>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h1" component="h1" gutterBottom>
              Systempflege
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Konfiguration und Anpassung der Systemeinstellungen
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

      <Box sx={{ mb: 10 }} />

      <Box
        sx={{
          position: "fixed",
          bottom: 32,
          right: 128,
          zIndex: 1200,
        }}
      >
        <Button
          variant="contained"
          color="error"
          onClick={handleSaveAll}
          sx={{ boxShadow: 4 }}
        >
          Speichern
        </Button>
      </Box>

      <EditDialog
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
    </Container>
  );
}
