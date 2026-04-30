import { Add, ChevronRight, Delete, Edit, ExpandMore, OpenInNew } from "@mui/icons-material";
import {
  Autocomplete,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { DeleteConfirmState } from "../../features/ConfigOverview";
import {
  type Foerderprogramm,
  addFoerderprogramm,
  config,
  deleteFoerderprogramm,
  foerderprogramme,
  updateFoerderprogramm,
} from "../../hooks/store";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";

const EMPTY_FORM: Omit<Foerderprogramm, "id"> = {
  name: "",
  link: "",
  description: "",
  promotionType: "absolute",
  promotionAmount: 0,
  dependencies: [],
};

interface FormState extends Omit<Foerderprogramm, "id"> {}

interface FoerderprogrammDialogProps {
  open: boolean;
  initial?: Foerderprogramm;
  heatingSystemOptions: { label: string; value: string }[];
  onClose: () => void;
  onSave: (data: FormState) => void;
}

function FoerderprogrammDialog({
  open,
  initial,
  heatingSystemOptions,
  onClose,
  onSave,
}: FoerderprogrammDialogProps) {
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setForm(initial ? { ...initial } : { ...EMPTY_FORM });
      setErrors({});
    }
  }, [open, initial]);

  const set = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Name ist erforderlich";
    if (isNaN(form.promotionAmount) || form.promotionAmount < 0)
      newErrors.promotionAmount = "Ungültiger Betrag";
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(form);
    onClose();
  };

  const selectedDeps = heatingSystemOptions.filter((o) =>
    form.dependencies.includes(o.value),
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      slotProps={{
        backdrop: { sx: { bgcolor: "rgba(0,0,0,0.1)" } },
        paper: { elevation: 0, sx: { border: "1px solid rgba(0,0,0,0.12)" } },
      }}
    >
      <DialogTitle>
        {initial ? "Förderprogramm bearbeiten" : "Neues Förderprogramm"}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
          <TextField
            label="Name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            fullWidth
            error={!!errors.name}
            helperText={errors.name}
          />
          <TextField
            label="Link (optional)"
            value={form.link}
            onChange={(e) => set("link", e.target.value)}
            fullWidth
            placeholder="https://..."
          />
          <TextField
            label="Beschreibung (optional)"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            fullWidth
            multiline
            minRows={2}
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ minWidth: 160 }}>
              <InputLabel>Förderart</InputLabel>
              <Select
                label="Förderart"
                value={form.promotionType}
                onChange={(e) =>
                  set("promotionType", e.target.value as "percent" | "absolute")
                }
              >
                <MenuItem value="absolute">Absolut (€)</MenuItem>
                <MenuItem value="percent">Prozentual (%)</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label={form.promotionType === "percent" ? "Betrag (%)" : "Betrag (€)"}
              type="number"
              value={form.promotionAmount}
              onChange={(e) => set("promotionAmount", parseFloat(e.target.value) || 0)}
              fullWidth
              error={!!errors.promotionAmount}
              helperText={errors.promotionAmount}
              inputProps={{ min: 0, step: form.promotionType === "percent" ? 1 : 100 }}
            />
          </Box>
          <Autocomplete
            multiple
            options={heatingSystemOptions}
            getOptionLabel={(o) => o.label}
            value={selectedDeps}
            onChange={(_, newValue) =>
              set("dependencies", newValue.map((v) => v.value))
            }
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  label={option.label}
                  size="small"
                  {...getTagProps({ index })}
                  key={option.value}
                />
              ))
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label="Abhängigkeiten (Komponenten)"
                placeholder="Heizsystem wählen..."
              />
            )}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{ bgcolor: "#C1272D", color: "white", "&:hover": { bgcolor: "#9B1F24" } }}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function formatPromotion(f: Foerderprogramm): string {
  return f.promotionType === "percent"
    ? `${f.promotionAmount} %`
    : `${f.promotionAmount.toLocaleString("de-DE")} €`;
}

export default function FoerderprogrammeSection({
  expandedSections,
  toggleSection,
}: {
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  const programs = useStore(foerderprogramme);
  const configStore = useStore(config);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Foerderprogramm | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
    onConfirm: () => {},
  });

  const heatingSystemOptions = configStore.heat.heatingSystemTypes.map(
    (t: any) => ({
      label: t.localization?.de ?? t.value,
      value: t.value,
    }),
  );

  const openAdd = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (f: Foerderprogramm) => {
    setEditing(f);
    setDialogOpen(true);
  };

  const handleSave = (data: FormState) => {
    if (editing) {
      updateFoerderprogramm(editing.id, (draft) => Object.assign(draft, data));
      toast.success("Förderprogramm aktualisiert");
    } else {
      addFoerderprogramm({ ...data, id: crypto.randomUUID() });
      toast.success("Förderprogramm hinzugefügt");
    }
  };

  const handleDelete = (id: string) => {
    setDeleteConfirm({
      open: true,
      onConfirm: () => {
        deleteFoerderprogramm(id);
        toast.success("Förderprogramm gelöscht");
        setDeleteConfirm({ open: false, onConfirm: () => {} });
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
          onClick={() => toggleSection("foerderprogramme")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.foerderprogramme ? <ExpandMore /> : <ChevronRight />}
            <Typography variant="h6" fontWeight="600">
              Förderprogramme ({programs.length})
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              openAdd();
            }}
          >
            Neues Programm +
          </Button>
        </Box>

        <Collapse in={expandedSections.foerderprogramme}>
          {programs.length === 0 ? (
            <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
              <Typography variant="body2">
                Noch keine Förderprogramme hinterlegt.
              </Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Beschreibung</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Förderung
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Abhängigkeiten</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Aktionen
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programs.map((f) => {
                    const depLabels = f.dependencies.map(
                      (d) =>
                        heatingSystemOptions.find((o) => o.value === d)?.label ?? d,
                    );
                    return (
                      <TableRow key={f.id} hover>
                        <TableCell sx={{ fontSize: "medium" }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {f.name}
                            {f.link && (
                              <IconButton
                                size="small"
                                component="a"
                                href={f.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ p: 0.25 }}
                              >
                                <OpenInNew sx={{ fontSize: 14 }} />
                              </IconButton>
                            )}
                          </Box>
                          {f.description && (
                            <Typography variant="caption" color="text.secondary">
                              {f.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 260 }}>
                            {f.description || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 500 }}>
                          {formatPromotion(f)}
                        </TableCell>
                        <TableCell>
                          {depLabels.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              —
                            </Typography>
                          ) : (
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              {depLabels.map((label) => (
                                <Chip key={label} label={label} size="small" />
                              ))}
                            </Box>
                          )}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                          <IconButton size="small" onClick={() => openEdit(f)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDelete(f.id)}>
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Collapse>
      </Paper>

      <FoerderprogrammDialog
        open={dialogOpen}
        initial={editing}
        heatingSystemOptions={heatingSystemOptions}
        onClose={() => setDialogOpen(false)}
        onSave={handleSave}
      />

      <ConfirmDeleteDialog
        open={deleteConfirm.open}
        onConfirm={deleteConfirm.onConfirm}
        onCancel={() => setDeleteConfirm({ open: false, onConfirm: () => {} })}
      />
    </>
  );
}
