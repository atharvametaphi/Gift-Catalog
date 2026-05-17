import React from "react";
import { Alert, Box, Typography } from "@mui/material";

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      message: error?.message || "Unexpected UI runtime error.",
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI runtime crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ p: 3.5 }}>
          <Alert severity="error" variant="filled" sx={{ mb: 1.8 }}>
            The UI crashed while rendering this page.
          </Alert>
          <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
            {this.state.message}
          </Typography>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;

