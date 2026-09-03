import { getDisplayName, useCurrentUser } from "@/hooks/useCurrentUser";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useState } from "react";

const NAV_ITEMS = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Gebäudeliste", path: "/maintenance" },
  { label: "Systempflege", path: "/config" },
];

function getTabValue(pathname: string): number | false {
  if (pathname.startsWith("/dashboard")) return 0;
  if (pathname.startsWith("/maintenance") || pathname.startsWith("/record"))
    return 1;
  if (pathname.startsWith("/config")) return 2;
  return false;
}

export function AppHeader() {
  const currentUser = useCurrentUser();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [logoutOpen, setLogoutOpen] = useState(false);

  const tabValue = getTabValue(pathname);

  return (
    <Box
      sx={(theme) => ({
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: theme.customShadows.header,
      })}
    >
      {/* Top section — 123 px */}
      <Box
        sx={(theme) => ({
          maxWidth: theme.layout.contentMaxWidth,
          mx: "auto",
          pl: 0,
          height: theme.layout.headerTitleHeight,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "2px solid",
          borderColor: "divider",
        })}
      >
        <Typography
          variant="h3"
          sx={{
            color: "primary.main",
            whiteSpace: "nowrap",
            fontWeight: 700,
          }}
        >
          Digitaler Energie Zwilling
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: "100%",
            py: 1.5,
          }}
        >
          <Typography
            onClick={() => setLogoutOpen(true)}
            sx={{
              fontSize: 14,
              lineHeight: "22px",
              color: "text.secondary",
              cursor: "pointer",
              "&:hover": { color: "primary.main" },
            }}
          >
            {getDisplayName(currentUser)}
          </Typography>

          {/* Logo */}
          <Box
            component="img"
            src="/logo.png"
            onClick={() => location.assign("https://www.regensburg.de/")}
            alt="Stadt Regensburg"
            sx={{ height: 60, width: "auto", cursor: "pointer" }}
          />
        </Box>
      </Box>

      {/* Bottom nav section — 68 px */}
      <Box
        sx={(theme) => ({
          maxWidth: theme.layout.contentMaxWidth,
          mx: "auto",
          height: theme.layout.headerNavigationHeight,
          display: "flex",
        })}
      >
        <Tabs
          value={tabValue}
          onChange={(_, v) => navigate({ to: NAV_ITEMS[v]?.path })}
        >
          {NAV_ITEMS.map((item) => (
            <Tab key={item.path} label={item.label} />
          ))}
        </Tabs>
      </Box>

      <Dialog open={logoutOpen} onClose={() => setLogoutOpen(false)}>
        <DialogTitle>Abmelden</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Möchten Sie sich wirklich abmelden?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            onClick={() => setLogoutOpen(false)}
          >
            Abbrechen
          </Button>
          <Button variant="contained" href="/logout">
            Abmelden
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
