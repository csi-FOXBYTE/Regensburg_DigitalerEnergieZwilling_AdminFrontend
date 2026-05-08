import theme from "@/theme/theme";
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
        boxShadow: "0px 1px 5px rgba(0,0,0,0.08)",
      }}
    >
      {/* Top section — 123 px */}
      <Box
        sx={{
          maxWidth: 1170,
          mx: "auto",
          pl: 0,
          height: 123,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #191919",
        }}
      >
        <Typography
          variant="h3"
          sx={{
            color: theme.palette.error.main,
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
            src="/logo.png"
            alt="Stadt Regensburg"
            sx={{ height: 60, width: "auto" }}
          />
        </Box>
      </Box>

      {/* Bottom nav section — 68 px */}
      <Box
        sx={{
          maxWidth: 1170,
          mx: "auto",
          height: 68,
          display: "flex",
        }}
      >
        <Tabs
          value={tabValue}
          onChange={(_, v) => navigate({ to: NAV_ITEMS[v]?.path })}
          TabIndicatorProps={{ style: { display: "none" } }}
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
              color: "#191919",
              textTransform: "none",
              height: 68,
              minHeight: 68,
              paddingLeft: 0,
              paddingRight: "24px",
            },
            "& .MuiTab-root.Mui-selected": { color: "#e30613" },
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
