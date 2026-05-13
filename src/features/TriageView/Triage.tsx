import type { BuildingRecord } from "@/assets/types";
import { useAuth } from "@/components/AuthContext";
import { RecordsContext } from "@/components/RecordsContext";
import { addAuditEntry } from "@/hooks/auditLog";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useCallback, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "./parts/DeleteDialog";
import FiltersControls from "./parts/FiltersControls";
import PaginationView from "./parts/Pagination";
import TableView from "./parts/Table";

export function Dashboard() {
  const { records, updateRecord, setRecords } = useContext(RecordsContext)!;
  const { currentUser } = useAuth();

  const [addressFilter, setAddressFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "date" | "address" | "status" | "assignedTo"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [myRecordsOn, setMyRecordsOn] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredAndSortedRecords = useMemo(() => {
    const filtered = records.filter((record) => {
      const matchesAddress = record.buildingAddress
        .toLowerCase()
        .includes(addressFilter.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || record.status === statusFilter;
      const matchesMe = !myRecordsOn || record.assignedTo === currentUser?.name;
      return matchesAddress && matchesStatus && matchesMe;
    });

    filtered.sort((a, b) => {
      let comp = 0;
      if (sortBy === "date") {
        comp =
          new Date(a.receivedDate).getTime() -
          new Date(b.receivedDate).getTime();
      } else if (sortBy === "address") {
        comp = a.buildingAddress.localeCompare(b.buildingAddress);
      } else if (sortBy === "status") {
        comp = a.status.localeCompare(b.status);
      } else if (sortBy === "assignedTo") {
        comp = (a.assignedTo ?? "").localeCompare(b.assignedTo ?? "");
      }
      return sortOrder === "asc" ? comp : -comp;
    });

    return filtered;
  }, [
    records,
    addressFilter,
    statusFilter,
    sortBy,
    sortOrder,
    myRecordsOn,
    currentUser,
  ]);

  const variantGroupCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of records) {
      if (r.variantGroup)
        counts.set(r.variantGroup, (counts.get(r.variantGroup) ?? 0) + 1);
    }
    return counts;
  }, [records]);

  const deduplicatedRecords = useMemo(() => {
    const seen = new Set<string>();
    return filteredAndSortedRecords.filter((r) => {
      if (!r.variantGroup) return true;
      if (seen.has(r.variantGroup)) return false;
      seen.add(r.variantGroup);
      return true;
    });
  }, [filteredAndSortedRecords]);

  const totalPages = Math.ceil(deduplicatedRecords.length / itemsPerPage);
  const effectivePage = totalPages > 0 ? Math.min(currentPage, totalPages) : 1;
  const paginatedRecords = useMemo(() => {
    const startIndex = (effectivePage - 1) * itemsPerPage;
    return deduplicatedRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [deduplicatedRecords, effectivePage, itemsPerPage]);


  const handleAssignToMe = useCallback(
    (record: BuildingRecord) => {
      if (!currentUser) return toast.error("Bitte zuerst einloggen.");
      if (record.assignedTo && record.assignedTo !== currentUser.name)
        return toast.error(
          "Dieser Datensatz ist bereits einem anderen Prüfer zugewiesen.",
        );
      if (record.status !== "NEU")
        return toast.error("Nur neue Datensätze können zugewiesen werden.");
      updateRecord({
        ...record,
        status: "IN_PRUEFUNG",
        assignedTo: currentUser.name,
        assignedAt: new Date(),
      });
      addAuditEntry("assign", record, currentUser);
      toast.success("Datensatz zugewiesen. Status: In Prüfung");
    },
    [currentUser, updateRecord],
  );

  const handleDelete = useCallback(
    (id: string) => {
      const record = records.find((r) => r.id === id);
      if (record) addAuditEntry("delete_record", record, currentUser);
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setRecordToDelete(null);
      toast.success("Datensatz wurde gelöscht.");
    },
    [setRecords, records, currentUser],
  );

  const resetSort = useCallback(() => {
    setSortBy("date");
    setSortOrder("desc");
  }, []);

  const toggleSort = useCallback(
    (field: "date" | "address" | "status" | "assignedTo") => {
      if (field === sortBy) {
        setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortBy(field);
        setSortOrder("asc");
      }
    },
    [sortBy],
  );

  const refreshData = useCallback(() => {
    records
      .filter((record) => record.status === "IN_PRUEFUNG")
      .forEach((record) => {
        const hoursDifference =
          (Date.now() - new Date(record.assignedAt!).getTime()) /
          (1000 * 60 * 60);
        if (hoursDifference > 72) {
          updateRecord({
            ...record,
            status: "NEU",
            assignedTo: null,
            assignedAt: null,
            notes: "",
          });
          addAuditEntry(
            "auto_deassign",
            record,
            null,
            `72h Timeout (zugewiesen an ${record.assignedTo})`,
          );
          toast.info(`Datensatz ${record.id} nach 72h zurückgesetzt.`);
        }
      });
  }, [records, updateRecord]);

  return (
    <Box sx={{ width: "full" }}>
      <Box
        sx={{
          maxWidth: 1170,
          mx: "auto",
          py: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Box>
          <Typography variant="h2" gutterBottom>
            Gebäudeliste
          </Typography>
          <Typography variant="body1">
            Verwalten und prüfen Sie alle eingereichten Gebäudedaten
          </Typography>
        </Box>

        {/* Filters */}
        <FiltersControls
          refreshData={refreshData}
          addressFilter={addressFilter}
          setAddressFilter={(v) => { setAddressFilter(v); setCurrentPage(1); }}
          setStatusFilter={(v) => { setStatusFilter(v); setCurrentPage(1); }}
          statusFilter={statusFilter}
          resetSort={resetSort}
          itemsPerPage={itemsPerPage}
          setItemsPerPage={(n) => {
            setItemsPerPage(n);
            setCurrentPage(1);
          }}
          myRecordsOn={myRecordsOn}
          setMyRecordsOn={(v) => { setMyRecordsOn(v); setCurrentPage(1); }}
        />

        {/* Table + Pagination */}
        <Card>
          <CardContent sx={{ pt: 2 }}>
            <TableView
              records={paginatedRecords}
              currentUserName={currentUser?.name}
              handleAssignToMe={handleAssignToMe}
              setRecordToDelete={setRecordToDelete}
              sortBy={sortBy}
              sortOrder={sortOrder}
              toggleSort={toggleSort}
              variantGroupCounts={variantGroupCounts}
            />
            <PaginationView
              setCurrentPage={setCurrentPage}
              currentPage={effectivePage}
              totalPages={totalPages}
            />
          </CardContent>
        </Card>
      </Box>

      <DeleteConfirmationDialog
        recordToDelete={recordToDelete}
        setRecordToDelete={setRecordToDelete}
        handleDelete={handleDelete}
      />
    </Box>
  );
}
