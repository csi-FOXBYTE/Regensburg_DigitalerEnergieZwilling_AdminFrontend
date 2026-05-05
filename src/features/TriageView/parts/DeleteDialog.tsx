import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Typography,
} from "@mui/material";

export function DeleteConfirmationDialog({
  recordToDelete,
  setRecordToDelete,
  handleDelete,
}: {
  recordToDelete: string | null;
  setRecordToDelete: (id: string | null) => void;
  handleDelete: (id: string) => void;
}) {
  return (
    <Dialog
      open={!!recordToDelete}
      onClose={() => setRecordToDelete(null)}
      slotProps={{
        backdrop: { sx: { bgcolor: "rgba(0, 0, 0, 0.1)" } },
        paper: { elevation: 0, sx: { border: "1px solid rgba(0,0,0,0.12)" } },
      }}
    >
      <DialogTitle>
        <Typography variant="h4">Datensatz löschen</Typography>
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Typography variant="body1">
            Sind Sie sicher, dass Sie diesen unplausiblen Datensatz löschen
            möchten? Diese Aktion kann nicht rückgängig gemacht werden.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => setRecordToDelete(null)}
          color="error"
          variant="outlined"
        >
          Abbrechen
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => recordToDelete && handleDelete(recordToDelete)}
        >
          Löschen
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default DeleteConfirmationDialog;
