import { HeatFlowDirection } from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
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
import {
  updateInnerSurfaceThermalResistance,
  updateOuterSurfaceThermalResistance,
} from "../../hooks/store";

export default function SurfaceTempResistenceSection({
  configStore,
  expandedSections,
  toggleSection,
}: {
  configStore: ReturnType<typeof useStore>;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  const lookUpHeatFlowEnum = (key: HeatFlowDirection) => {
    const lookUpTable: Record<HeatFlowDirection, string> = {
      [HeatFlowDirection.UPWARD]: "Aufwärts",
      [HeatFlowDirection.DOWNWARD]: "Abwärts",
      [HeatFlowDirection.HORIZONTAL]: "Horinzontal",
    };
    return lookUpTable[key];
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
          }}
          onClick={() => toggleSection("surfaceTempResistence")}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {expandedSections.surfaceTempResistence ? (
              <ExpandMore />
            ) : (
              <ChevronRight />
            )}
            <Typography variant="h6" fontWeight="600">
              Wärmeübergangswiderstände
            </Typography>
          </Box>
        </Box>
        <Collapse in={expandedSections.surfaceTempResistence}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>
                    Wärmeflussrichtung
                  </TableCell>
                  {(
                    configStore.heat.innerSurfaceThermalResistance as {
                      key: HeatFlowDirection;
                      value: number;
                    }[]
                  ).map((entry) => (
                    <TableCell
                      key={entry.key}
                      align="center"
                      sx={{ fontWeight: 700 }}
                    >
                      {lookUpHeatFlowEnum(entry.key)}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                <TableRow hover>
                  <TableCell>
                    Innen (R<sub>si</sub>)
                  </TableCell>
                  {(
                    configStore.heat.innerSurfaceThermalResistance as {
                      key: HeatFlowDirection;
                      value: number;
                    }[]
                  ).map((innerEntry) => (
                    <TableCell key={innerEntry.key} align="center">
                      <TextField
                        size="small"
                        type="number"
                        value={innerEntry.value}
                        onChange={(e) =>
                          updateInnerSurfaceThermalResistance(
                            innerEntry.key,
                            parseFloat(e.target.value),
                          )
                        }
                        sx={{ width: 90 }}
                      />
                    </TableCell>
                  ))}
                </TableRow>

                <TableRow hover>
                  <TableCell>
                    Außen (R<sub>se</sub>)
                  </TableCell>
                  {(
                    configStore.heat.innerSurfaceThermalResistance as {
                      key: HeatFlowDirection;
                      value: number;
                    }[]
                  ).map((innerEntry) => {
                    const outerEntry = (
                      configStore.heat.outerSurfaceThermalResistance as {
                        key: HeatFlowDirection;
                        value: number;
                      }[]
                    ).find((o) => o.key === innerEntry.key);
                    return (
                      <TableCell key={innerEntry.key} align="center">
                        <TextField
                          size="small"
                          type="number"
                          value={outerEntry?.value ?? ""}
                          onChange={(e) =>
                            updateOuterSurfaceThermalResistance(
                              innerEntry.key,
                              parseFloat(e.target.value),
                            )
                          }
                          sx={{ width: 90 }}
                        />
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Collapse>
      </Paper>
    </>
  );
}
