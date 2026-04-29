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
  updateOuterWallDefaultConstructionType,
  updateOuterWallUValue,
  updateSimpleValue,
} from "../../hooks/store";
import {
  formatBand,
  lookUpForNames,
  type YearBand,
} from "../../lib/buildingTypes";

export default function OuterWallSection({
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
          onClick={() => toggleSection("outerWall")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.outerWall ? <ExpandMore /> : <ChevronRight />}
            <Typography variant="h5" fontWeight="600">
              Außenwand
            </Typography>
          </Box>
        </Box>

        <Collapse in={expandedSections.outerWall}>
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
                value={configStore.outerWall.heatLossFactor}
                onChange={(e) =>
                  updateSimpleValue("outerWall.heatLossFactor", e.target.value)
                }
              />

              <Typography>Dämmschichtdicke [m]</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.outerWall.assumedInsulationThickness}
                onChange={(e) =>
                  updateSimpleValue(
                    "outerWall.assumedInsulationThickness",
                    e.target.value,
                  )
                }
              />

              <Typography>Wärmeleitfähigkeit λ [W/mK]</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.outerWall.thermalConductivity}
                onChange={(e) =>
                  updateSimpleValue(
                    "outerWall.thermalConductivity",
                    e.target.value,
                  )
                }
              />
            </Box>

            <Typography variant="h6" fontWeight="600" mb={1}>
              Standard‑Konstruktion nach Baujahr
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
              {configStore.outerWall.defaultConstructionType.map(
                (
                  band: { from?: number; to?: number; value: string },
                  index: number,
                ) => (
                  <Box
                    key={index}
                    sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                  >
                    <Typography sx={{ minWidth: 120 }}>
                      Baujahr&nbsp;{formatBand(band)}
                    </Typography>
                    <TextField
                      select
                      size="small"
                      value={band.value}
                      onChange={(e) =>
                        updateOuterWallDefaultConstructionType(
                          index,
                          e.target.value,
                        )
                      }
                      sx={{ flex: 1 }}
                    >
                      {configStore.outerWall.constructionTypes.map(
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

            <Typography variant="h6" fontWeight="600" mb={1}>
              Pauschalwerte für den Wärmedurchgangskoeffizienten [W/m²K]
            </Typography>

            <TableContainer sx={{ overflowX: "auto" }}>
              <Table size="small">
                <TableHead>
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
                  {configStore.outerWall.uValue.map(
                    (
                      construction: {
                        key: string;
                        value: { value: number }[];
                      },
                      constructionIndex: number,
                    ) => (
                      <TableRow key={construction.key}>
                        <TableCell>
                          {lookUpForNames(construction.key)}
                        </TableCell>
                        {yearBands.map((_, bandIndex) => (
                          <TableCell key={bandIndex} align="center">
                            <TextField
                              size="small"
                              type="number"
                              value={construction.value[bandIndex]?.value ?? ""}
                              onChange={(e) =>
                                updateOuterWallUValue(
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
