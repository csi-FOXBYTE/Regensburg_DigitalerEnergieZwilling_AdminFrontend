import {
  Box,
  MenuItem,
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
import { CollapsibleSection } from "../CollapsibleSection";
import {
  updateSimpleValue,
  updateTopFloorDefaultType,
  updateTopFloorUValue,
} from "../../../hooks/store";
import {
  formatBand,
  getValueForBand,
  lookUpForNames,
  sortBands,
  type BandEntry,
  type YearBand,
} from "../../../lib/buildingTypes";

export default function OgdSection({
  configStore,
  expandedSections,
  toggleSection,
}: {
  configStore: ReturnType<typeof useStore>;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  const yearBands = sortBands(configStore.general.generalYearBands as YearBand[]);

  return (
    <CollapsibleSection
      sectionKey="topFloor"
      title="Oberste Geschossdecke"
      expandedSections={expandedSections}
      toggleSection={toggleSection}
    >
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" fontWeight={"bold"} mb={1.5}>
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
                value={configStore.topFloor.heatLossFactor}
                onChange={(e) =>
                  updateSimpleValue("topFloor.heatLossFactor", e.target.value)
                }
              />

              <Typography variant="body2">Dämmschichtdicke [m]</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.topFloor.assumedInsulationThickness}
                onChange={(e) =>
                  updateSimpleValue(
                    "topFloor.assumedInsulationThickness",
                    e.target.value,
                  )
                }
              />

              <Typography variant="body2">
                Wärmeleitfähigkeit λ [W/mK]
              </Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.topFloor.thermalConductivity}
                onChange={(e) =>
                  updateSimpleValue(
                    "topFloor.thermalConductivity",
                    e.target.value,
                  )
                }
              />
            </Box>
            <Typography variant="body1" fontWeight={"bold"} mb={1}>
              Standard‑Deckentyp nach Baujahr
            </Typography>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                mb: 3,
              }}
            >
              {configStore.topFloor.defaultTopFloorType.map(
                (
                  band: { from?: number; to?: number; value: string },
                  bandIndex: number,
                ) => (
                  <Box
                    key={bandIndex}
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
                        updateTopFloorDefaultType(bandIndex, e.target.value)
                      }
                      sx={{ flex: 1 }}
                    >
                      {configStore.topFloor.topFloorTypes.map(
                        (type: {
                          value: string;
                          localization: { de: string };
                        }) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.localization.de}
                          </MenuItem>
                        ),
                      )}
                    </TextField>
                  </Box>
                ),
              )}
            </Box>
            <Typography variant="body1" fontWeight={"bold"} mb={1}>
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
                  {configStore.topFloor.uValue.map(
                    (
                      ceilingType: {
                        key: string;
                        value: { value: number }[];
                      },
                      ceilingIndex: number,
                    ) => (
                      <TableRow key={ceilingType.key}>
                        <TableCell>{lookUpForNames(ceilingType.key)}</TableCell>
                        {yearBands.map((band, bandIndex) => (
                          <TableCell key={bandIndex} align="center">
                            <TextField
                              size="small"
                              type="number"
                              value={getValueForBand(ceilingType.value as BandEntry[], band) ?? ""}
                              onChange={(e) =>
                                updateTopFloorUValue(
                                  ceilingIndex,
                                  band,
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
    </CollapsibleSection>
  );
}
