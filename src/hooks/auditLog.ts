export type AuditAction =
  | "assign"
  | "deassign"
  | "approve"
  | "decline"
  | "delete_building"
  | "delete_record"
  | "note"
  | "auto_deassign"
  | "auto_decline";

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: AuditAction;
  recordId: string;
  buildingAddress: string;
  userId: string | null;
  userName: string | null;
  details?: string;
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function addAuditEntry(
  action: AuditAction,
  record: { id: string; buildingAddress: string },
  user: { id: string; name: string } | null,
  details?: string,
): void {
  const entry: AuditLogEntry = {
    id: generateId(),
    timestamp: new Date().toISOString(),
    action,
    recordId: record.id,
    buildingAddress: record.buildingAddress,
    userId: user?.id ?? null,
    userName: user?.name ?? null,
    details,
  };
  fetch("/api/audit", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  }).catch(() => {});
}

export const ACTION_LABELS: Record<AuditAction, string> = {
  assign: "Zuweisung",
  deassign: "Zuweisung aufgehoben",
  approve: "Freigegeben",
  decline: "Abgelehnt",
  delete_building: "Gebäude gelöscht",
  delete_record: "Datensatz gelöscht",
  note: "Notiz gespeichert",
  auto_deassign: "Automatisch zurückgesetzt (72h)",
  auto_decline: "Automatisch abgelehnt",
};

export const ACTION_COLORS: Record<
  AuditAction,
  "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning"
> = {
  assign: "primary",
  deassign: "warning",
  approve: "success",
  decline: "error",
  delete_building: "error",
  delete_record: "error",
  note: "default",
  auto_deassign: "warning",
  auto_decline: "warning",
};
