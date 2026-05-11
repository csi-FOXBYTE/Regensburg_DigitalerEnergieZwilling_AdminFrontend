import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";

interface SaveDialogProps {
  open: boolean;
  defaultName?: string;
  onClose: () => void;
  onSave: (fileName: string) => void;
}

export function SaveDialog({
  open,
  defaultName = "",
  onClose,
  onSave,
}: SaveDialogProps) {
  const [fileName, setFileName] = useState(defaultName);
  const [error, setError] = useState("");


  const handleSave = () => {
    const trimmed = fileName.trim();
    if (!trimmed) {
      setError("Dateiname ist erforderlich");
      return;
    }
    onSave(trimmed);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSave();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        backdrop: { sx: { bgcolor: "rgba(0, 0, 0, 0.1)" } },
        paper: { elevation: 0, sx: { border: "1px solid rgba(0,0,0,0.12)" } },
      }}
    >
      <DialogTitle>
        <Typography variant="h4">Konfiguration speichern</Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Dateiname"
          value={fileName}
          onChange={(e) => {
            setFileName(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={handleKeyDown}
          fullWidth
          required
          error={!!error}
          helperText={error}
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined" color="error">
          Abbrechen
        </Button>
        <Button onClick={handleSave} variant="contained" color="error">
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
