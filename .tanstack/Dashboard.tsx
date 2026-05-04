import type { BuildingRecord } from "@/assets/types";
import { useAuth } from "@/components/AuthContext";
import { RecordsContext } from "@/components/RecordsContext";
import { Box, Card, CardContent, Typography } from "@mui/material";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { DeleteConfirmationDialog } from "../components/parts/DeleteDialog";
import FiltersControls from "../components/parts/FiltersControls";
import PaginationView from "../components/parts/Pagination";
import TableView from "../components/parts/Table";

export function Dashboard() {
  const { records, updateRecord, setRecords } = useContext(RecordsContext)!;
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [addressFilter, setAddressFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<
    "date" | "address" | "status" | "assignedTo"
  >("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [myRecordsOn, setMyRecordsOn] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

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

  const totalPages = Math.ceil(filteredAndSortedRecords.length / itemsPerPage);
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedRecords.slice(
      startIndex,
      startIndex + itemsPerPage,
    );
  }, [filteredAndSortedRecords, currentPage]);

  useEffect(
    () => setCurrentPage(1),
    [addressFilter, statusFilter, myRecordsOn],
  );

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
      toast.success("Datensatz zugewiesen. Status: In Prüfung");
    },
    [currentUser, updateRecord],
  );

  const handleDelete = useCallback(
    (id: string) => {
      setRecords((prev) => prev.filter((r) => r.id !== id));
      setRecordToDelete(null);
      toast.success("Datensatz wurde gelöscht.");
    },
    [setRecords],
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
          toast.info(`Datensatz ${record.id} nach 72h zurückgesetzt.`);
        }
      });
  }, [records, updateRecord]);

  const handleLogout = useCallback(() => {
    logout();
    navigate({ to: "/login" });
  }, [logout, navigate]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.100", p: 3 }}>
      <Box
        sx={{
          maxWidth: 1280,
          mx: "auto",
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* Header 
        <Paper sx={{ p: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                <Typography
                  variant="h4"
                  sx={{ color: "error.main", fontWeight: "bold" }}
                >
                  Digitaler Energie Zwilling
                </Typography>
                <Typography variant="h4">Gebäude-Triage</Typography>
              </Box>
              <Box
                sx={{
                  width: "100%",
                  height: 1,
                  bgcolor: "grey.300",
                  mt: 3,
                  mb: 1.5,
                }}
              />
              <Typography color="text.secondary">
                Verwaltung und Prüfung von Gebäudedatensätzen
              </Typography>
            </Box>
            <Box
              component="img"
              src="https://upload.wikimedia.org/wikipedia/de/thumb/6/6a/Regensburg_Logo.svg/960px-Regensburg_Logo.svg.png"
              alt="Stadt Regensburg Logo"
              sx={{ height: 52, width: "auto", ml: 3 }}
            />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mt: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PersonIcon sx={{ fontSize: 16, color: "text.secondary" }} />
              <Typography variant="body2" color="text.secondary">
                {currentUser?.name ?? "Unbekannt"}
              </Typography>
            </Box>
            <Button
              size="small"
              variant="outlined"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Abmelden
            </Button>
          </Box>
        </Paper>*/}
        <Typography variant="h4">Gebäudeliste</Typography>
        <Typography variant="body1">
          Verwalten und prüfen Sie alle eingereichten Gebäudedaten
        </Typography>

        {/* Statistics 
        <MemoizedStatisticsCard
          stats={stats}
          setMyRecordsOn={setMyRecordsOn}
          myRecordsOn={myRecordsOn}
        />*/}

        {/* Filters */}
        <FiltersControls
          refreshData={refreshData}
          addressFilter={addressFilter}
          setAddressFilter={setAddressFilter}
          setStatusFilter={setStatusFilter}
          statusFilter={statusFilter}
          resetSort={resetSort}
        />

        {/* Table + Pagination */}
        <Card>
          <CardContent sx={{ pt: 2 }}>
            <TableView
              records={paginatedRecords}
              currentUserName={currentUser?.name}
              navigate={navigate}
              handleAssignToMe={handleAssignToMe}
              setRecordToDelete={setRecordToDelete}
              sortBy={sortBy}
              sortOrder={sortOrder}
              toggleSort={toggleSort}
              variantGroupCounts={variantGroupCounts}
            />
            <PaginationView
              setCurrentPage={setCurrentPage}
              currentPage={currentPage}
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
