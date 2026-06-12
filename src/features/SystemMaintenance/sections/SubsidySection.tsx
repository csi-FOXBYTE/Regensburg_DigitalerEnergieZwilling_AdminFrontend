import {
  BoldItalicUnderlineToggles,
  ListsToggle,
  MDXEditor,
  UndoRedo,
  headingsPlugin,
  listsPlugin,
  markdownShortcutPlugin,
  quotePlugin,
  thematicBreakPlugin,
  toolbarPlugin,
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";
import { Delete, Edit, OpenInNew } from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import type {
  Subsidy,
  SubsidyBenefit,
} from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import { useStore } from "@nanostores/react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "../../../components/ConfirmDeleteDialog";
import {
  addFoerderprogramm,
  deleteFoerderprogramm,
  foerderprogramme,
  updateFoerderprogramm,
  type SubsidyWrapper,
} from "../../../hooks/store";
import { CollapsibleSection } from "../CollapsibleSection";
import type { DeleteConfirmState } from "../ConfigOverview";

type BenefitType = "range" | "upTo" | "exactly";

type FormState = {
  title: string;
  content: string;
  href: string;
  benefitType: BenefitType;
  benefitUnit: string;
  benefitFor: string;
  benefitValue: number;
  benefitFrom: number;
  benefitTo: number;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  title: "",
  content: "",
  href: "",
  benefitType: "exactly",
  benefitUnit: "€",
  benefitFor: "",
  benefitValue: 0,
  benefitFrom: 0,
  benefitTo: 0,
  isActive: true,
};

function toWrapper(form: FormState): SubsidyWrapper {
  const base = {
    unit: form.benefitUnit,
    ...(form.benefitFor ? { for: form.benefitFor } : {}),
  };
  const benefits: SubsidyBenefit =
    form.benefitType === "range"
      ? { ...base, type: "range", from: form.benefitFrom, to: form.benefitTo }
      : { ...base, type: form.benefitType, value: form.benefitValue };
  return {
    subsidy: { title: form.title, content: form.content, href: form.href, benefits },
    isActive: form.isActive,
  };
}

function fromWrapper(w: SubsidyWrapper): FormState {
  const s = w.subsidy;
  const b = s.benefits;
  return {
    title: s.title,
    content: s.content,
    href: s.href,
    benefitType: b.type,
    benefitUnit: b.unit,
    benefitFor: b.for ?? "",
    benefitValue: b.type !== "range" ? b.value : 0,
    benefitFrom: b.type === "range" ? b.from : 0,
    benefitTo: b.type === "range" ? b.to : 0,
    isActive: w.isActive,
  };
}

interface FoerderprogrammDialogProps {
  open: boolean;
  initial?: SubsidyWrapper;
  onClose: () => void;
  onSave: (data: SubsidyWrapper) => void;
}

function FoerderprogrammDialog({
  open,
  initial,
  onClose,
  onSave,
}: FoerderprogrammDialogProps) {
  const [form, setFormState] = useState<FormState>(
    initial ? fromWrapper(initial) : { ...EMPTY_FORM },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) newErrors.title = "Name ist erforderlich";
    if (!form.benefitUnit.trim()) newErrors.benefitUnit = "Einheit ist erforderlich";
    if (form.benefitType === "range") {
      if (isNaN(form.benefitFrom) || form.benefitFrom < 0)
        newErrors.benefitFrom = "Ungültiger Wert";
      if (isNaN(form.benefitTo) || form.benefitTo < 0)
        newErrors.benefitTo = "Ungültiger Wert";
    } else {
      if (isNaN(form.benefitValue) || form.benefitValue < 0)
        newErrors.benefitValue = "Ungültiger Betrag";
    }
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSave(toWrapper(form));
    onClose();
  };

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
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                color="error"
              />
            }
            label="Aktiv"
          />
          <TextField
            label="Name"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            fullWidth
            error={!!errors.title}
            helperText={errors.title}
          />
          <TextField
            label="Link (optional)"
            value={form.href}
            onChange={(e) => set("href", e.target.value)}
            fullWidth
            placeholder="https://..."
          />
          <Box sx={{ display: "flex", gap: 2 }}>
            <FormControl sx={{ minWidth: 140 }}>
              <InputLabel>Förderart</InputLabel>
              <Select
                label="Förderart"
                value={form.benefitType}
                onChange={(e) =>
                  set("benefitType", e.target.value as BenefitType)
                }
              >
                <MenuItem value="exactly">Genau</MenuItem>
                <MenuItem value="upTo">Bis zu</MenuItem>
                <MenuItem value="range">Bereich</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Einheit"
              value={form.benefitUnit}
              onChange={(e) => set("benefitUnit", e.target.value)}
              sx={{ width: 100 }}
              placeholder="€ / %"
              error={!!errors.benefitUnit}
              helperText={errors.benefitUnit}
            />
            {form.benefitType === "range" ? (
              <>
                <TextField
                  label="Von"
                  type="number"
                  value={form.benefitFrom || ""}
                  onChange={(e) =>
                    set(
                      "benefitFrom",
                      e.target.value === "" ? 0 : parseFloat(e.target.value),
                    )
                  }
                  fullWidth
                  error={!!errors.benefitFrom}
                  helperText={errors.benefitFrom}
                  slotProps={{ htmlInput: { min: 0 } }}
                />
                <TextField
                  label="Bis"
                  type="number"
                  value={form.benefitTo || ""}
                  onChange={(e) =>
                    set(
                      "benefitTo",
                      e.target.value === "" ? 0 : parseFloat(e.target.value),
                    )
                  }
                  fullWidth
                  error={!!errors.benefitTo}
                  helperText={errors.benefitTo}
                  slotProps={{ htmlInput: { min: 0 } }}
                />
              </>
            ) : (
              <TextField
                label="Betrag"
                type="number"
                value={form.benefitValue || ""}
                onChange={(e) =>
                  set(
                    "benefitValue",
                    e.target.value === "" ? 0 : parseFloat(e.target.value),
                  )
                }
                fullWidth
                error={!!errors.benefitValue}
                helperText={errors.benefitValue}
                slotProps={{ htmlInput: { min: 0 } }}
              />
            )}
          </Box>
          <TextField
            label="Hinweis (optional)"
            value={form.benefitFor}
            onChange={(e) => set("benefitFor", e.target.value)}
            fullWidth
            placeholder="z. B. max. 37.500 €"
          />
          <Box
            sx={{
              border: "1px solid rgba(0,0,0,0.23)",
              borderRadius: 1,
              overflow: "hidden",
              "&:hover": { borderColor: "rgba(0,0,0,0.87)" },
            }}
          >
            <Typography
              variant="caption"
              sx={{
                px: 1.75,
                pt: 0.75,
                pb: 0,
                display: "block",
                color: "text.secondary",
              }}
            >
              Beschreibung (optional)
            </Typography>
            <MDXEditor
              key={`desc-${open}-${initial?.subsidy.title ?? "new"}`}
              markdown={form.content ?? ""}
              onChange={(val) => set("content", val)}
              contentEditableClassName="mdx-editor-content"
              plugins={[
                headingsPlugin(),
                listsPlugin(),
                quotePlugin(),
                thematicBreakPlugin(),
                markdownShortcutPlugin(),
                toolbarPlugin({
                  toolbarContents: () => (
                    <>
                      <UndoRedo />
                      <BoldItalicUnderlineToggles />
                      <ListsToggle />
                    </>
                  ),
                }),
              ]}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">
          Abbrechen
        </Button>
        <Button onClick={handleSave} variant="contained" color="error">
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function formatPromotion(f: Subsidy): string {
  const b = f.benefits;
  if (b.type === "range") {
    return `${b.from.toLocaleString("de-DE")}–${b.to.toLocaleString("de-DE")} ${b.unit}`;
  }
  const prefix = b.type === "upTo" ? "bis " : "";
  return `${prefix}${b.value.toLocaleString("de-DE")} ${b.unit}`;
}

