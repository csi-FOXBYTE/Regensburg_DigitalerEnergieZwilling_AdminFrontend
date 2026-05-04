import { SearchRounded, SortRounded } from "@mui/icons-material";
import HistoryIcon from "@mui/icons-material/History";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useDebounce } from "../../../hooks/useDebounce";

const PAGE_SIZE_OPTIONS = [10, 15, 20, 25, 35, 50, 100];

export function FiltersControls({
  refreshData,
  addressFilter,
  setAddressFilter,
  setStatusFilter,
  statusFilter,
  resetSort,
  itemsPerPage,
  setItemsPerPage,
  myRecordsOn,
  setMyRecordsOn,
}: {
  refreshData: () => void;
  addressFilter: string;
  setAddressFilter: React.Dispatch<React.SetStateAction<string>>;
  setStatusFilter: React.Dispatch<React.SetStateAction<string>>;
  statusFilter: string;
  resetSort: () => void;
  itemsPerPage: number;
  setItemsPerPage: (n: number) => void;
  myRecordsOn: boolean;
  setMyRecordsOn: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [localAddressFilter, setLocalAddressFilter] = useState(addressFilter);
  const debouncedAddressFilter = useDebounce(localAddressFilter, 500);

  useEffect(() => {
    setAddressFilter(debouncedAddressFilter);
  }, [debouncedAddressFilter, setAddressFilter]);

  return (
    <Paper sx={{ p: 2 }}>
      <Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" fontWeight={"bold"}>
            Filter & Suche
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <Tooltip title="Aktualisieren">
            <IconButton onClick={refreshData} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sortierung zurücksetzen">
            <IconButton onClick={resetSort} size="small">
              <SortRounded />
            </IconButton>
          </Tooltip>

          <TextField
            size="small"
            placeholder="Suche nach Adresse, Energieart oder Heizsystem..."
            value={localAddressFilter}
            onChange={(e) => setLocalAddressFilter(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRounded fontSize="small"></SearchRounded>
                  </InputAdornment>
                ),
              },
            }}
            sx={{ flex: 1, maxWidth: 600 }}
          />

          <TextField
            size="small"
            select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as string)}
            sx={{ minWidth: 200 }}
          >
            <MenuItem value="all">Alle Status</MenuItem>
            <MenuItem value="NEU">Neu</MenuItem>
            <MenuItem value="IN_PRUEFUNG">In Prüfung</MenuItem>
            <MenuItem value="FREIGEGEBEN">Freigegeben</MenuItem>
            <MenuItem value="UNPLAUSIBEL">Unplausibel</MenuItem>
          </TextField>

          <TextField
            size="small"
            select
            label="Einträge"
            value={itemsPerPage}
            onChange={(e) => setItemsPerPage(Number(e.target.value))}
            sx={{ minWidth: 100 }}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <MenuItem key={n} value={n}>{n}</MenuItem>
            ))}
          </TextField>

          <FormControlLabel
            control={
              <Checkbox
                checked={myRecordsOn}
                onChange={(e) => setMyRecordsOn(e.target.checked)}
                size="small"
              />
            }
            label="Nur meine"
            sx={{ ml: 0, whiteSpace: "nowrap" }}
          />

          <Button
            size="small"
            variant="outlined"
            startIcon={<HistoryIcon />}
            onClick={() => navigate({ to: "/audit" })}
            sx={{ whiteSpace: "nowrap", ml: "auto" }}
          >
            Audit-Protokoll
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}

export default FiltersControls;
