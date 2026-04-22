import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

interface ConfirmDeleteDialogProps {
  open: boolean;
  title?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({
  open,
  title = "Sind Sie sicher, dass Sie den Eintrag löschen möchten?",
  onConfirm,
  onCancel,
}: ConfirmDeleteDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Bestätigung erforderlich</DialogTitle>
      <DialogContent>{title}</DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Abbrechen</Button>
        <Button onClick={onConfirm} variant="contained" color="error">
          Löschen
        </Button>
      </DialogActions>
    </Dialog>
  );
}
