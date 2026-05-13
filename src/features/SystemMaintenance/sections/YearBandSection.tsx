import { Delete, Edit } from "@mui/icons-material";
import {
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { toast } from "sonner";
import { CollapsibleSection } from "../CollapsibleSection";
import {
  addYearBand,
  config,
  deleteYearBand,
  updateYearBand,
  type YearBandEntry,
} from "../../../hooks/store";
import { type DeleteConfirmState, type EditState } from "../ConfigOverview";

export function YearBandSection({
  configStore,
  setEditState,
  setDeleteConfirm,
  expandedSections,
  toggleSection,
}: {
  configStore: ReturnType<typeof config.get>;
  setEditState: React.Dispatch<React.SetStateAction<EditState>>;
  setDeleteConfirm: React.Dispatch<React.SetStateAction<DeleteConfirmState>>;
  expandedSections: Record<string, boolean>;
  toggleSection: (section: string) => void;
}) {
  const handleDeleteConfirm = (onConfirm: () => void) => {
    setDeleteConfirm({ open: true, onConfirm });
  };

  const handleEditYearBand = (index: number) => {
    const item = configStore.general.generalYearBands[index] as YearBandEntry;
    setEditState({
      open: true,
      title: "Jahresband bearbeiten",
      fields: [
        {
          key: "from",
          label: "Von Jahr",
          value: item.from ?? "",
          type: "number",
        },
        { key: "to", label: "Bis Jahr", value: item.to ?? "", type: "number" },
      ],
      onSave: (_, numbers) => {
        updateYearBand(index, (draft) => {
          draft.from = numbers.from;
          draft.to = numbers.to;
        });
      },
    });
  };

  const handleAddYearBand = () => {
    setEditState({
      open: true,
      title: "Neuer Jahresband hinzufügen",
      fields: [
        { key: "from", label: "Von Jahr", value: "", type: "number" },
        { key: "to", label: "Bis Jahr", value: "", type: "number" },
      ],
      onSave: (_, numbers) => {
        addYearBand({ from: numbers.from, to: numbers.to });
        toast.success("Jahresband hinzugefügt");
      },
    });
  };

  return (
    <CollapsibleSection
      sectionKey="yearBand"
      title="Jahresbänder"
      expandedSections={expandedSections}
      toggleSection={toggleSection}
      action={
        <Button
          variant="outlined"
          color="error"
          onClick={(e) => {
            e.stopPropagation();
            handleAddYearBand();
          }}
        >
          Neues Jahresband +
        </Button>
      }
    >
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight={"bold"}>Zeitraum</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography fontWeight={"bold"}>Aktionen</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {configStore.general.generalYearBands.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ fontSize: "16px" }}>
                      {(() => {
                        const { from, to } = item as YearBandEntry;
                        return from == null
                          ? `bis ${to}`
                          : to == null
                            ? `ab ${from}`
                            : `von ${from} bis ${to}`;
                      })()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => handleEditYearBand(index)}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() =>
                          handleDeleteConfirm(() => {
                            deleteYearBand(index);
                            toast.success("Jahresband gelöscht");
                          })
                        }
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
    </CollapsibleSection>
  );
}
