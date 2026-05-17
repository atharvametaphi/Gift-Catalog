import { Box } from "@mui/material";

const GridSquaresIcon = ({ size = 16, columns = 3 }) => (
  <Box
    sx={{
      width: size,
      height: size,
      display: "grid",
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: "1px",
    }}
  >
    {Array.from({ length: columns * columns }).map((_, index) => (
      <Box key={index} sx={{ bgcolor: "currentColor", borderRadius: "1px", opacity: 0.92 }} />
    ))}
  </Box>
);

export default GridSquaresIcon;

