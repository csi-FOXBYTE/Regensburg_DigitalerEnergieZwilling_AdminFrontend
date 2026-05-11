import { useCallback, useMemo, useState } from "react";
import { mockRecords } from "../assets/mockData";
import type { BuildingRecord } from "../assets/types";
import { RecordsContext } from "./RecordsContext";

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  // GET /admin/triage
  const [records, setRecords] = useState<BuildingRecord[]>(mockRecords);

  const updateRecord = useCallback((updatedRecord: BuildingRecord) => {
    setRecords((prev) => {
      const next = prev.map((r) =>
        r.id === updatedRecord.id ? updatedRecord : r,
      );
      if (
        updatedRecord.status === "FREIGEGEBEN" &&
        updatedRecord.variantGroup
      ) {
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
    // POST /admin/entries
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
