import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuthStore } from "../store/authStore";
import { useAuthBootstrap } from "../hooks/useAuthBootstrap";

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const { checking } = useAuthBootstrap();
  const location = useLocation();

  if (checking) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
    const currentRole = String(user?.role || "").trim().toLowerCase();
    const normalizedAllowedRoles = allowedRoles.map((role) => String(role || "").trim().toLowerCase());

    if (!normalizedAllowedRoles.includes(currentRole)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
