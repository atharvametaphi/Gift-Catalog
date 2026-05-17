import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import CustomButton from "../components/CustomButton";
import { authService } from "../services/authService";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
  const navigate = useNavigate();
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const [submitting, setSubmitting] = useState(false);
  const [errorText, setErrorText] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values) => {
    setSubmitting(true);
    setErrorText("");

    try {
      const data = await authService.login(values);
      loginSuccess({ token: data.token, user: data.user });
      navigate("/dashboard", { replace: true });
    } catch (error) {
      if (error?.response?.data?.message) {
        setErrorText(error.response.data.message);
      } else if (error?.code === "ERR_NETWORK") {
        setErrorText("Cannot reach backend API. Verify the backend server is running.");
      } else {
        setErrorText("Unable to login. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: "100vh" }}>
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "grid",
          placeItems: "center",
          p: { xs: 3, md: 6 },
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 460 }}>
          <Typography variant="h4" sx={{ mb: 1.5 }}>
            Gift Catalog Admin
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to manage corporate gifting categories, items, and catalog exports.
          </Typography>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            <Card>
              <CardContent sx={{ p: 3 }}>
                <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
                  <TextField
                    label="Email"
                    type="email"
                    fullWidth
                    margin="normal"
                    autoComplete="email"
                    {...register("email", {
                      required: "Email is required",
                    })}
                    error={Boolean(errors.email)}
                    helperText={errors.email?.message}
                  />
                  <TextField
                    label="Password"
                    type="password"
                    fullWidth
                    margin="normal"
                    autoComplete="current-password"
                    {...register("password", {
                      required: "Password is required",
                    })}
                    error={Boolean(errors.password)}
                    helperText={errors.password?.message}
                  />

                  <CustomButton type="submit" fullWidth sx={{ mt: 2.5, py: 1.2 }} disabled={submitting}>
                    {submitting ? <CircularProgress size={22} color="inherit" /> : "Login"}
                  </CustomButton>
                </Box>
              </CardContent>
            </Card>
          </motion.div>
        </Box>
      </Grid>

      <Grid
        item
        xs={false}
        md={6}
        sx={{
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          p: 8,
          background: "linear-gradient(160deg, #ddd6fe 0%, #bae6fd 52%, #bbf7d0 100%)",
        }}
      >
        <Box sx={{ maxWidth: 460 }}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 1.5 }}>
            Corporate Gifting Catalog
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage categories, organize product visuals, and generate polished catalog PDFs from a single admin workspace.
          </Typography>
        </Box>
      </Grid>

      <Snackbar open={Boolean(errorText)} autoHideDuration={3000} onClose={() => setErrorText("")}>
        <Alert severity="error" variant="filled" onClose={() => setErrorText("")}>
          {errorText}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export default LoginPage;
