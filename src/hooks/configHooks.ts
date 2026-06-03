import type { Foerderprogramm } from "@/hooks/store";
import { apiClient } from "@/lib/apiClient";
import {
  validateConfig,
} from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import type { DETConfig } from "@csi-foxbyte/regensburg_digitalerenergiezwilling_energycalculationcore";
import { useMutation, useQuery } from "@tanstack/react-query";

/**
 * Sends edited config to backend, that creates a new config out of that.
 */
export function useSaveConfig() {
  return useMutation({
    mutationFn: ({
      versionName,
      config,
      subsidies,
    }: {
      versionName: string;
      config: DETConfig;
      subsidies: Foerderprogramm[];
    }) => {
      const result = validateConfig(config);
      if (!result.success) {
        const messages = result.issues.map((i: { path: string; message: string }) => `${i.path}: ${i.message}`).join("; ");
        throw new Error(`Ungültige Konfiguration: ${messages}`);
      }
      return apiClient("/api/admin/config", {
        method: "POST",
        body: JSON.stringify({
          versionName,
          calculationConfig: JSON.stringify(result.data),
          subsidies: JSON.stringify(subsidies),
        }),
      });
    },
  });
}
/**
 * Lists all Config names for the selector.
 */
export interface ConfigMeta {
  versionName: string;
  createdAt?: string;
  activatedAt?: string;
}

export function useConfigVersions() {
  return useQuery({
    queryKey: ["config-versions"],
    queryFn: () =>
      apiClient<{ configs: ConfigMeta[] }>("/api/admin/config", {
        method: "GET",
      }),
  });
}

/**
 * Gets the config with the unique versionName to load it to the maintenance page.
 */
export function useLoadConfig(versionName: string) {
  return useQuery({
    queryKey: ["config", versionName],
    queryFn: async () => {
      const raw = await apiClient<{
        versionName: string;
        calculationConfig: unknown;
        subsidies: Foerderprogramm[];
      }>(`/api/admin/config/${versionName}`, { method: "GET" });
      const result = validateConfig(raw.calculationConfig);
      if (!result.success) {
        const messages = result.issues.map((i: { path: string; message: string }) => `${i.path}: ${i.message}`).join("; ");
        throw new Error(`Ungültige Konfiguration vom Server: ${messages}`);
      }
      return { ...raw, calculationConfig: result.data };
    },
    enabled: !!versionName,
  });
}

/**
 * Activates the config and makes sure any other is not active.
 */
export function useActivateConfig() {
  return useMutation({
    mutationFn: ({ versionName }: { versionName: string }) =>
      apiClient(`/api/admin/config/${versionName}/activate`, {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
  });
}

/**
 * Deletes the chosen config and fails when it is active.
 */
export function useDeleteConfig() {
  return useMutation({
    mutationFn: ({ versionName }: { versionName: string }) =>
      apiClient(`/api/admin/config/${versionName}`, {
        method: "DELETE",
        body: JSON.stringify({}),
      }),
  });
}

/**
 * Gets the activated config to mark it in the selection menu.
 */
export function useActiveConfig() {
  return useQuery({
    queryKey: ["active-config"],
    queryFn: () =>
      apiClient<{ versionName: string }>("/api/public/config/active", {
        method: "GET",
      }),
  });
}
