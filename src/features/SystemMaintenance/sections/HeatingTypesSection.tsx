import { Add, ChevronRight, Delete, Edit, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Button,
  Checkbox,
  Collapse,
  FormControlLabel,
  IconButton,
  TextField as MuiTextField,
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
import { CollapsibleSection } from "../CollapsibleSection";
import {
  addHeatingPerformanceFactorColumn,
  addHeatingPerformanceFactorRow,
  addHeatingSystemType,
  addTemperatureControlColumn,
  addTemperatureControlRow,
  config,
  deleteHeatingPerformanceFactorColumn,
  deleteHeatingPerformanceFactorRow,
  deleteHeatingSystemType,
  deleteTemperatureControlColumn,
  deleteTemperatureControlRow,
  type PerfFactorEntry,
  type TempControlEntry,
  updateConfig,
  updateElectricalRatio,
  updateHasInternalGains,
  updateHeatingPerformanceFactor,
  updateHeatingPerformanceFactorYearBand,
  updateHeatingSystemType,
  updateTemperatureControlPerformanceFactor,
  updateTemperatureControlYearBand,
} from "../../../hooks/store";
import { type DeleteConfirmState, type EditState } from "../ConfigOverview";

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
  return "Alle Leistungen";
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

function InlineYearBandCell({
  from,
  to,
  onCommit,
}: {
  from?: number;
  to?: number;
  onCommit: (from?: number, to?: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draftFrom, setDraftFrom] = useState("");
  const [draftTo, setDraftTo] = useState("");

  const commit = () => {
    const f = draftFrom !== "" ? Number(draftFrom) : undefined;
    const t = draftTo !== "" ? Number(draftTo) : undefined;
    onCommit(f, t);
    setEditing(false);
  };

  if (!editing) {
    return (
      <Box
        onClick={() => {
          setDraftFrom(from != null ? String(from) : "");
          setDraftTo(to != null ? String(to) : "");
          setEditing(true);
        }}
        sx={{
          cursor: "text",
          px: 1,
          py: 0.5,
          borderRadius: 0.5,
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        {formatYearBand({ from, to })}
      </Box>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: 52,
    textAlign: "center",
    border: "1px solid #1976d2",
    borderRadius: 4,
    padding: "2px 4px",
    fontSize: "inherit",
    outline: "none",
    background: "#fff",
  };

  return (
    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
      <input
        autoFocus
        type="number"
        placeholder="von"
        value={draftFrom}
        onChange={(e) => setDraftFrom(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        style={inputStyle}
      />
      <span>–</span>
      <input
        type="number"
        placeholder="bis"
        value={draftTo}
        onChange={(e) => setDraftTo(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit();
          if (e.key === "Escape") setEditing(false);
        }}
        style={inputStyle}
      />
    </Box>
  );
}

const headerCellSx = {
  fontWeight: 700,
  bgcolor: "grey.200",
  borderBottom: "2px solid",
  borderColor: "divider",
};

const colDividerSx = { borderRight: "1px solid", borderColor: "divider" };

function buildYearBand(numbers: Record<string, number>): { from?: number; to?: number } {
  return { from: numbers.from, to: numbers.to };
}

export default function HeatingTypesSection({
  configStore,
  setEditState,
  setDeleteConfirm,
  expandedSections,
  toggleSection,
}: {
  configStore: ReturnType<typeof config.get>;
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
  setDeleteConfirm: React.Dispatch<React.SetStateAction<DeleteConfirmState>>;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  const [expandedRows, setExpandedRows] = useState<Record<number, boolean>>({});

  const toggleRow = (index: number) =>
    setExpandedRows((prev) => ({ ...prev, [index]: !prev[index] }));

  const handleDeleteConfirm = (onConfirm: () => void) =>
    setDeleteConfirm({ open: true, onConfirm });

  const handleAddHeatingSystemType = () => {
    setEditState({
      open: true,
      title: "Neue Heizungserzeugerart hinzufügen",
      fields: [
        {
          key: "value",
          label: "Key (technischer Bezeichner)",
          value: "",
          type: "text",
          required: true,
        },
        {
          key: "de",
          label: "Bezeichnung (Deutsch)",
          value: "",
          type: "text",
          required: true,
        },
      ],
      onSave: (strings) => {
        addHeatingSystemType({
          value: strings.value ?? "",
          localization: { de: strings.de ?? "", en: strings.de ?? "" },
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
          key: "value",
          label: "Key (technischer Bezeichner)",
          value: item.value,
          type: "text",
          required: true,
        },
        {
          key: "de",
          label: "Bezeichnung",
          value: item.localization.de ?? "",
          type: "text",
          required: true,
        },
      ],
      onSave: (strings) => {
        const oldKey = item.value;
        const newKey = (strings.value ?? "").trim();
        const newDe = strings.de ?? "";
        if (newKey !== oldKey) {
          updateConfig((draft) => {
            const type = draft.heat.heatingSystemTypes.find(
              (t) => t.value === oldKey,
            );
            if (type) {
              type.value = newKey;
              type.localization.de = newDe;
              type.localization.en = newDe;
            }
            const perf = (
              draft.heat.heatingPerformanceFactor as PerfFactorEntry[]
            ).find((e) => e.key === oldKey);
            if (perf) perf.key = newKey;
            const temp = (
              draft.heat
                .temperatureControlPerformanceFactor as TempControlEntry[]
            ).find((e) => e.key === oldKey);
            if (temp) temp.key = newKey;
            draft.heat.allowedHeatingSystemTypesByCarrier.forEach((carrier) => {
              const idx = carrier.allowedValues.indexOf(oldKey);
              if (idx >= 0) carrier.allowedValues[idx] = newKey;
            });
            const ratio = draft.heat.electricalRatio.find(
              (e) => e.key === oldKey,
            );
            if (ratio) ratio.key = newKey;
            const gains = draft.heat.hasInternalGains.find(
              (e) => e.key === oldKey,
            );
            if (gains) gains.key = newKey;
            draft.heat.defaultHeatingSystemType.forEach((entry) => {
              if (entry.value === oldKey) entry.value = newKey;
            });
          });
        } else {
          updateHeatingSystemType(index, (draft) => {
            draft.localization.de = newDe;
            draft.localization.en = newDe;
          });
        }
        toast.success("Heizungstyp aktualisiert");
      },
    });
  };

  const openAddRowDialog = (itemValue: string, isPerf: boolean) => {
    setEditState({
      open: true,
      title: "Zeile hinzufügen",
      fields: [
        {
          key: "from",
          label: "Baujahr von (optional)",
          value: "",
          type: "number",
        },
        {
          key: "to",
          label: "Baujahr bis (optional)",
          value: "",
          type: "number",
        },
      ],
      onSave: (_, numbers) => {
        const band = buildYearBand(numbers);
        if (isPerf) addHeatingPerformanceFactorRow(itemValue, band);
        else addTemperatureControlRow(itemValue, band);
      },
    });
  };

  const openAddPerfColumnDialog = (itemValue: string) => {
    setEditState({
      open: true,
      title: "Leistungsstufe hinzufügen",
      fields: [
        { key: "from", label: "Von kW (optional)", value: "", type: "number" },
        { key: "to", label: "Bis kW (optional)", value: "", type: "number" },
      ],
      onSave: (_, numbers) => {
        addHeatingPerformanceFactorColumn(itemValue, buildYearBand(numbers));
      },
    });
  };

  const openAddTempColumnDialog = (
    itemValue: string,
    existingKeys: string[],
  ) => {
    const available = configStore.heat.heatingSurfaceTypes
      .filter((ht) => !existingKeys.includes(ht.value))
      .map((ht) => ({ label: ht.localization.de, value: ht.value }));
    if (available.length === 0) return;
    setEditState({
      open: true,
      title: "Heizfläche hinzufügen",
      fields: [
        {
          key: "controlKey",
          label: "Heizfläche",
          value: available[0]?.value ?? "",
          type: "select",
          required: true,
        },
      ],
      onSave: (strings) => {
        addTemperatureControlColumn(itemValue, strings.controlKey ?? "");
      },
    });
  };

  return (
    <CollapsibleSection
      sectionKey="heatingSystemTypes"
      title={`Heizungserzeugerart (${configStore.heat.heatingSystemTypes.length})`}
      expandedSections={expandedSections}
      toggleSection={toggleSection}
      action={
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
      }
    >
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
                    tempEntry
                      ? ((tempEntry.value[0]?.value as {
                          key: string;
                          value: number;
                        }[]) ?? [])
                      : [];

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
                                sx={{ mb: 1.5 }}
                                fontWeight="bold"
                                variant="body2"
                              >
                                Heizleistungsfaktoren (Aufwandzahl e)
                              </Typography>
                              {perfEntry && perfEntry.value.length > 0 ? (
                                <TableContainer
                                  component={Paper}
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    mb: 0.5,
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
                                          Baualtersklasse
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
                                              "& .col-del": {
                                                opacity: 0,
                                                transition: "opacity 0.15s",
                                              },
                                              "&:hover .col-del": {
                                                opacity: 1,
                                              },
                                            }}
                                          >
                                            <Box
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 0.5,
                                              }}
                                            >
                                              {formatPowerRange(range)}
                                              {powerCols.length > 1 && (
                                                <IconButton
                                                  className="col-del"
                                                  size="small"
                                                  onClick={() =>
                                                    deleteHeatingPerformanceFactorColumn(
                                                      item.value,
                                                      i,
                                                    )
                                                  }
                                                  sx={{ p: 0 }}
                                                >
                                                  <Delete
                                                    sx={{ fontSize: 14 }}
                                                  />
                                                </IconButton>
                                              )}
                                            </Box>
                                          </TableCell>
                                        ))}
                                        <TableCell
                                          sx={{ ...headerCellSx }}
                                          padding="none"
                                          align="center"
                                          width={36}
                                        >
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              openAddPerfColumnDialog(
                                                item.value,
                                              )
                                            }
                                          >
                                            <Add fontSize="small" />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {(perfEntry.value as YearPerfRow[]).map(
                                        (datedEntry, yearIndex) => (
                                          <TableRow
                                            key={yearIndex}
                                            sx={{
                                              "&:nth-of-type(even)": {
                                                bgcolor: "grey.100",
                                              },
                                            }}
                                          >
                                            <TableCell
                                              sx={{
                                                ...colDividerSx,
                                                fontWeight: 500,
                                              }}
                                            >
                                              {perfEntry.value.length === 1 ? (
                                                "alle"
                                              ) : (
                                                <InlineYearBandCell
                                                  from={datedEntry.from}
                                                  to={datedEntry.to}
                                                  onCommit={(f, t) =>
                                                    updateHeatingPerformanceFactorYearBand(
                                                      item.value,
                                                      yearIndex,
                                                      f,
                                                      t,
                                                    )
                                                  }
                                                />
                                              )}
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
                                            <TableCell
                                              padding="none"
                                              align="center"
                                            >
                                              {perfEntry.value.length > 1 && (
                                                <IconButton
                                                  size="small"
                                                  onClick={() =>
                                                    deleteHeatingPerformanceFactorRow(
                                                      item.value,
                                                      yearIndex,
                                                    )
                                                  }
                                                >
                                                  <Delete fontSize="small" />
                                                </IconButton>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        ),
                                      )}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              ) : null}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <Button
                                  size="small"
                                  startIcon={<Add />}
                                  onClick={() =>
                                    openAddRowDialog(item.value, true)
                                  }
                                  sx={{
                                    "&:hover": {
                                      backgroundColor: "transparent",
                                    },
                                    cursor: "pointer",
                                  }}
                                >
                                  <Typography variant="body2">
                                    Zeile hinzufügen
                                  </Typography>
                                </Button>
                              </Box>
                              <Typography
                                sx={{ mb: 1.5 }}
                                fontWeight="bold"
                                variant="body2"
                              >
                                Temperaturregelungs‑Leistungsfaktoren
                              </Typography>
                              {tempEntry && tempEntry.value.length > 0 ? (
                                <TableContainer
                                  component={Paper}
                                  variant="outlined"
                                  sx={{
                                    borderRadius: 1,
                                    overflow: "hidden",
                                    mb: 0.5,
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
                                          Baualtersklasse
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
                                              "& .col-del": {
                                                opacity: 0,
                                                transition: "opacity 0.15s",
                                              },
                                              "&:hover .col-del": {
                                                opacity: 1,
                                              },
                                            }}
                                          >
                                            <Box
                                              sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 0.5,
                                              }}
                                            >
                                              {configStore.heat.heatingSurfaceTypes.find(
                                                (ht) => ht.value === ct.key,
                                              )?.localization.de ?? ct.key}
                                              {controlTypes.length > 1 && (
                                                <IconButton
                                                  className="col-del"
                                                  size="small"
                                                  onClick={() =>
                                                    deleteTemperatureControlColumn(
                                                      item.value,
                                                      ct.key,
                                                    )
                                                  }
                                                  sx={{ p: 0 }}
                                                >
                                                  <Delete
                                                    sx={{ fontSize: 14 }}
                                                  />
                                                </IconButton>
                                              )}
                                            </Box>
                                          </TableCell>
                                        ))}
                                        <TableCell
                                          sx={{ ...headerCellSx }}
                                          padding="none"
                                          align="center"
                                          width={36}
                                        >
                                          <IconButton
                                            size="small"
                                            onClick={() =>
                                              openAddTempColumnDialog(
                                                item.value,
                                                controlTypes.map(
                                                  (ct) => ct.key,
                                                ),
                                              )
                                            }
                                          >
                                            <Add fontSize="small" />
                                          </IconButton>
                                        </TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {(tempEntry.value as YearTempRow[]).map(
                                        (datedEntry, yearIndex) => (
                                          <TableRow
                                            key={yearIndex}
                                            sx={{
                                              "&:nth-of-type(even)": {
                                                bgcolor: "grey.100",
                                              },
                                            }}
                                          >
                                            <TableCell
                                              sx={{
                                                ...colDividerSx,
                                                fontWeight: 500,
                                              }}
                                            >
                                              {tempEntry.value.length === 1 ? (
                                                "alle"
                                              ) : (
                                                <InlineYearBandCell
                                                  from={datedEntry.from}
                                                  to={datedEntry.to}
                                                  onCommit={(f, t) =>
                                                    updateTemperatureControlYearBand(
                                                      item.value,
                                                      yearIndex,
                                                      f,
                                                      t,
                                                    )
                                                  }
                                                />
                                              )}
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
                                            <TableCell
                                              padding="none"
                                              align="center"
                                            >
                                              {tempEntry.value.length > 1 && (
                                                <IconButton
                                                  size="small"
                                                  onClick={() =>
                                                    deleteTemperatureControlRow(
                                                      item.value,
                                                      yearIndex,
                                                    )
                                                  }
                                                >
                                                  <Delete fontSize="small" />
                                                </IconButton>
                                              )}
                                            </TableCell>
                                          </TableRow>
                                        ),
                                      )}
                                    </TableBody>
                                  </Table>
                                </TableContainer>
                              ) : null}
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <Button
                                  size="small"
                                  startIcon={<Add />}
                                  onClick={() =>
                                    openAddRowDialog(item.value, false)
                                  }
                                  sx={{
                                    "&:hover": {
                                      backgroundColor: "transparent",
                                    },
                                    cursor: "pointer",
                                  }}
                                >
                                  <Typography variant="body2">
                                    Zeile hinzufügen
                                  </Typography>
                                </Button>
                              </Box>

                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 3,
                                }}
                              >
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                  }}
                                >
                                  <Typography variant="body2">
                                    Stromanteil
                                  </Typography>
                                  <MuiTextField
                                    size="small"
                                    type="number"
                                    value={
                                      configStore.heat.electricalRatio.find(
                                        (e) => e.key === item.value,
                                      )?.value ?? 0
                                    }
                                    onChange={(e) =>
                                      updateElectricalRatio(
                                        item.value,
                                        parseFloat(e.target.value),
                                      )
                                    }
                                    inputProps={{ min: 0, max: 1, step: 0.01 }}
                                    sx={{ width: 100 }}
                                  />
                                </Box>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      size="small"
                                      checked={
                                        !!configStore.heat.hasInternalGains.find(
                                          (e) => e.key === item.value,
                                        )?.value
                                      }
                                      onChange={(e) =>
                                        updateHasInternalGains(
                                          item.value,
                                          e.target.checked,
                                        )
                                      }
                                    />
                                  }
                                  label={
                                    <Typography variant="body2">
                                      Interne Wärmegewinne
                                    </Typography>
                                  }
                                />
                              </Box>
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
    </CollapsibleSection>
  );
}
