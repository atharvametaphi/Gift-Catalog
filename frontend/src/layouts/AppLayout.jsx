import { useEffect, useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Collapse,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuRoundedIconRaw from "@mui/icons-material/MenuRounded";
import KeyboardArrowDownRoundedIconRaw from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIconRaw from "@mui/icons-material/KeyboardArrowRightRounded";
import KeyboardDoubleArrowLeftRoundedIconRaw from "@mui/icons-material/KeyboardDoubleArrowLeftRounded";
import KeyboardDoubleArrowRightRoundedIconRaw from "@mui/icons-material/KeyboardDoubleArrowRightRounded";
import LogoutOutlinedIconRaw from "@mui/icons-material/LogoutOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import BreadcrumbTrail from "../components/BreadcrumbTrail";
import { sidebarNavigation } from "../constants/navigation";
import { useAuthStore } from "../store/authStore";
import { useCatalogStore } from "../store/catalogStore";
import resolveIconComponent from "../utils/resolveIconComponent";

const MenuRoundedIcon = resolveIconComponent(MenuRoundedIconRaw);
const KeyboardArrowDownRoundedIcon = resolveIconComponent(KeyboardArrowDownRoundedIconRaw);
const KeyboardArrowRightRoundedIcon = resolveIconComponent(KeyboardArrowRightRoundedIconRaw);
const KeyboardDoubleArrowLeftRoundedIcon = resolveIconComponent(KeyboardDoubleArrowLeftRoundedIconRaw);
const KeyboardDoubleArrowRightRoundedIcon = resolveIconComponent(KeyboardDoubleArrowRightRoundedIconRaw);
const LogoutOutlinedIcon = resolveIconComponent(LogoutOutlinedIconRaw);
const MotionBox = motion(Box);

const expandedDrawerWidth = 284;
const collapsedDrawerWidth = 96;
const isPathMatch = (pathname, targetPath) =>
  Boolean(targetPath) && (pathname === targetPath || pathname.startsWith(`${targetPath}/`));
const isGroupChildMatch = (pathname, item) =>
  Array.isArray(item.children) && item.children.some((child) => isPathMatch(pathname, child.path));

const AppLayout = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [openGroups, setOpenGroups] = useState(() => {
    const nextState = {};

    sidebarNavigation.forEach((item) => {
      if (item.type !== "group") {
        return;
      }

      nextState[item.key] = (item.path ? isPathMatch(location.pathname, item.path) : false) || isGroupChildMatch(location.pathname, item);
    });

    return nextState;
  });
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const loadCatalogData = useCatalogStore((state) => state.loadCatalogData);

  useEffect(() => {
    setOpenGroups((previous) => {
      let hasChanges = false;
      const nextState = { ...previous };

      sidebarNavigation.forEach((item) => {
        if (item.type !== "group") {
          return;
        }

        const shouldOpen = (item.path ? isPathMatch(location.pathname, item.path) : false) || isGroupChildMatch(location.pathname, item);

        if (typeof nextState[item.key] !== "boolean") {
          nextState[item.key] = shouldOpen;
          hasChanges = true;
          return;
        }

        if (shouldOpen && !nextState[item.key]) {
          nextState[item.key] = true;
          hasChanges = true;
        }
      });

      return hasChanges ? nextState : previous;
    });
  }, [location.pathname]);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadCatalogData();
  }, [token, loadCatalogData]);

  const pageTitle = useMemo(() => {
    for (const item of sidebarNavigation) {
      if (item.type === "group") {
        const child = item.children.find((childNode) => isPathMatch(location.pathname, childNode.path));
        if (child) {
          return child.label;
        }

        if (item.path && isPathMatch(location.pathname, item.path)) {
          return item.label;
        }

        continue;
      }

      if (isPathMatch(location.pathname, item.path)) {
        return item.label;
      }
    }

    return "Gift Catalog";
  }, [location.pathname]);

  const drawerWidth = isMobile ? expandedDrawerWidth : desktopCollapsed ? collapsedDrawerWidth : expandedDrawerWidth;

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const navBaseStyles = {
    borderRadius: "12px",
    mb: 0.5,
    minHeight: 44,
    px: 1.4,
    color: "text.secondary",
    transition: "all 0.22s ease",
    "&:hover": {
      bgcolor: alpha(theme.palette.primary.main, 0.18),
      color: "text.primary",
    },
    "&.Mui-selected": {
      bgcolor: alpha(theme.palette.primary.main, 0.28),
      color: "text.primary",
      boxShadow: `0 10px 22px ${alpha(theme.palette.primary.main, 0.28)}`,
    },
  };

  const renderPrimaryItem = (item) => {
    const Icon = item.icon;
    const primaryActive =
      item.type === "group"
        ? (item.path ? isPathMatch(location.pathname, item.path) : false) || isGroupChildMatch(location.pathname, item)
        : isPathMatch(location.pathname, item.path);
    const showTooltip = desktopCollapsed && !isMobile;

    if (item.type === "group") {
      const isOpen = Boolean(openGroups[item.key]);
      const button = (
        <ListItemButton
          onClick={() => {
            setOpenGroups((previous) => ({ ...previous, [item.key]: !previous[item.key] }));
            if (item.path) {
              navigate(item.path);
              if (isMobile) {
                setMobileOpen(false);
              }
            }
          }}
          selected={primaryActive}
          sx={navBaseStyles}
        >
          <ListItemIcon sx={{ minWidth: 36, color: primaryActive ? "text.primary" : "inherit" }}>
            <Icon fontSize="small" />
          </ListItemIcon>
          {(!desktopCollapsed || isMobile) && (
            <Box sx={{ width: "100%" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{ fontSize: 14, fontWeight: primaryActive ? 700 : 600 }}
                />
                {isOpen ? <KeyboardArrowDownRoundedIcon fontSize="small" /> : <KeyboardArrowRightRoundedIcon fontSize="small" />}
              </Stack>
            </Box>
          )}
        </ListItemButton>
      );

      return (
        <Box key={item.key}>
          {showTooltip ? <Tooltip title={item.label} placement="right">{button}</Tooltip> : button}
          <Collapse in={isOpen && (!desktopCollapsed || isMobile)} timeout={200} unmountOnExit>
            <List disablePadding sx={{ pl: 2.1, py: 0.35 }}>
              {item.children.map((child) => {
                const ChildIcon = child.icon;
                const childActive = isPathMatch(location.pathname, child.path);

                return (
                  <ListItemButton
                    key={child.key}
                    component={RouterLink}
                    to={child.path}
                    selected={childActive}
                    onClick={() => isMobile && setMobileOpen(false)}
                    sx={{
                      borderRadius: "10px",
                      mb: 0.35,
                      py: 0.45,
                      minHeight: 36,
                      color: "text.secondary",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.secondary.main, 0.25),
                        color: "text.primary",
                      },
                      "&.Mui-selected": {
                        bgcolor: alpha(theme.palette.primary.main, 0.22),
                        color: "text.primary",
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 31, color: childActive ? "text.primary" : "inherit" }}>
                      <ChildIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText
                      primary={child.label}
                      primaryTypographyProps={{ fontSize: 13, fontWeight: childActive ? 700 : 500 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Collapse>
        </Box>
      );
    }

    const linkButton = (
      <ListItemButton
        component={RouterLink}
        to={item.path}
        selected={primaryActive}
        onClick={() => isMobile && setMobileOpen(false)}
        sx={navBaseStyles}
      >
        <ListItemIcon sx={{ minWidth: 36, color: primaryActive ? "text.primary" : "inherit" }}>
          <Icon fontSize="small" />
        </ListItemIcon>
        {(!desktopCollapsed || isMobile) && (
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{ fontSize: 14, fontWeight: primaryActive ? 700 : 600 }}
          />
        )}
      </ListItemButton>
    );

    return (
      <Box key={item.key}>
        {showTooltip ? (
          <Tooltip title={item.label} placement="right">
            {linkButton}
          </Tooltip>
        ) : (
          linkButton
        )}
      </Box>
    );
  };

  const drawerContent = (
    <Box sx={{ height: "100%", px: isMobile ? 0 : 1.2, py: isMobile ? 0 : 1.5 }}>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: alpha(theme.palette.background.paper, 0.92),
          border: "1px solid",
          borderColor: "divider",
          borderRadius: isMobile ? 0 : "16px",
          backdropFilter: "blur(12px)",
          boxShadow: isMobile ? "none" : `0 24px 52px ${alpha(theme.palette.primary.main, 0.2)}`,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={desktopCollapsed && !isMobile ? "center" : "space-between"}
          sx={{ px: 2.3, py: 2.2 }}
        >
          {(!desktopCollapsed || isMobile) && (
            <Box>
              <Typography variant="h6" sx={{ lineHeight: 1, mb: 0.4 }}>
                Gift Catalog
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.16em", textTransform: "uppercase" }}>
                Curated Collections
              </Typography>
            </Box>
          )}
        </Stack>
        <Divider />
        <List sx={{ px: 1.3, py: 1.1, flex: 1 }}>{sidebarNavigation.map((item) => renderPrimaryItem(item))}</List>
        <Divider />
        <Box sx={{ p: 1.25 }}>
          <Tooltip title={desktopCollapsed && !isMobile ? "Logout" : ""} placement="right">
            <ListItemButton onClick={handleLogout} sx={{ ...navBaseStyles, mb: 0 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              {(!desktopCollapsed || isMobile) && (
                <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
              )}
            </ListItemButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar
        position="fixed"
        color="transparent"
        elevation={0}
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          transition: "all 0.24s ease",
          bgcolor: "transparent",
          boxShadow: "none",
          pt: { lg: 1.4 },
        }}
      >
        <Toolbar
          sx={{
            minHeight: "70px !important",
            justifyContent: "space-between",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 4,
            mx: { xs: 1.2, md: 2.1 },
            px: { xs: 1.2, sm: 1.8 },
            bgcolor: alpha(theme.palette.background.paper, 0.88),
            backdropFilter: "blur(12px)",
            boxShadow: `0 12px 30px ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Stack direction="row" spacing={1.1} alignItems="center">
            {isMobile ? (
              <IconButton edge="start" onClick={() => setMobileOpen(true)}>
                <MenuRoundedIcon />
              </IconButton>
            ) : (
              <IconButton edge="start" onClick={() => setDesktopCollapsed((prev) => !prev)}>
                {desktopCollapsed ? <KeyboardDoubleArrowRightRoundedIcon /> : <KeyboardDoubleArrowLeftRoundedIcon />}
              </IconButton>
            )}
            <Typography variant="h5" sx={{ lineHeight: 1 }}>
              {pageTitle}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1.25} alignItems="center">
            <Avatar sx={{ width: 34, height: 34, bgcolor: "primary.main", color: "primary.contrastText", fontSize: 14 }}>
              {(user?.name || "A").charAt(0).toUpperCase()}
            </Avatar>
            <Typography variant="body2" sx={{ display: { xs: "none", sm: "block" }, fontWeight: 600 }}>
              {user?.name || "Admin"}
            </Typography>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: 0,
              bgcolor: "transparent",
              transition: "width 0.24s ease",
              overflow: "visible",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3.3 }, mt: { xs: "72px", lg: "102px" }, minWidth: 0 }}>
        <BreadcrumbTrail />
        <AnimatePresence mode="wait">
          <MotionBox
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: "easeOut" }}
          >
            <Outlet />
          </MotionBox>
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default AppLayout;
