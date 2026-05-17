import { createTheme } from "@mui/material/styles";

const headingFont = "'Nunito', 'Manrope', 'Segoe UI', sans-serif";
const bodyFont = "'Manrope', 'Segoe UI', sans-serif";

const appTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#c4b5fd",
      light: "#ddd6fe",
      dark: "#a78bfa",
      contrastText: "#3f3a54",
    },
    secondary: {
      main: "#bae6fd",
      light: "#e0f2fe",
      dark: "#7dd3fc",
      contrastText: "#27546b",
    },
    info: {
      main: "#fbcfe8",
      light: "#fce7f3",
      dark: "#f9a8d4",
    },
    warning: {
      main: "#fed7aa",
      light: "#ffedd5",
      dark: "#fdba74",
    },
    success: {
      main: "#bbf7d0",
      light: "#dcfce7",
      dark: "#86efac",
      contrastText: "#1f5135",
    },
    background: {
      default: "#fafaf9",
      paper: "#ffffff",
    },
    text: {
      primary: "#44403c",
      secondary: "#78716c",
    },
    divider: "#d6d3d1",
  },
  shape: {
    borderRadius: 14,
  },
  typography: {
    fontFamily: bodyFont,
    h1: {
      fontFamily: headingFont,
      fontWeight: 600,
      letterSpacing: "0.01em",
      lineHeight: 1.1,
    },
    h2: {
      fontFamily: headingFont,
      fontWeight: 600,
      letterSpacing: "0.01em",
      lineHeight: 1.14,
    },
    h3: {
      fontFamily: headingFont,
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    h4: {
      fontFamily: headingFont,
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    h5: {
      fontFamily: headingFont,
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    h6: {
      fontFamily: headingFont,
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    subtitle1: {
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    body1: {
      lineHeight: 1.7,
    },
    body2: {
      lineHeight: 1.7,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 18,
          boxShadow: "0 10px 30px rgba(167, 139, 250, 0.14)",
          borderColor: "#e7e5e4",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 14,
          fontWeight: 600,
          letterSpacing: "0.01em",
          boxShadow: "none",
        },
        containedPrimary: {
          backgroundColor: "#c4b5fd",
          color: "#3f3a54",
          "&:hover": {
            backgroundColor: "#b8a4fb",
            boxShadow: "0 8px 18px rgba(196, 181, 253, 0.34)",
          },
        },
        containedSecondary: {
          backgroundColor: "#bae6fd",
          color: "#27546b",
          "&:hover": {
            backgroundColor: "#a7dcfa",
            boxShadow: "0 8px 18px rgba(186, 230, 253, 0.34)",
          },
        },
        outlined: {
          borderColor: "#d6d3d1",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 500,
          borderColor: "#e7e5e4",
          backgroundColor: "#fafaf9",
        },
        colorSecondary: {
          backgroundColor: "#ddd6fe",
          color: "#4c3f73",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 14,
          backgroundColor: "#ffffff",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c4b5fd",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c4b5fd",
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: "#e7e5e4",
          "&.Mui-selected": {
            backgroundColor: "#ede9fe",
            color: "#5b49a5",
            "&:hover": {
              backgroundColor: "#ddd6fe",
            },
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background:
            "radial-gradient(circle at 12% 8%, rgba(196,181,253,0.22), transparent 34%), radial-gradient(circle at 88% 10%, rgba(186,230,253,0.26), transparent 32%), radial-gradient(circle at 50% 100%, rgba(187,247,208,0.22), transparent 34%), #fafaf9",
          color: "#44403c",
        },
      },
    },
  },
});

export default appTheme;
