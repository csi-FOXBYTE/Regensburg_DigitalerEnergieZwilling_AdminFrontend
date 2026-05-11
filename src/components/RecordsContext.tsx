import { createContext } from "react";
import type { BuildingRecord } from "../assets/types";

export interface RecordsContextType {
  records: BuildingRecord[];
  setRecords: React.Dispatch<React.SetStateAction<BuildingRecord[]>>;
  updateRecord: (updatedRecord: BuildingRecord) => void;
  updateRecords: (records: BuildingRecord[]) => void;
}

export const RecordsContext = createContext<RecordsContextType | null>(null);
