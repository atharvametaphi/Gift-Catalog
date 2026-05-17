import { Box, CircularProgress } from "@mui/material";

const Loader = ({ minHeight = 240 }) => (
  <Box sx={{ minHeight, display: "grid", placeItems: "center" }}>
    <CircularProgress />
  </Box>
);

export default Loader;

