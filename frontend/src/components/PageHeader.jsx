import { Box, Typography } from "@mui/material";

const PageHeader = ({ title, subtitle, eyebrow = "Curated Gifting Studio" }) => (
  <Box sx={{ mb: 3 }}>
    <Typography
      variant="caption"
      sx={{
        color: "text.secondary",
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        display: "inline-block",
        mb: 0.45,
      }}
    >
      {eyebrow}
    </Typography>
    <Typography variant="h3" sx={{ lineHeight: 1.06 }}>
      {title}
    </Typography>
    {subtitle ? (
      <Typography variant="body1" color="text.secondary" sx={{ mt: 0.65, maxWidth: 760 }}>
        {subtitle}
      </Typography>
    ) : null}
  </Box>
);

export default PageHeader;
