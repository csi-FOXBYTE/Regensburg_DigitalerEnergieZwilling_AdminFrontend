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

const STORAGE_KEY = "auditLog";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getAuditLog(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
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
  const log = getAuditLog();
  log.unshift(entry);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log, null, 2));
}

export function clearAuditLog(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function downloadAuditLog(): void {
  const log = getAuditLog();
  const blob = new Blob([JSON.stringify(log, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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
