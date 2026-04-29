import { ChevronRight, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Checkbox,
  Collapse,
  FormControlLabel,
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
import {
  toggleAllowedBottomFloorConstructionType,
  updateBottomFloorDefaultConstructionType,
  updateBottomFloorUValue,
  updateSimpleValue,
} from "../../hooks/store";
import {
  formatBand,
  lookUpForNames,
  type YearBand,
} from "../../lib/buildingTypes";

export default function UgdSection({
  configStore,
  expandedSections,
  toggleSection,
}: {
  configStore: ReturnType<typeof useStore>;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  const yearBands = configStore.general.generalYearBands as YearBand[];

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
          onClick={() => toggleSection("bottomFloor")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.bottomFloor ? <ExpandMore /> : <ChevronRight />}
            <Typography variant="h5" fontWeight="600">
              Unterste Geschossdecke
            </Typography>
          </Box>
        </Box>
        <Collapse in={expandedSections.bottomFloor}>
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" fontWeight="600" mb={1}>
              Allgemeine Parameter
            </Typography>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 110px 1fr 110px",
                alignItems: "center",
                columnGap: 10,
                rowGap: 2,
                mb: 3,
              }}
            >
              <Typography>Wärmeverlustfaktor F</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.bottomFloor.heatLossFactor}
                onChange={(e) =>
                  updateSimpleValue(
                    "bottomFloor.heatLossFactor",
                    e.target.value,
                  )
                }
              />

              <Typography>Dämmschichtdicke [m]</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.bottomFloor.assumedInsulationThickness}
                onChange={(e) =>
                  updateSimpleValue(
                    "bottomFloor.assumedInsulationThickness",
                    e.target.value,
                  )
                }
              />

              <Typography>Wärmeleitfähigkeit λ [W/mK]</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.bottomFloor.thermalConductivity}
                onChange={(e) =>
                  updateSimpleValue(
                    "bottomFloor.thermalConductivity",
                    e.target.value,
                  )
                }
              />
            </Box>

            <Typography variant="h6" fontWeight="600" mb={1}>
              Erlaubte Konstruktionen nach beheiztem Keller
            </Typography>

            <Box sx={{ mb: 3 }}>
              {configStore.bottomFloor.allowedConstructionTypesByHeatedCellar.map(
                (
                  entry: { key: boolean; allowedValues: string[] },
                  index: number,
                ) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      gap: 2,
                      mb: 1,
                      pl: 1,
                      alignItems: "center",
                    }}
                  >
                    <Typography sx={{ minWidth: 220 }}>
                      Beheizter Keller:{" "}
                      {String(entry.key) == "true" ? "ja" : "nein"}
                    </Typography>

                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                      {configStore.bottomFloor.constructionTypes.map(
                        (ct: {
                          value: string;
                          localization: { de: string };
                        }) => (
                          <FormControlLabel
                            key={ct.value}
                            control={
                              <Checkbox
                                size="small"
                                checked={entry.allowedValues.includes(ct.value)}
                                onChange={(e) =>
                                  toggleAllowedBottomFloorConstructionType(
                                    index,
                                    ct.value,
                                    e.target.checked,
                                  )
                                }
                              />
                            }
                            label={ct.localization.de}
                          />
                        ),
                      )}
                    </Box>
                  </Box>
                ),
              )}
            </Box>

            <Typography variant="h6" fontWeight="600" mb={1}>
              Standard‑Konstruktion
            </Typography>

            <Box sx={{ mb: 3 }}>
              {configStore.bottomFloor.defaultConstructionType.map(
                (
                  group: {
                    key: boolean;
                    value: { from?: number; to?: number; value: string }[];
                  },
                  groupIndex: number,
                ) => (
                  <Box key={groupIndex} sx={{ mb: 2 }}>
                    <Typography fontWeight="500" sx={{ mb: 0.75 }}>
                      Beheizter Keller:{" "}
                      {String(group.key) == "true" ? "ja" : "nein"}
                    </Typography>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        columnGap: 10,
                        rowGap: 2,
                        pl: 2,
                      }}
                    >
                      {group.value.map(
                        (
                          band: { from?: number; to?: number; value: string },
                          bandIndex: number,
                        ) => (
                          <Box
                            key={bandIndex}
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                            }}
                          >
                            <Typography sx={{ minWidth: 120 }}>
                              Baujahr&nbsp;{formatBand(band)}
                            </Typography>
                            <TextField
                              select
                              size="small"
                              value={band.value}
                              onChange={(e) =>
                                updateBottomFloorDefaultConstructionType(
                                  groupIndex,
                                  bandIndex,
                                  e.target.value,
                                )
                              }
                              sx={{ flex: 1 }}
                            >
                              {configStore.bottomFloor.constructionTypes.map(
                                (ct: {
                                  value: string;
                                  localization: { de: string };
                                }) => (
                                  <MenuItem key={ct.value} value={ct.value}>
                                    {ct.localization.de}
                                  </MenuItem>
                                ),
                              )}
                            </TextField>
                          </Box>
                        ),
                      )}
                    </Box>
                  </Box>
                ),
              )}
            </Box>

            <Typography variant="h6" fontWeight="600" mb={1}>
              Pauschalwerte für den Wärmedurchgangskoeffizienten in W/(m² * K)
            </Typography>
            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead sx={{ "& .MuiTableCell-root": { fontWeight: "bold" } }}>
                  <TableRow>
                    <TableCell>Konstruktion \ Baualtersklasse</TableCell>
                    {yearBands.map((band, bandIndex) => (
                      <TableCell key={bandIndex} align="center">
                        {formatBand(band)}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {configStore.bottomFloor.uValue.map(
                    (
                      construction: {
                        key: string;
                        value: { value: number }[];
                      },
                      constructionIndex: number,
                    ) => (
                      <TableRow key={construction.key}>
                        <TableCell>
                          <strong>{lookUpForNames(construction.key)}</strong>
                        </TableCell>
                        {yearBands.map((_, bandIndex) => (
                          <TableCell key={bandIndex} align="center">
                            <TextField
                              size="small"
                              type="number"
                              value={construction.value[bandIndex]?.value ?? ""}
                              onChange={(e) =>
                                updateBottomFloorUValue(
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
            </TableContainer>
          </Box>
        </Collapse>
      </Paper>
    </>
  );
}
