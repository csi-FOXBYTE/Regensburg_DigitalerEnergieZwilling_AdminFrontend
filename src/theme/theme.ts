import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    error: {
      main: "#e30613",
      dark: "#8b2412",
    },
  },
  typography: {
    fontFamily: '"Open Sans", sans-serif',
    allVariants: {
      color: "#191919",
    },
    h1: { fontSize: 48, fontWeight: "bold", lineHeight: "58px" },
    h2: { fontSize: 36, fontWeight: "bold", lineHeight: "46px" },
    h3: { fontSize: 24, fontWeight: "normal", lineHeight: "32px" },
    h4: { fontSize: 18, fontWeight: "bold", lineHeight: "28px" },
    h5: { fontSize: 24, fontWeight: "normal", lineHeight: "30px" }, // Anleser
    body1: { fontSize: 16, fontWeight: "normal", lineHeight: "26px" }, // Fließtext
    body2: { fontSize: 14, fontWeight: "normal", lineHeight: "22px" }, // Fließtext klein
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        body { font-family: "Open Sans", sans-serif; color: #191919; }
      `,
    },
    MuiOutlinedInput: {
      styleOverrides: {
        inputSizeSmall: {
          paddingTop: "4px",
          paddingBottom: "4px",
          paddingLeft: "8px",
          paddingRight: "8px",
          fontSize: "0.875rem",
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: "#e30613",
          "&.Mui-checked": {
            color: "#e30613",
          },
        },
      },
    },
    MuiFormControlLabel: {
      styleOverrides: {
        label: {
          fontSize: "0.875rem",
          lineHeight: "22px",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontFamily: '"Open Sans", sans-serif',
          fontSize: 16,
          lineHeight: "26px",
          fontWeight: 400,
          borderRadius: 2,
        },
        sizeMedium: {
          paddingLeft: "29px",
          paddingRight: "20px",
          paddingTop: "9px",
          paddingBottom: "9px",
        },
        sizeLarge: {
          paddingLeft: "29px",
          paddingRight: "20px",
          paddingTop: "9px",
          paddingBottom: "9px",
        },
        sizeSmall: {
          paddingLeft: "16px",
          paddingRight: "12px",
        },
      },
    },
  },
});

export default theme;
