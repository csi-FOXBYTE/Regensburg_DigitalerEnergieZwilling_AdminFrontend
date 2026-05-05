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
        bgcolor: "white",
        borderBottom: 1,
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* Top section — 123 px */}
      <Box
        sx={{
          maxWidth: 1170,
          mx: "auto",
          px: 2,
          height: 123,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          variant="h2"
          sx={{ color: "error.main", whiteSpace: "nowrap" }}
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
          {/* Utility links */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              sx={{ fontSize: 14, lineHeight: "22px", color: "#757575" }}
            >
              {currentUser?.name}
            </Typography>
            <Divider orientation="vertical" flexItem />
            <Button
              size="small"
              variant="text"
              endIcon={<LogoutIcon sx={{ fontSize: "14px !important" }} />}
              onClick={handleLogout}
              sx={{
                minWidth: 0,
                px: 0,
                fontSize: 14,
                lineHeight: "22px",
                color: "#757575",
                textTransform: "none",
                fontWeight: 400,
              }}
            >
              Abmelden
            </Button>
          </Box>

          {/* Logo */}
          <Box
            component="img"
            src="https://upload.wikimedia.org/wikipedia/de/thumb/6/6a/Regensburg_Logo.svg/960px-Regensburg_Logo.svg.png"
            alt="Stadt Regensburg"
            sx={{ height: 44, width: "auto" }}
          />
        </Box>
      </Box>

      <Divider />

      {/* Bottom nav section — 68 px */}
      <Box
        sx={{
          maxWidth: 1170,
          mx: "auto",
          px: 2,
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_, v) => navigate({ to: NAV_ITEMS[v].path })}
          sx={{
            height: 68,
            minHeight: 68,
            "& .MuiTabs-indicator": {
              backgroundColor: "error.main",
              height: 3,
            },
            "& .MuiTab-root": {
              fontSize: 16,
              lineHeight: "26px",
              color: "#000",
              textTransform: "none",
              height: 68,
              minHeight: 68,
            },
            "& .Mui-selected": { color: "#000" },
          }}
        >
          {NAV_ITEMS.map((item) => (
            <Tab key={item.path} label={item.label} />
          ))}
        </Tabs>
      </Box>
    </Box>
  );
}
