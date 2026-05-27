import { Box, type SxProps, type Theme } from "@mui/material";
import { type ReactNode } from "react";

function getVersionString(): string {
  return `Frontend v${__FRONTEND_VERSION__} | Core v${__CORE_VERSION__}`;
}

interface AppFooterProps {
  children?: ReactNode;
  sx?: SxProps<Theme>;
}

export function AppFooter({ children, sx }: AppFooterProps) {
  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#191919",
        color: "rgba(255,255,255,0.8)",
        position: "relative",
        flexShrink: 0,
        px: { xs: "20px", md: "28px" },
        minHeight: 28,
        ...(children && { py: 2.5 }),
        ...sx,
      }}
    >
      {children}
      <Box
        component="span"
        sx={{
          position: "absolute",
          right: "12px",
          bottom: "4px",
          fontSize: "0.75rem",
          opacity: 0.8,
        }}
      >
        {getVersionString()}
      </Box>
    </Box>
  );
}
