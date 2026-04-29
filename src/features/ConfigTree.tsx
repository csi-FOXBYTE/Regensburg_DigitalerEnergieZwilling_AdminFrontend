import { useState } from "react";
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Collapse,
  Paper,
  Chip,
} from "@mui/material";
import {
  ExpandMore,
  ChevronRight,
  Edit,
  Check,
  Close,
  Folder,
  FolderOpen,
  Description,
} from "@mui/icons-material";

interface TreeNodeProps {
  label: string;
  value: any;
  path: string;
  onEdit?: (path: string, newValue: any) => void;
  level?: number;
}

function TreeNode({ label, value, path, onEdit, level = 0 }: TreeNodeProps) {
  const [expanded, setExpanded] = useState(level < 2);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState("");

  const isObject = typeof value === "object" && value !== null && !Array.isArray(value);
  const isArray = Array.isArray(value);
  const isPrimitive = !isObject && !isArray;

  const handleEdit = () => {
    setEditValue(String(value));
    setEditing(true);
  };

  const handleSave = () => {
    if (onEdit) {
      let parsedValue: any = editValue;
      
      // Versuche Zahlen zu parsen
      if (!isNaN(Number(editValue)) && editValue.trim() !== "") {
        parsedValue = Number(editValue);
      }
      // Versuche Booleans zu parsen
      else if (editValue === "true" || editValue === "false") {
        parsedValue = editValue === "true";
      }
      
      onEdit(path, parsedValue);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setEditing(false);
  };

  const renderValue = () => {
    if (editing) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TextField
            size="small"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") handleCancel();
            }}
          />
          <IconButton size="small" onClick={handleSave} color="primary">
            <Check />
          </IconButton>
          <IconButton size="small" onClick={handleCancel}>
            <Close />
          </IconButton>
        </Box>
      );
    }

    if (isPrimitive) {
      return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            label={String(value)}
            size="small"
            color={typeof value === "number" ? "primary" : "default"}
          />
          {onEdit && (
            <IconButton size="small" onClick={handleEdit}>
              <Edit fontSize="small" />
            </IconButton>
          )}
        </Box>
      );
    }

    if (isArray) {
      return (
        <Chip
          label={`Array (${value.length} Elemente)`}
          size="small"
          color="secondary"
        />
      );
    }

    return (
      <Chip
        label={`Objekt (${Object.keys(value).length} Eigenschaften)`}
        size="small"
        color="info"
      />
    );
  };

  return (
    <Box sx={{ ml: level * 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          py: 0.5,
          "&:hover": { bgcolor: "action.hover" },
          borderRadius: 1,
          px: 1,
        }}
      >
        {(isObject || isArray) && (
          <IconButton
            size="small"
            onClick={() => setExpanded(!expanded)}
            sx={{ mr: 0.5 }}
          >
            {expanded ? <ExpandMore /> : <ChevronRight />}
          </IconButton>
        )}
        {!isObject && !isArray && (
          <Box sx={{ width: 32, display: "inline-block" }} />
        )}
        
        {isObject && (
          expanded ? (
            <FolderOpen sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />
          ) : (
            <Folder sx={{ mr: 1, color: "primary.main", fontSize: 20 }} />
          )
        )}
        {isArray && (
          <Description sx={{ mr: 1, color: "secondary.main", fontSize: 20 }} />
        )}
        
        <Typography variant="body2" sx={{ fontWeight: 500, mr: 2, minWidth: 200 }}>
          {label}
        </Typography>
        {renderValue()}
      </Box>

      {(isObject || isArray) && (
        <Collapse in={expanded}>
          <Box sx={{ borderLeft: "2px solid", borderColor: "divider", ml: 2 }}>
            {isArray
              ? value.map((item: any, index: number) => (
                  <TreeNode
                    key={`${path}[${index}]`}
                    label={`[${index}]`}
                    value={item}
                    path={`${path}[${index}]`}
                    onEdit={onEdit}
                    level={level + 1}
                  />
                ))
              : Object.entries(value).map(([key, val]) => (
                  <TreeNode
                    key={`${path}.${key}`}
                    label={key}
                    value={val}
                    path={`${path}.${key}`}
                    onEdit={onEdit}
                    level={level + 1}
                  />
                ))}
          </Box>
        </Collapse>
      )}
    </Box>
  );
}

interface ConfigTreeProps {
  config: any;
  onUpdate?: (path: string, value: any) => void;
}

export function ConfigTree({ config, onUpdate }: ConfigTreeProps) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <TreeNode label="config" value={config} path="config" onEdit={onUpdate} />
    </Paper>
  );
}
