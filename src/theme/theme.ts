import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    error: {
      main: "#C1272D",
      dark: "#9B1F24",
    },
  },
  typography: {
    fontFamily: '"Open Sans", sans-serif',
    allVariants: {
      color: "#191919",
    },
    h1: { fontSize: 48, fontWeight: 700, lineHeight: "58px" },
    h2: { fontSize: 36, fontWeight: 700, lineHeight: "46px" },
    h3: { fontSize: 24, fontWeight: 400, lineHeight: "32px" },
    h4: { fontSize: 36, fontWeight: 700, lineHeight: "46px" },
    h5: { fontSize: 24, fontWeight: 400, lineHeight: "32px" },
    h6: { fontSize: 18, fontWeight: 700, lineHeight: "28px" },
    subtitle1: { fontSize: 16, fontWeight: 400, lineHeight: "26px" },
    subtitle2: { fontSize: 16, fontWeight: 400, lineHeight: "26px" },
    body1: { fontSize: 16, fontWeight: 400, lineHeight: "26px" },
    body2: { fontSize: 14, fontWeight: 400, lineHeight: "22px" },
    caption: { fontSize: 14, fontWeight: 400, lineHeight: "22px" },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        @import url('https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;500;600;700&display=swap');
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
