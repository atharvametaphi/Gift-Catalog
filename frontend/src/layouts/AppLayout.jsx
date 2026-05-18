import { useEffect, useMemo, useState } from "react";
import {
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
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import MenuRoundedIconRaw from "@mui/icons-material/MenuRounded";
import KeyboardArrowDownRoundedIconRaw from "@mui/icons-material/KeyboardArrowDownRounded";
import KeyboardArrowRightRoundedIconRaw from "@mui/icons-material/KeyboardArrowRightRounded";
import LogoutOutlinedIconRaw from "@mui/icons-material/LogoutOutlined";
import { alpha, useTheme } from "@mui/material/styles";
import { AnimatePresence, motion } from "framer-motion";
import { Link as RouterLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { sidebarNavigation } from "../constants/navigation";
import { useAuthStore } from "../store/authStore";
import { useCatalogStore } from "../store/catalogStore";
import resolveIconComponent from "../utils/resolveIconComponent";

const MenuRoundedIcon = resolveIconComponent(MenuRoundedIconRaw);
const KeyboardArrowDownRoundedIcon = resolveIconComponent(KeyboardArrowDownRoundedIconRaw);
const KeyboardArrowRightRoundedIcon = resolveIconComponent(KeyboardArrowRightRoundedIconRaw);
const LogoutOutlinedIcon = resolveIconComponent(LogoutOutlinedIconRaw);
const MotionBox = motion(Box);

const expandedDrawerWidth = 284;
const isPathMatch = (pathname, targetPath) =>
  Boolean(targetPath) && (pathname === targetPath || pathname.startsWith(`${targetPath}/`));
const isGroupChildMatch = (pathname, item) =>
  Array.isArray(item.children) && item.children.some((child) => isPathMatch(pathname, child.path));
const hasRoleAccess = (item, currentRole) => {
  const allowedRoles = Array.isArray(item?.allowedRoles) ? item.allowedRoles : [];

  if (allowedRoles.length === 0) {
    return true;
  }

  return allowedRoles.map((role) => String(role || "").trim().toLowerCase()).includes(currentRole);
};

const AppLayout = () => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
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
  const currentRole = String(user?.role || "viewer").trim().toLowerCase();
  const navigationItems = useMemo(
    () =>
      sidebarNavigation
        .map((item) => {
          if (!hasRoleAccess(item, currentRole)) {
            return null;
          }

          if (item.type !== "group") {
            return item;
          }

          const children = Array.isArray(item.children)
            ? item.children.filter((child) => hasRoleAccess(child, currentRole))
            : [];

          if (children.length === 0 && !item.path) {
            return null;
          }

          return {
            ...item,
            children,
          };
        })
        .filter(Boolean),
    [currentRole],
  );

  useEffect(() => {
    setOpenGroups((previous) => {
      let hasChanges = false;
      const nextState = { ...previous };

      navigationItems.forEach((item) => {
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
  }, [location.pathname, navigationItems]);

  useEffect(() => {
    if (!token) {
      return;
    }

    loadCatalogData();
  }, [token, loadCatalogData]);

  const drawerWidth = expandedDrawerWidth;
  const profileMenuOpen = Boolean(profileAnchorEl);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
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
      boxShadow: "none",
    },
  };

  const renderPrimaryItem = (item) => {
    const Icon = item.icon;
    const primaryActive =
      item.type === "group"
        ? (item.path ? isPathMatch(location.pathname, item.path) : false) || isGroupChildMatch(location.pathname, item)
        : isPathMatch(location.pathname, item.path);
    const showTooltip = false;

    if (item.type === "group") {
      const isOpen = Boolean(openGroups[item.key]);
      const button = (
        <ListItemButton
          onClick={() => {
            setOpenGroups((previous) => ({ ...previous, [item.key]: !previous[item.key] }));
            const hasChildren = Array.isArray(item.children) && item.children.length > 0;
            if (item.path && !hasChildren) {
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
          <Box sx={{ width: "100%" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: primaryActive ? 700 : 600 }}
              />
              {isOpen ? <KeyboardArrowDownRoundedIcon fontSize="small" /> : <KeyboardArrowRightRoundedIcon fontSize="small" />}
            </Stack>
          </Box>
        </ListItemButton>
      );

      return (
        <Box key={item.key}>
          {showTooltip ? <Tooltip title={item.label} placement="right">{button}</Tooltip> : button}
          <Collapse in={isOpen} timeout={200} unmountOnExit>
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
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: 14, fontWeight: primaryActive ? 700 : 600 }}
        />
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
    <Box sx={{ height: "100%", px: 0, py: 0 }}>
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          bgcolor: theme.palette.background.paper,
          borderRight: "1px solid",
          borderColor: "divider",
          borderRadius: 0,
          backdropFilter: "none",
          boxShadow: "none",
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2.3, py: 2.2 }}
        >
          <Box>
            <Typography variant="h6" sx={{ lineHeight: 1, mb: 0.4 }}>
              Gift Catalog
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.16em", textTransform: "uppercase" }}>
              Curated Collections
            </Typography>
          </Box>
        </Stack>
        <Divider />
        <List sx={{ px: 1.3, py: 1.1, flex: 1 }}>{navigationItems.map((item) => renderPrimaryItem(item))}</List>
        <Divider />
        <Box sx={{ p: 1.25 }}>
          <Tooltip title="" placement="right">
            <ListItemButton sx={{ ...navBaseStyles, mb: 0 }} onClick={handleProfileMenuOpen}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Avatar sx={{ width: 30, height: 30, bgcolor: "primary.main", color: "primary.contrastText", fontSize: 13 }}>
                  {(user?.name || "A").charAt(0).toUpperCase()}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={user?.name || "Admin"}
                secondary={user?.email || "admin@giftcatalog.com"}
                primaryTypographyProps={{ fontSize: 13, fontWeight: 600 }}
                secondaryTypographyProps={{ fontSize: 11 }}
              />
            </ListItemButton>
          </Tooltip>
          <Menu
            anchorEl={profileAnchorEl}
            open={profileMenuOpen}
            onClose={handleProfileMenuClose}
            anchorOrigin={{ vertical: "top", horizontal: "left" }}
            transformOrigin={{ vertical: "bottom", horizontal: "left" }}
            keepMounted
            PaperProps={{
              elevation: 0,
              sx: {
                border: "1px solid",
                borderColor: "divider",
                minWidth: 132,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                handleProfileMenuClose();
                handleLogout();
              }}
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <LogoutOutlinedIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" primaryTypographyProps={{ fontSize: 14, fontWeight: 600 }} />
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant={isMobile ? "temporary" : "permanent"}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          PaperProps={{ elevation: 0 }}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              borderRight: 0,
              bgcolor: theme.palette.background.paper,
              boxShadow: "none",
              transition: "width 0.24s ease",
              overflow: "hidden",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {isMobile ? (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: "fixed",
            top: 10,
            left: 10,
            zIndex: theme.zIndex.drawer + 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: theme.palette.background.paper,
            backdropFilter: "none",
          }}
        >
          <MenuRoundedIcon />
        </IconButton>
      ) : null}

      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 3.3 }, mt: 0, minWidth: 0 }}>
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
