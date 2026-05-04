import {
  ACTION_COLORS,
  ACTION_LABELS,
  type AuditLogEntry,
  clearAuditLog,
  downloadAuditLog,
  getAuditLog,
} from "@/hooks/auditLog";
import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";

export function AuditLogPage() {
  const [entries, setEntries] = useState<AuditLogEntry[]>(getAuditLog);

  const refresh = () => setEntries(getAuditLog());

  const handleClear = () => {
    clearAuditLog();
    setEntries([]);
  };

  return (
    <Box sx={{ bgcolor: "grey.100", width: "full" }}>
      <Box
        sx={{
          maxWidth: 1170,
          mx: "auto",
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="h2" gutterBottom>
              Audit-Protokoll
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Nachvollziehbare Historie aller Aktionen im System
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, pt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={refresh}
            >
              Aktualisieren
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              onClick={downloadAuditLog}
              disabled={entries.length === 0}
            >
              JSON herunterladen
            </Button>
            <Button
              variant="outlined"
              color="error"
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleClear}
              disabled={entries.length === 0}
            >
              Protokoll leeren
            </Button>
          </Box>
        </Box>

        <Box sx={{ bgcolor: "white", p: 3 }}>
          {entries.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 6 }}>
              <Typography color="text.secondary">
                Noch keine Einträge vorhanden.
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.50" }}>
                    <TableCell sx={{ fontWeight: 600 }}>Zeitstempel</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Aktion</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Adresse</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Datensatz-ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Benutzer</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        <Typography variant="caption">
                          {new Date(entry.timestamp).toLocaleString("de-DE", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={ACTION_LABELS[entry.action]}
                          color={ACTION_COLORS[entry.action]}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.buildingAddress}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          sx={{ fontFamily: "monospace" }}
                        >
                          {entry.recordId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.userName ?? (
                            <span style={{ color: "gray" }}>System</span>
                          )}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            maxWidth: 240,
                          }}
                        >
                          {entry.details ?? "—"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 2 }}
          >
            {entries.length} {entries.length === 1 ? "Eintrag" : "Einträge"} •
            Gespeichert im lokalen Browser-Speicher (localStorage)
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
