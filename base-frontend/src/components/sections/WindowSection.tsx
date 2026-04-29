import { ChevronRight, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Collapse,
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
  updateSimpleValue,
  updateWindowDefaultType,
  updateWindowsUValue,
} from "../../hooks/store";
import {
  formatBand,
  lookUpForNames,
  type YearBand,
} from "../../lib/buildingTypes";

export default function WindowSection({
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
          onClick={() => toggleSection("windows")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.windows ? <ExpandMore /> : <ChevronRight />}
            <Typography variant="h6" fontWeight="600">
              Fenster
            </Typography>
          </Box>
        </Box>
        <Collapse in={expandedSections.windows}>
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" fontWeight="600" mb={1}>
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
              <Typography variant="body2">Wärmeverlustfaktor F</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.windows.roofWindowsHeatLossFactor}
                onChange={(e) =>
                  updateSimpleValue(
                    "windows.roofWindowsHeatLossFactor",
                    parseFloat(e.target.value),
                  )
                }
              />

              <Typography variant="body2">
                Wärmeverlustfaktor F – Außenwandfenster
              </Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.windows.exteriorWallWindowsHeatLossFactor}
                onChange={(e) =>
                  updateSimpleValue(
                    "windows.exteriorWallWindowsHeatLossFactor",
                    parseFloat(e.target.value),
                  )
                }
              />
            </Box>

            <Typography variant="body1" fontWeight="600" mb={1}>
              Standard‑Fenstertyp nach Baujahr
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                columnGap: 10,
                rowGap: 2,
                mb: 3,
              }}
            >
              {configStore.windows.defaultWindowType.map(
                (
                  band: { from?: number; to?: number; value: string },
                  index: number,
                ) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                  >
                    <Typography sx={{ minWidth: 120 }} variant="body2">
                      Baujahr&nbsp;{formatBand(band)}
                    </Typography>
                    <TextField
                      select
                      size="small"
                      value={band.value}
                      onChange={(e) =>
                        updateWindowDefaultType(index, e.target.value)
                      }
                      sx={{ flex: 1 }}
                    >
                      {configStore.windows.windowTypes.map(
                        (wt: {
                          value: string;
                          localization: { de: string };
                        }) => (
                          <MenuItem key={wt.value} value={wt.value}>
                            {wt.localization.de}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  </Box>
                ),
              )}
            </Box>

            <Typography variant="body1" fontWeight="600" mb={1}>
              Pauschalwerte für den Wärmedurchgangskoeffizienten in W/(m² * K)
            </Typography>

            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead
                  sx={{ "& .MuiTableCell-root": { fontWeight: "bold" } }}
                >
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
                  {configStore.windows.uValue.map(
                    (
                      windowType: {
                        key: string;
                        value: { value: number }[];
                      },
                      windowTypeIndex: number,
                    ) => (
                      <TableRow key={windowType.key}>
                        <TableCell>{lookUpForNames(windowType.key)}</TableCell>
                        {yearBands.map((_, bandIndex) => (
                          <TableCell key={bandIndex} align="center">
                            <TextField
                              size="small"
                              type="number"
                              value={windowType.value[bandIndex]?.value ?? ""}
                              onChange={(e) =>
                                updateWindowsUValue(
                                  windowTypeIndex,
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
