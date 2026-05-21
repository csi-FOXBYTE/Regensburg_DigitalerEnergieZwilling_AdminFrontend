import { useCurrentUser } from "@/hooks/useCurrentUser";
import theme from "@/theme/theme";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useNavigate, useRouterState } from "@tanstack/react-router";

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

  const tabValue = getTabValue(pathname);

  return (
    <Box
      sx={{
        bgcolor: "white",
        borderBottom: 1,
        borderColor: "divider",
        position: "sticky",
        top: 0,
        zIndex: 10,
        boxShadow: "0px 4px 10px 0px rgba(0, 0, 0, 0.12)",
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
          borderBottom: "2px solid rgb(229, 229, 229)",
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
          <Typography
            sx={{ fontSize: 14, lineHeight: "22px", color: "#757575" }}
          >
            {currentUser?.preferred_username}
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
          sx={{
            height: 68,
            minHeight: 68,
            "& .MuiTabs-indicator": {
              backgroundColor: "error.main",
              height: 3,
              left: 0,
              right: "24px",
            },
            "& .MuiTab-root": {
              fontSize: 16,
              lineHeight: "26px",
              color: "#191919",
              textTransform: "none",
              height: 68,
              minHeight: 68,
              paddingLeft: 0,
              paddingRight: 0,
              transition: "color 0.2s",
              "&:hover": {
                color: "#e30613",
              },
            },
            "& .MuiTab-root.Mui-selected": { color: "#e30613" },
            "& .MuiTabs-flexContainer": {
              gap: "24px",
            },
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
