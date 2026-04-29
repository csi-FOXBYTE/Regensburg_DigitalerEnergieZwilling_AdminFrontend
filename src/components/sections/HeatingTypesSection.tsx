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
import { Fragment, useState } from "react";
import { toast } from "sonner";
import {
  type DeleteConfirmState,
  type EditState,
} from "../../features/ConfigOverview";
import {
  addHeatingSystemType,
  config,
  deleteHeatingSystemType,
  updateHeatingPerformanceFactor,
  updateHeatingSystemType,
  updateTemperatureControlPerformanceFactor,
} from "../../hooks/store";
import { ConfirmDeleteDialog } from "../ConfirmDeleteDialog";
import { EditDialog } from "../EditDialog";

type RangeEntry = { from?: number; to?: number };

function formatYearBand(e: RangeEntry): string {
  if (e.from != null && e.to != null) return `${e.from}–${e.to}`;
  if (e.to != null) return `bis ${e.to}`;
  if (e.from != null) return `ab ${e.from}`;
  return "alle";
}

function formatPowerRange(r: RangeEntry | null): string {
  if (r == null) return "Alle Leistungen";
  if (r.from != null && r.to != null) return `${r.from}–${r.to} kW`;
  if (r.to != null) return `≤ ${r.to} kW`;
  if (r.from != null) return `> ${r.from} kW`;
  return "";
}

