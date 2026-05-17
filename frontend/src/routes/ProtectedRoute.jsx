import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Box, CircularProgress } from "@mui/material";
import { useAuthStore } from "../store/authStore";
import { useAuthBootstrap } from "../hooks/useAuthBootstrap";

const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.token);
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

  return <Outlet />;
};

export default ProtectedRoute;
