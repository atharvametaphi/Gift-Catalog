import NavigateNextIconRaw from "@mui/icons-material/NavigateNext";
import { Breadcrumbs, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { Link } from "@mui/material";
import { breadcrumbLabelMap } from "../constants/navigation";
import resolveIconComponent from "../utils/resolveIconComponent";

const NavigateNextIcon = resolveIconComponent(NavigateNextIconRaw);

const BreadcrumbTrail = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  return (
    <Breadcrumbs
      separator={<NavigateNextIcon fontSize="small" sx={{ color: "text.disabled" }} />}
      sx={{
        mb: 2.3,
        "& .MuiBreadcrumbs-li": {
          fontSize: 13,
          letterSpacing: "0.03em",
        },
      }}
    >
      <Link component={RouterLink} color="text.secondary" underline="hover" to="/dashboard">
        Home
      </Link>
      {segments.map((segment, index) => {
        const to = `/${segments.slice(0, index + 1).join("/")}`;
        const isLast = index === segments.length - 1;
        const label = breadcrumbLabelMap[segment] || segment.replace(/-/g, " ");

        if (isLast) {
          return (
            <Typography key={to} color="text.primary" sx={{ textTransform: "capitalize" }}>
              {label}
            </Typography>
          );
        }

        return (
          <Link key={to} component={RouterLink} color="text.secondary" underline="hover" to={to}>
            {label}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbTrail;
