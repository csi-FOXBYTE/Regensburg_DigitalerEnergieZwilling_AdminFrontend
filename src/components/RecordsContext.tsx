import { createContext, useMemo, useState } from "react";
import { mockRecords } from "../assets/mockData";
import type { BuildingRecord } from "../assets/types";

interface RecordsContextType {
  records: BuildingRecord[];
  setRecords: React.Dispatch<React.SetStateAction<BuildingRecord[]>>;
  updateRecord: (updatedRecord: BuildingRecord) => void;
  updateRecords: (records: BuildingRecord[]) => void;
}

export const RecordsContext = createContext<RecordsContextType | null>(null);

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  // GET /admin/triage
  const [records, setRecords] = useState<BuildingRecord[]>(mockRecords);

  const updateRecord = (updatedRecord: BuildingRecord) => {
    setRecords((prev) => {
      const next = prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r));
      if (updatedRecord.status === "FREIGEGEBEN" && updatedRecord.variantGroup) {
        return next.map((r) =>
          r.variantGroup === updatedRecord.variantGroup && r.id !== updatedRecord.id
            ? {
                ...r,
                status: "UNPLAUSIBEL" as const,
                rejectedDueToApprovalOf: updatedRecord.id,
                rejectedDueToApprovalOfLabel: updatedRecord.variantLabel,
                resolvedAt: updatedRecord.resolvedAt,
              }
            : r,
        );
      }
      return next;
    });
  };

  const updateRecords = (records: BuildingRecord[]) => {
    // POST /admin/entries
    setRecords(records);
  };

  const value = useMemo(
    () => ({ records, setRecords, updateRecord, updateRecords }),
    [records, setRecords, updateRecord, updateRecords],
  );

  return (
    <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>
  );
}