function InlineNumberCell({
  value,
  onCommit,
}: {
  value: number;
  onCommit: (v: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (!editing) {
    return (
      <Box
        onClick={() => {
          setDraft(String(value));
          setEditing(true);
        }}
        sx={{
          cursor: "text",
          px: 1,
          py: 0.5,
          minWidth: 52,
          textAlign: "center",
          borderRadius: 0.5,
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        {value}
      </Box>
    );
  }

  return (
    <input
      autoFocus
      type="number"
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        const parsed = parseFloat(draft);
        if (!isNaN(parsed)) onCommit(parsed);
        setEditing(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
        if (e.key === "Escape") setEditing(false);
      }}
      style={{
        width: 68,
        textAlign: "center",
        border: "1px solid #1976d2",
        borderRadius: 4,
        padding: "2px 6px",
        fontSize: "inherit",
        outline: "none",
        background: "#fff",
      }}
    />
  );
}

const headerCellSx = {
  fontWeight: 700,
  bgcolor: "#E5E5E5",
  borderBottom: "2px solid",
  borderColor: "divider",
};

const colDividerSx = { borderRight: "1px solid", borderColor: "divider" };

export default function HeatingTypesSection({
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
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const labelOverrides: Record<string, string> = {
    standard_boiler_70_55: "Standardkessel (Öl, Gas, Holz) 70/55°C",
    low_temperature_boiler_oil_gas_70_55:
      "Niedertemperaturkessel (Öl, Gas) 70/55°C",
    condensing_boiler_70_55: "Brennwertkessel (Öl, Gas) 70/55°C",
    improved_condensing_boiler_55_45:
      "Brennwertkessel (verbessert, Öl, Gas) 55/45°C",
    district_heating_all_temperatures: "Fernwärme (alle Heizkreistemperaturen)",
  };

  const getLabel = (item: {
    value: string;
    localization: Record<string, string>;
  }) => labelOverrides[item.value] ?? item.localization.de ?? "";

  const toggleRow = (index: number) =>
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));

  const handleDeleteConfirm = (onConfirm: () => void) =>
    setDeleteConfirm({ open: true, onConfirm });

  const handleConfirmDelete = () => {
    deleteConfirm.onConfirm();
    setDeleteConfirm({ open: false, onConfirm: () => {} });
  };

  const handleAddHeatingSystemType = () => {
    setEditState({
      open: true,
      title: "Neue Heizungserzeugerart hinzufügen",
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
        addHeatingSystemType({
          value: values.de.toLowerCase().replace(/\s+/g, "_"),
          localization: { de: values.de, en: values.de },
        });
        toast.success("Heizungserzeugerart hinzugefügt");
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
        {
          key: "de",
          label: "Bezeichnung",
          value: getLabel(item),
          type: "text",
          required: true,
        },
      ],
      onSave: (values) => {
        updateHeatingSystemType(index, (draft) => {
          draft.localization.de = values.de;
          draft.localization.en = values.de;
        });
        toast.success("Heizungstyp aktualisiert");
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
          onClick={() => toggleSection("heatingSystemTypes")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.heatingSystemTypes ? (
              <ExpandMore />
            ) : (
              <ChevronRight />
            )}
            <Typography variant="h6" fontWeight="600">
              Heizungserzeugerart ({configStore.heat.heatingSystemTypes.length})
            </Typography>
          </Box>
          <Button
            variant="outlined"
            color="error"
            onClick={(e) => {
              e.stopPropagation();
              handleAddHeatingSystemType();
            }}
          >
            Neue Erzeugerart +
          </Button>
        </Box>

        <Collapse in={expandedSections.heatingSystemTypes}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography sx={{ fontWeight: "bold" }}>
                      Bezeichnung
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography sx={{ fontWeight: "bold" }}>
                      Aktionen
                    </Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configStore.heat.heatingSystemTypes.map((item, index) => {
                  const isOpen = !!expandedRows[index];

                  const perfEntry =
                    configStore.heat.heatingPerformanceFactor.find(
                      (e) => e.key === item.value,
                    );
                  const tempEntry =
                    configStore.heat.temperatureControlPerformanceFactor.find(
                      (e) => e.key === item.value,
                    );

                  const rawPowerBands = perfEntry
                    ? (perfEntry.value[0].value as RangeEntry[])
                    : [];
                  const powerCols: (RangeEntry | null)[] =
                    rawPowerBands.length === 1 ? [null] : rawPowerBands;

                  type YearPerfRow = RangeEntry & {
                    value: { value: number }[];
                  };
                  type YearTempRow = RangeEntry & {
                    value: { key: string; value: number }[];
                  };

                  const controlTypes: { key: string; value: number }[] =
                    tempEntry ? (tempEntry.value[0].value as any) : [];

                  return (
                    <Fragment key={index}>
                      <TableRow hover>
                        <TableCell sx={{ fontSize: "medium" }}>
                          <IconButton
                            size="small"
                            onClick={() => toggleRow(index)}
                          >
                            {isOpen ? <ExpandMore /> : <ChevronRight />}
                          </IconButton>
                          {getLabel(item)}
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
                                deleteHeatingSystemType(index);
                                toast.success("Heizungstyp gelöscht");
                              })
                            }
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>

                      <TableRow>
                        <TableCell
                          colSpan={5}
                          sx={{ p: 0, borderBottom: "none" }}
                        >
                          <Collapse in={isOpen} timeout="auto" unmountOnExit>
                            <Box sx={{ p: 2 }}>
                              <Typography
                                sx={{ mb: 2 }}
                                fontWeight={"bold"}
                                variant="body2"
                              >
                                Heizleistungsfaktoren (Aufwandzahl e)
                              </Typography>
                              {perfEntry ? (
                                <TableContainer
                                  component={Paper}
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    mb: 2.5,
                                  }}
                                >
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell
                                          sx={{
                                            ...headerCellSx,
                                            ...colDividerSx,
                                            minWidth: 110,
                                          }}
                                        >
                                          Baujahr
                                        </TableCell>
                                        {powerCols.map((range, i) => (
                                          <TableCell
                                            key={i}
                                            align="center"
                                            sx={{
                                              ...headerCellSx,
                                              ...(i < powerCols.length - 1
                                                ? colDividerSx
                                                : {}),
                                            }}
                                          >
                                            {formatPowerRange(range)}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {(perfEntry.value as YearPerfRow[]).map(
                                        (datedEntry, yearIndex) => (
                                          <TableRow
                                            key={yearIndex}
                                            sx={{
                                              "&:nth-of-type(even)": {
                                                bgcolor: "#F4F4F4",
                                              },
                                            }}
                                          >
                                            <TableCell
                                              sx={{
                                                ...colDividerSx,
                                                fontWeight: 500,
                                              }}
                                            >
                                              {formatYearBand(datedEntry)}
                                            </TableCell>
                                            {datedEntry.value.map(
                                              (cell, ci) => (
                                                <TableCell
                                                  key={ci}
                                                  align="center"
                                                  padding="none"
                                                  sx={
                                                    ci <
                                                    datedEntry.value.length - 1
                                                      ? colDividerSx
                                                      : {}
                                                  }
                                                >
                                                  <InlineNumberCell
                                                    value={cell.value}
                                                    onCommit={(v) =>
                                                      updateHeatingPerformanceFactor(
                                                        item.value,
                                                        yearIndex,
                                                        ci,
                                                        v,
                                                      )
                                                    }
                                                  />
                                                </TableCell>
                                              ),
                                            )}
                                          </TableRow>
                                        ),
                                      )}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  mb={2.5}
                                >
                                  Keine Daten vorhanden
                                </Typography>
                              )}
                              <Typography
                                sx={{ mb: 2 }}
                                fontWeight={"bold"}
                                variant="body2"
                              >
                                Temperaturregelungs‑Leistungsfaktoren
                              </Typography>
                              {tempEntry ? (
                                <TableContainer
                                  component={Paper}
                                  variant="outlined"
                                  sx={{ borderRadius: 1, overflow: "hidden" }}
                                >
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell
                                          sx={{
                                            ...headerCellSx,
                                            ...colDividerSx,
                                            minWidth: 110,
                                          }}
                                        >
                                          Baujahr
                                        </TableCell>
                                        {controlTypes.map((ct, ci) => (
                                          <TableCell
                                            key={ct.key}
                                            align="center"
                                            sx={{
                                              ...headerCellSx,
                                              ...(ci < controlTypes.length - 1
                                                ? colDividerSx
                                                : {}),
                                            }}
                                          >
                                            {configStore.heat.heatingSurfaceTypes.find(
                                              (ht) => ht.value === ct.key,
                                            )?.localization.de ?? ct.key}
                                          </TableCell>
                                        ))}
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {(tempEntry.value as YearTempRow[]).map(
                                        (datedEntry, yearIndex) => (
                                          <TableRow
                                            key={yearIndex}
                                            sx={{
                                              "&:nth-of-type(even)": {
                                                bgcolor: "#F4F4F4",
                                              },
                                            }}
                                          >
                                            <TableCell
                                              sx={{
                                                ...colDividerSx,
                                                fontWeight: 500,
                                              }}
                                            >
                                              {formatYearBand(datedEntry)}
                                            </TableCell>
                                            {controlTypes.map((ct, ci) => (
                                              <TableCell
                                                key={ct.key}
                                                align="center"
                                                padding="none"
                                                sx={
                                                  ci < controlTypes.length - 1
                                                    ? colDividerSx
                                                    : {}
                                                }
                                              >
                                                <InlineNumberCell
                                                  value={
                                                    datedEntry.value.find(
                                                      (v) => v.key === ct.key,
                                                    )?.value ?? 0
                                                  }
                                                  onCommit={(v) =>
                                                    updateTemperatureControlPerformanceFactor(
                                                      item.value,
                                                      yearIndex,
                                                      ct.key,
                                                      v,
                                                    )
                                                  }
                                                />
                                              </TableCell>
                                            ))}
                                          </TableRow>
                                        ),
                                      )}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              ) : (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Keine Daten vorhanden
                                </Typography>
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
