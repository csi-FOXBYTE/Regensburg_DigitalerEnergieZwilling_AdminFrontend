import { createRouter, RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AuthProvider } from "./components/AuthContext";
import { RecordsProvider } from "./components/RecordsProvider";
import { routeTree } from "./routeTree.gen";

const router = createRouter({ routeTree });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <RecordsProvider>
        <RouterProvider router={router} />
      </RecordsProvider>
    </AuthProvider>
  </StrictMode>,
);
