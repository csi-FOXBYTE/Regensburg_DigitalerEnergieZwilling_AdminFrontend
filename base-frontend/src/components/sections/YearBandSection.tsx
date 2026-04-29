import { ChevronRight, Delete, Edit, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Button,
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
import { toast } from "sonner";
import {
  type DeleteConfirmState,
  type EditState,
} from "../../features/ConfigOverview";
import {
  addYearBand,
  config,
  deleteYearBand,
  updateYearBand,
  type YearBandEntry,
} from "../../hooks/store";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { EditDialog } from "../EditDialog";

export function YearBandSection({
  configStore,
  editState,
  setEditState,
  deleteConfirm,
  setDeleteConfirm,
  expandedSections,
  toggleSection,
}: {
  configStore: ReturnType<typeof config.get>;
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

  const handleEditYearBand = (index: number) => {
    const item = configStore.general.generalYearBands[index] as
      | YearBandEntry
      | undefined;
    if (item === undefined) return;
    setEditState({
      open: true,
      title: "Jahresband bearbeiten",
      fields: [
        {
          key: "from",
          label: "Von Jahr",
          value: item.from ?? "",
          type: "number",
        },
        { key: "to", label: "Bis Jahr", value: item.to ?? "", type: "number" },
      ],
      onSave: (values) => {
        updateYearBand(index, (draft) => {
          draft.from = values.from || undefined;
          draft.to = values.to || undefined;
        });
        toast.success("Jahresband aktualisiert");
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

  return (
    <>
      <Paper sx={{ mb: 3, overflow: "hidden" }}>
        <Box
          sx={{
            p: 2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            bgcolor: " #F4F4F4",
            cursor: "pointer",
          }}
          onClick={() => toggleSection("yearBand")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.yearBand ? <ExpandMore /> : <ChevronRight />}
            <Typography variant="h5" fontWeight="600">
              Jahresbänder
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleAddYearBand();
            }}
          >
            Neues Jahresband +
          </Button>
        </Box>
        <Collapse in={expandedSections.yearBand}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontSize: "16px", fontWeight: "bold" }}>
                    Zeitraum
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ fontSize: "16px", fontWeight: "bold" }}
                  >
                    Aktionen
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configStore.general.generalYearBands.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontSize: "16px" }}>
                      {(() => {
                        const { from, to } = item as YearBandEntry;
                        return from == null
                          ? `bis ${to}`
                          : to == null
                            ? `ab ${from}`
                            : `von ${from} bis ${to}`;
                      })()}
                    </TableCell>
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
