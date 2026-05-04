import { ChevronRight, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Collapse,
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
import { updateRoofUValue, updateSimpleValue } from "../../../hooks/store";
import {
  formatBand,
  lookUpForNames,
  type YearBand,
} from "../../../lib/buildingTypes";

export default function RoofSection({
  configStore,
  expandedSections,
  toggleSection,
}: {
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
  configStore: ReturnType<typeof useStore>;
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
            bgcolor: "grey.100",
            cursor: "pointer",
          }}
          onClick={() => toggleSection("roof")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.roof ? <ExpandMore /> : <ChevronRight />}
            <Typography variant="h6" fontWeight="600">
              Dach
            </Typography>
          </Box>
        </Box>
        <Collapse in={expandedSections.roof}>
          <Box sx={{ p: 2 }}>
            <Typography variant="body1" fontWeight="600" mb={1.5}>
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
                value={configStore.roof.heatLossFactor}
                onChange={(e) =>
                  updateSimpleValue(
                    "roof.heatLossFactor",
                    parseFloat(e.target.value),
                  )
                }
              />

              <Typography variant="body2">Dämmschichtdicke [m]</Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.roof.assumedInsulationThickness}
                onChange={(e) =>
                  updateSimpleValue(
                    "roof.assumedInsulationThickness",
                    parseFloat(e.target.value),
                  )
                }
              />

              <Typography variant="body2">
                Wärmeleitfähigkeit λ [W/mK]
              </Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.roof.thermalConductivity}
                onChange={(e) =>
                  updateSimpleValue(
                    "roof.thermalConductivity",
                    parseFloat(e.target.value),
                  )
                }
              />

              <Typography variant="body2">
                Minderungsfaktor Zwischensparrendämmung
              </Typography>
              <TextField
                size="small"
                type="number"
                value={configStore.roof.insulationReductionFactor}
                onChange={(e) =>
                  updateSimpleValue(
                    "roof.insulationReductionFactor",
                    parseFloat(e.target.value),
                  )
                }
              />
            </Box>

            <Typography variant="body1" fontWeight="600" mb={1}>
              Pauschalwerte für den Wärmedurchgangskoeffizienten in W/(m² · K)
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
                  {configStore.roof.uValue.map(
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
                                updateRoofUValue(
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
