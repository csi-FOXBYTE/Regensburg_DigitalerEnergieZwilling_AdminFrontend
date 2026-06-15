import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import "../lib/localization/i18next";
import theme from "../theme/theme";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <Outlet />
      </ThemeProvider>
      <Toaster richColors position="top-right" />
    </>
  );
}
