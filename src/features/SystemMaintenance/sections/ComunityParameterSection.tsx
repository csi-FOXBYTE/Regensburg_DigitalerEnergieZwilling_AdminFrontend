import { ChevronRight, ExpandMore } from "@mui/icons-material";
import {
  Box,
  Collapse,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { config, updateSimpleValue } from "../../../hooks/store";

export default function ComunityParameterSection({
  configStore,
  expandedSections,
  toggleSection,
}: {
  configStore: ReturnType<typeof config.get>;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  return (
    <Paper sx={{ overflow: "hidden", mb: 2 }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: " #F4F4F4",
          cursor: "pointer",
        }}
        onClick={() => toggleSection("communityParams")}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {expandedSections.communityParams ? <ExpandMore /> : <ChevronRight />}
          <Typography variant="h6" fontWeight="600">
            Kommunale Parameter
          </Typography>
        </Box>
      </Box>

      <Collapse in={expandedSections.communityParams}>
        <Box sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="600" mb={1}>
            Standard‑Auswahl
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 200px 2rem 1fr 200px",
              gap: 1.5,
              alignItems: "center",
              mb: 3,
            }}
          >
            <Typography>Primärenergieträger</Typography>
            <Tooltip
              title={
                configStore.heat.primaryEnergyCarriers.find(
                  (c) =>
                    c.value === configStore.heat.defaultPrimaryEnergyCarrier,
                )?.localization.de ?? ""
              }
              placement="top"
              arrow
              slotProps={{ tooltip: { sx: { fontSize: "0.85rem" } } }}
            >
              <TextField
                select
                size="small"
                value={configStore.heat.defaultPrimaryEnergyCarrier}
                onChange={(e) =>
                  updateSimpleValue(
                    "heat.defaultPrimaryEnergyCarrier",
                    e.target.value,
                  )
                }
              >
                {configStore.heat.primaryEnergyCarriers.map((carrier) => (
                  <MenuItem key={carrier.value} value={carrier.value}>
                    {carrier.localization.de}
                  </MenuItem>
                ))}
              </TextField>
            </Tooltip>

            <Box />

            <Typography>Heizung Erzeugerart</Typography>
            <Tooltip
              title={
                configStore.heat.heatingSystemTypes.find(
                  (t) => t.value === configStore.heat.defaultHeatingSystemType,
                )?.localization.de ?? ""
              }
              placement="top"
              arrow
              slotProps={{ tooltip: { sx: { fontSize: "0.85rem" } } }}
            >
              <TextField
                select
                size="small"
                value={configStore.heat.defaultHeatingSystemType}
                onChange={(e) =>
                  updateSimpleValue(
                    "heat.defaultHeatingSystemType",
                    e.target.value,
                  )
                }
              >
                {configStore.heat.heatingSystemTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.localization.de}
                  </MenuItem>
                ))}
              </TextField>
            </Tooltip>

            <Typography>Heizflächenart</Typography>
            <Tooltip
              title={
                configStore.heat.heatingSurfaceTypes.find(
                  (t) => t.value === configStore.heat.defaultHeatingSurfaceType,
                )?.localization.de ?? ""
              }
              placement="top"
              arrow
              slotProps={{ tooltip: { sx: { fontSize: "0.85rem" } } }}
            >
              <TextField
                select
                size="small"
                value={configStore.heat.defaultHeatingSurfaceType}
                onChange={(e) =>
                  updateSimpleValue(
                    "heat.defaultHeatingSurfaceType",
                    e.target.value,
                  )
                }
              >
                {configStore.heat.heatingSurfaceTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.localization.de}
                  </MenuItem>
                ))}
              </TextField>
            </Tooltip>

            <Box />
            <Box />
            <Box />
          </Box>

          <Typography variant="subtitle1" fontWeight="600" mb={1}>
            Energetische Kennwerte
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr 200px 2rem 1fr 200px",
              gap: 1.5,
              alignItems: "center",
            }}
          >
            <Typography>Heizgradtage [HDD]</Typography>
            <TextField
              size="small"
              type="number"
              value={configStore.heat.heatingDegreeDays}
              onChange={(e) =>
                updateSimpleValue(
                  "heat.heatingDegreeDays",
                  parseFloat(e.target.value),
                )
              }
            />

            <Box />

            <Typography>
              Warmwasserbedarf [kWh/m<sup>2</sup>a]
            </Typography>
            <TextField
              size="small"
              type="number"
              inputProps={{ step: 0.1 }}
              value={configStore.heat.hotWaterEnergyDemandFromAreaFactor}
              onChange={(e) =>
                updateSimpleValue(
                  "heat.hotWaterEnergyDemandFromAreaFactor",
                  parseFloat(e.target.value),
                )
              }
            />

            <Box />
            <Box />
            <Box />
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
}
