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
import {
  ChevronRight,
  Delete,
  Edit,
  ExpandMore,
  OpenInNew,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
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
import { useStore } from "@nanostores/react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "../../../components/ConfirmDeleteDialog";
import {
  type Foerderprogramm,
  addFoerderprogramm,
  deleteFoerderprogramm,
  foerderprogramme,
  updateFoerderprogramm,
} from "../../../hooks/store";
import type { DeleteConfirmState } from "../ConfigOverview";

const EMPTY_FORM: Omit<Foerderprogramm, "id"> = {
  name: "",
  promotionType: "absolute",
  promotionAmount: 0,
  maxPromotionAmount: 0,
  isActive: false,
  description: "",
};

interface FoerderprogrammDialogProps {
  open: boolean;
  initial?: Foerderprogramm;
  onClose: () => void;
  onSave: (data: Omit<Foerderprogramm, "id">) => void;
}

function FoerderprogrammDialog({
  open,
  initial,
  onClose,
  onSave,
}: FoerderprogrammDialogProps) {
  const [form, setForm] = useState<Omit<Foerderprogramm, "id">>(
    initial ? { ...initial } : { ...EMPTY_FORM },
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = (
    key: keyof Omit<Foerderprogramm, "id">,
    value: Omit<Foerderprogramm, "id">[keyof Omit<Foerderprogramm, "id">],
  ) => {
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
              label={
                form.promotionType === "percent" ? "Betrag (%)" : "Betrag (€)"
              }
              type="number"
              value={form.promotionAmount}
              onChange={(e) =>
                set("promotionAmount", parseFloat(e.target.value) || 0)
              }
              fullWidth
              error={!!errors.promotionAmount}
              helperText={errors.promotionAmount}
              inputProps={{
                min: 0,
                step: form.promotionType === "percent" ? 1 : 100,
              }}
            />
            <TextField
              label={"Max. Betrag (€)"}
              type="number"
              value={form.maxPromotionAmount}
              onChange={(e) =>
                set("maxPromotionAmount", parseFloat(e.target.value) || 0)
              }
              fullWidth
              error={!!errors.maxPromotionAmount}
              helperText={errors.maxPromotionAmount}
              inputProps={{
                min: 0,
                step: form.promotionType === "percent" ? 1 : 100,
              }}
            />
          </Box>
          <FormControlLabel
            control={
              <Switch
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
              />
            }
            label="Aktiv"
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
              key={`desc-${open}-${initial?.id ?? "new"}`}
              markdown={form.description ?? ""}
              onChange={(val) => set("description", val)}
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

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Foerderprogramm | undefined>();
  const [deleteConfirm, setDeleteConfirm] = useState<DeleteConfirmState>({
    open: false,
    onConfirm: () => {},
  });

  const openAdd = () => {
    setEditing(undefined);
    setDialogOpen(true);
  };

  const openEdit = (f: Foerderprogramm) => {
    setEditing(f);
    setDialogOpen(true);
  };

  const handleSave = (data: Omit<Foerderprogramm, "id">) => {
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
            borderBottom: "2px solid #e30613",
            cursor: "pointer",
          }}
          onClick={() => toggleSection("foerderprogramme")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.foerderprogramme ? (
              <ExpandMore />
            ) : (
              <ChevronRight />
            )}
            <Typography variant="h3">
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
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Förderung
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">
                      Aktionen
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {programs.map((f) => {
                    return (
                      <TableRow key={f.id} hover>
                        <TableCell sx={{ fontSize: "medium" }}>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
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
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ maxWidth: 260 }}
                          >
                            {f.description || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={f.isActive ? "Aktiv" : "Inaktiv"}
                            size="small"
                            color={f.isActive ? "success" : "default"}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ whiteSpace: "nowrap", fontWeight: 500 }}
                        >
                          {formatPromotion(f)}
                        </TableCell>
                        <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                          <IconButton size="small" onClick={() => openEdit(f)}>
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(f.id)}
                          >
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
        key={dialogOpen ? (editing?.id ?? "new") : "closed"}
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
