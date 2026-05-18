import { createTheme } from "@mui/material/styles";

const headingFont = "'Nunito', 'Manrope', 'Segoe UI', sans-serif";
const bodyFont = "'Manrope', 'Segoe UI', sans-serif";
const noShadows = Array.from({ length: 25 }, () => "none");

const appTheme = createTheme({
  shadows: noShadows,
  palette: {
    mode: "light",
    primary: {
      main: "#c8a24c",
      light: "#d7ba79",
      dark: "#a8832f",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#ece6d8",
      light: "#f5f2ea",
      dark: "#d9d1bf",
      contrastText: "#2f2b24",
    },
    info: {
      main: "#b9a37a",
      light: "#e9dfce",
      dark: "#927a4f",
    },
    warning: {
      main: "#d5a86c",
      light: "#eed8ba",
      dark: "#b17e3e",
    },
    success: {
      main: "#22c55e",
      light: "#dcfce7",
      dark: "#16a34a",
      contrastText: "#ffffff",
    },
    background: {
      default: "#f6f4ef",
      paper: "#ffffff",
    },
    text: {
      primary: "#0f172a",
      secondary: "#6b7280",
    },
    divider: "#e4dfd4",
  },
  shape: {
    borderRadius: 12,
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
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          boxShadow: "none !important",
          backgroundImage: "none",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "none !important",
          border: "1px solid #e7e2d8",
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          boxShadow: "none !important",
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: "none !important",
          backgroundImage: "none",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          boxShadow: "none !important",
          border: "1px solid #e4dfd4",
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          boxShadow: "none !important",
          border: "1px solid #e4dfd4",
        },
      },
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          boxShadow: "none !important",
          border: "1px solid #e4dfd4",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 10,
          fontWeight: 600,
          letterSpacing: "0.01em",
          boxShadow: "none !important",
        },
        containedPrimary: {
          backgroundColor: "#c8a24c",
          color: "#ffffff",
          "&:hover": {
            backgroundColor: "#b89240",
            boxShadow: "none !important",
          },
        },
        containedSecondary: {
          backgroundColor: "#ece6d8",
          color: "#2f2b24",
          "&:hover": {
            backgroundColor: "#e3dbc9",
            boxShadow: "none !important",
          },
        },
        outlined: {
          borderColor: "#d6d0c3",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 500,
          borderColor: "#e4dfd4",
          backgroundColor: "#f7f4ee",
        },
        colorSecondary: {
          backgroundColor: "#f1e7cf",
          color: "#6a5324",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#ffffff",
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c8a24c",
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#c8a24c",
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderColor: "#e4dfd4",
          "&.Mui-selected": {
            backgroundColor: "#f1e7cf",
            color: "#6a5324",
            "&:hover": {
              backgroundColor: "#eadcb8",
            },
          },
        },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: "#f6f4ef",
          color: "#0f172a",
        },
        "*, *::before, *::after": {
          boxShadow: "none !important",
        },
      },
    },
  },
});

export default appTheme;
