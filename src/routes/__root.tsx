import { CssBaseline } from "@mui/material";
import { ThemeProvider } from "@mui/material/styles";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AppHeader } from "../components/AppHeader";
import { useAuth } from "../components/AuthContext";
import "../lib/localization/i18next";
import theme from "../theme/theme";

export const Route = createRootRoute({
  component: RootComponent,
});

const queryClient = new QueryClient();

function RootComponent() {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <AppShell />
        </QueryClientProvider>
      </ThemeProvider>
      <Toaster richColors position="top-right" />
    </>
  );
}

function AppShell() {
  const { isAuthenticated } = useAuth();

  return (
    <>
      {isAuthenticated && <AppHeader />}
      <Outlet />
    </>
  );
}
