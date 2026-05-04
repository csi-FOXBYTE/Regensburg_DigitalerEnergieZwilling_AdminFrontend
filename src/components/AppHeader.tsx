import LogoutIcon from "@mui/icons-material/Logout";
import { Box, Button, Divider, Tab, Tabs, Typography } from "@mui/material";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "./AuthContext";

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
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const tabValue = getTabValue(pathname);

  const handleLogout = () => {
    logout();
    navigate({ to: "/login" });
  };

  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1,
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: 1100,
      }}
    >
      <Box
        sx={{
          maxWidth: 1170,
          mx: "auto",
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          py: 1,
        }}
      >
        <Typography
          variant="h4"
          sx={{ color: "error.main", whiteSpace: "nowrap", my: 3 }}
        >
          Digitaler Energie Zwilling
        </Typography>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {currentUser?.name}
          </Typography>
          <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
          <Button
            size="small"
            variant="text"
            endIcon={<LogoutIcon fontSize="small" />}
            onClick={handleLogout}
            sx={{ minWidth: 0, px: 1, color: "text.primary" }}
          >
            Abmelden
          </Button>
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/de/thumb/6/6a/Regensburg_Logo.svg/960px-Regensburg_Logo.svg.png"
            alt="Stadt Regensburg"
            sx={{ height: 44, width: "auto", ml: 1 }}
          />
        </Box>
      </Box>
      <Divider
        orientation="horizontal"
        flexItem
        sx={{ width: "1170px", margin: "auto" }}
      />

      <Box sx={{ maxWidth: 1170, mx: "auto", px: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, v) => navigate({ to: NAV_ITEMS[v].path })}
          sx={{
            "& .MuiTabs-indicator": { backgroundColor: "error.main" },
            "& .Mui-selected": { color: "text.primary" },
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Tab
              key={item.path}
              label={item.label}
              sx={{
                textTransform: "none",
              }}
            />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
}