export default function FoerderprogrammeSection({
  expandedSections,
  toggleSection,
}: {
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  const programs = useStore(foerderprogramme);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SubsidyWrapper | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
    onConfirm: () => {},
  });

  const openAdd = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (w: SubsidyWrapper) => {
    setEditing(w);
    setDialogOpen(true);
  };

  const handleSave = (data: SubsidyWrapper) => {
    if (editing) {
      updateFoerderprogramm(editing.subsidy.title, (draft) =>
        Object.assign(draft, data),
      );
      toast.success("Förderprogramm aktualisiert");
    } else {
      addFoerderprogramm(data);
      toast.success("Förderprogramm hinzugefügt");
    }
  };

  const handleDelete = (title: string) => {
    setDeleteConfirm({
      open: true,
      onConfirm: () => {
        deleteFoerderprogramm(title);
        toast.success("Förderprogramm gelöscht");
        setDeleteConfirm({ open: false, onConfirm: () => {} });
      },
    });
  };

  return (
    <>
      <CollapsibleSection
        sectionKey="foerderprogramme"
        title={`Förderprogramme (${programs.length})`}
        expandedSections={expandedSections}
        toggleSection={toggleSection}
        action={
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
        }
      >
        {programs.length === 0 ? (
          <Box sx={{ p: 3, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body1">
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
                  <TableCell sx={{ fontWeight: 700 }} align="center">
                    Status
                  </TableCell>
                  <TableCell sx={{ fontWeight: 700 }} align="right">
                    Aktionen
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {programs.map((w) => (
                  <TableRow key={w.subsidy.title} hover>
                    <TableCell sx={{ fontSize: "medium" }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        {w.subsidy.title}
                        {w.subsidy.href && (
                          <IconButton
                            size="small"
                            component="a"
                            href={w.subsidy.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ p: 0.25 }}
                          >
                            <OpenInNew sx={{ fontSize: 14 }} />
                          </IconButton>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        noWrap
                        sx={{ maxWidth: 260 }}
                      >
                        {w.subsidy.content || "—"}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{ whiteSpace: "nowrap", fontWeight: 500 }}
                    >
                      {formatPromotion(w.subsidy)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={w.isActive ? "Aktiv" : "Inaktiv"}
                        color={w.isActive ? "success" : "default"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                      <IconButton size="small" onClick={() => openEdit(w)}>
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(w.subsidy.title)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </CollapsibleSection>

      <FoerderprogrammDialog
        key={dialogOpen ? (editing?.subsidy.title ?? "new") : "closed"}
        open={dialogOpen}
        initial={editing}
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
