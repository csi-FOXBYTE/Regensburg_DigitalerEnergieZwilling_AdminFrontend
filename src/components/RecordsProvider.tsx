import type {
  GetApiAdminSubmissions200DataItem,
  GetApiAdminSubmissions200DataItemSubmissionsItem,
} from "@/api/api.gen";
import { useSubmissions } from "@/hooks/submissionHooks";
import { useCallback, useEffect, useMemo, useState } from "react";
import { mockRecords } from "../assets/mockData";
import type { BuildingRecord, RecordStatus } from "../assets/types";
import { RecordsContext } from "./RecordsContext";

function toRecordStatus(
  status: GetApiAdminSubmissions200DataItemSubmissionsItem["status"],
): RecordStatus {
  switch (status) {
    case "NEW":      return "NEU";
    case "ASSIGNED": return "IN_PRUEFUNG";
    case "ACCEPTED": return "FREIGEGEBEN";
    case "DECLINED": return "ABGELEHNT";
  }
}

function groupToRecords(group: GetApiAdminSubmissions200DataItem): BuildingRecord[] {
  const useVariants = group.submissions.length > 1;
  return group.submissions.map((sub, i) => ({
    id: sub.id,
    buildingId: group.buildingId,
    buildingAddress: group.address,
    longitude: group.longitude,
    latitude: group.latitude,
    receivedDate: sub.createdAt,
    status: toRecordStatus(sub.status),
    assignedTo: sub.assignedToId,
    assignedAt: null,
    notes: "",
    ...(useVariants && {
      variantGroup: group.buildingId,
      variantLabel: `Einreichung ${String.fromCharCode(65 + i)}`,
    }),
  }));
}

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const { data: submissionData } = useSubmissions();

  const backendRecords = useMemo(() => {
    if (!submissionData || submissionData.total === 0) return null;
    return submissionData.data.flatMap(groupToRecords);
  }, [submissionData]);

  const [records, setRecords] = useState<BuildingRecord[]>(
    backendRecords ?? mockRecords,
  );

  useEffect(() => {
    if (backendRecords) setRecords(backendRecords);
  }, [backendRecords]);

  const updateRecord = useCallback((updatedRecord: BuildingRecord) => {
    setRecords((prev) => {
      const next = prev.map((r) =>
        r.id === updatedRecord.id ? updatedRecord : r,
      );
      if (updatedRecord.status === "FREIGEGEBEN" && updatedRecord.variantGroup) {
        return next.map((r) =>
          r.variantGroup === updatedRecord.variantGroup &&
          r.id !== updatedRecord.id
            ? {
                ...r,
                status: "ABGELEHNT" as const,
                rejectedDueToApprovalOf: updatedRecord.id,
                rejectedDueToApprovalOfLabel: updatedRecord.variantLabel,
                resolvedAt: updatedRecord.resolvedAt,
              }
            : r,
        );
      }
      return next;
    });
  }, []);

  const updateRecords = useCallback((records: BuildingRecord[]) => {
    setRecords(records);
  }, []);

  const value = useMemo(
    () => ({ records, setRecords, updateRecord, updateRecords }),
    [records, setRecords, updateRecord, updateRecords],
  );

  return (
    <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>
  );
}
