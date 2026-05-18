import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { setApiAuthProvider, setApiBaseUrl } from "./lib/apiClient";
import { RecordsProvider } from "./components/RecordsProvider";
import { routeTree } from "./routeTree.gen";

setApiBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "");

if (import.meta.env.DEV) {
  setApiAuthProvider(() => import.meta.env.VITE_DEV_ACCESS_TOKEN ?? null);
}

const router = createRouter({ routeTree });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RecordsProvider>
      <RouterProvider router={router} />
    </RecordsProvider>
  </StrictMode>,
);
