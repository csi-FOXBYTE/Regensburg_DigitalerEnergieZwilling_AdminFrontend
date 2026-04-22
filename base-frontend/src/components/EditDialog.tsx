import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

interface EditDialogProps {
  open: boolean;
  title: string;
  fields: Array<{
    key: string;
    label: string;
    value: any;
    type?: "text" | "number" | "select";
    required?: boolean;
    options?: Array<{ label: string; value: any }>;
  }>;
  onClose: () => void;
  onSave: (values: Record<string, any>) => void;
}

export function EditDialog({
  open,
  title,
  fields,
  onClose,
  onSave,
}: EditDialogProps) {
  const [values, setValues] = useState<Record<string, any>>(
    fields.reduce((acc, field) => ({ ...acc, [field.key]: field.value }), {}),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      setValues(
        fields.reduce(
          (acc, field) => ({ ...acc, [field.key]: field.value }),
          {},
        ),
      );
      setErrors({});
    }
  }, [open, fields]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && (!values[field.key] || values[field.key] === "")) {
        newErrors[field.key] = `${field.label} ist erforderlich`;
      }
      if (
        field.type === "number" &&
        values[field.key] !== "" &&
        isNaN(values[field.key])
      ) {
        newErrors[field.key] = `${field.label} muss eine Zahl sein`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave(values);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          {fields.map((field) => {
            if (field.type === "select" && field.options) {
              return (
                <TextField
                  key={field.key}
                  label={field.label}
                  select
                  value={values[field.key] ?? ""}
                  onChange={(e) =>
                    setValues({
                      ...values,
                      [field.key]: e.target.value,
                    })
                  }
                  fullWidth
                  error={!!errors[field.key]}
                  helperText={errors[field.key]}
                  required={field.required}
                >
                  {field.options.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </TextField>
              );
            }

            return (
              <TextField
                key={field.key}
                label={field.label}
                type={field.type || "text"}
                value={values[field.key] ?? ""}
                onChange={(e) =>
                  setValues({
                    ...values,
                    [field.key]:
                      field.type === "number"
                        ? e.target.value === ""
                          ? ""
                          : parseFloat(e.target.value)
                        : e.target.value,
                  })
                }
                fullWidth
                error={!!errors[field.key]}
                helperText={errors[field.key]}
                required={field.required}
              />
            );
          })}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Abbrechen</Button>
        <Button
          onClick={handleSave}
          variant="contained"
          sx={{
            bgcolor: "#C1272D",
            color: "white",
            "&:hover": { bgcolor: "#9B1F24" },
          }}
        >
          Speichern
        </Button>
      </DialogActions>
    </Dialog>
  );
}
