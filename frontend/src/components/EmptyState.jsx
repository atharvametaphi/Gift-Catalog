import { Box, Typography } from "@mui/material";

const EmptyState = ({ title, description }) => (
  <Box
    sx={{
      p: 5,
      borderRadius: 3,
      border: "1px dashed",
      borderColor: "divider",
      bgcolor: "background.paper",
      textAlign: "center",
    }}
  >
    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Box>
);

export default EmptyState;

