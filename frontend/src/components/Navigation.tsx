// ClientApp/src/components/Navigation.tsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  useMediaQuery,
  useTheme as useMuiTheme,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Flight as FlightIcon,
  LocalTaxi as PickupIcon,
  Person as ProfileIcon,
  Home as HomeIcon,
  AdminPanelSettings as AdminIcon,
  Message as MessageIcon,
} from "@mui/icons-material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAppSelector, useAppDispatch } from "../store/hooks";
import { clearAuth } from "../store/slices/authSlice";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageSwitcher } from "./LanguageSwitcher";

interface NavigationItem {
  textKey: string;
  path: string;
  icon: React.ReactElement;
  requiresAuth?: boolean;
}

interface NavigationProps {
  title?: string;
  items?: NavigationItem[];
}

const getDefaultItems = (isAdmin: boolean = false): NavigationItem[] => {
  const baseItems = [
    { textKey: "home", path: "/", icon: <HomeIcon /> },
    {
      textKey: "flightCompanion",
      path: "/flight-companion",
      icon: <FlightIcon />,
    },
    { textKey: "pickupService", path: "/pickup", icon: <PickupIcon /> },
  ];

  if (isAdmin) {
    // For admin users, show admin dashboard instead of profile
    return [
      ...baseItems,
      {
        textKey: "adminDashboard",
        path: "/admin",
        icon: <AdminIcon />,
        requiresAuth: true,
      }
    ];
  } else {
    // For regular users, show profile and messages
    return [
      ...baseItems,
      {
        textKey: "messages",
        path: "/messages",
        icon: <MessageIcon />,
        requiresAuth: true,
      },
      {
        textKey: "profile",
        path: "/profile",
        icon: <ProfileIcon />,
        requiresAuth: true,
      }
    ];
  }
};

export const Navigation: React.FC<NavigationProps> = ({
  title = "WingCompanion",
  items,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t } = useTranslation();
  const theme = useMuiTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Authentication state from Redux
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const user = useAppSelector((state) => state.auth.user);

  // Check if user is admin
  const isAdmin = React.useMemo(() => {
    if (!isAuthenticated || !user) return false;
    
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userRoles = payload?.role || 
                         payload?.roles || 
                         payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || 
                         [];
        return Array.isArray(userRoles) 
          ? userRoles.includes('Admin')
          : userRoles === 'Admin';
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
    return false;
  }, [isAuthenticated, user]);

  // Use default items if none provided, filtered by auth state and user role
  const allNavigationItems = items || getDefaultItems(isAdmin);
  const navigationItems = allNavigationItems.filter(
    (item) => !item.requiresAuth || isAuthenticated
  );

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    dispatch(clearAuth());
    navigate("/");
    setMobileOpen(false);
  };

  const drawer = (
    <Box sx={{ width: 250 }} onClick={handleDrawerToggle}>
      <List>
        {navigationItems.map((item: NavigationItem) => (
          <ListItem
            key={item.textKey}
            component={Link}
            to={item.path}
            className={`transition-colors duration-200 ${
              location.pathname === item.path
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "hover:bg-gray-50 dark:hover:bg-gray-800"
            }`}
            sx={{
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <ListItemIcon
              className={
                location.pathname === item.path
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-600 dark:text-gray-300"
              }
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={t(item.textKey)} className="font-medium" />
          </ListItem>
        ))}

        {/* Mobile Auth Buttons */}
        {!isAuthenticated ? (
          <>
            <ListItem
              component={Link}
              to="/login"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              <ListItemText primary={t("login")} />
            </ListItem>
            <ListItem
              component={Link}
              to="/register"
              sx={{ color: "inherit", textDecoration: "none" }}
            >
              <ListItemText primary={t("register")} />
            </ListItem>
          </>
        ) : (
          <ListItem button onClick={handleLogout}>
            <ListItemText primary={t("logout")} />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        className="shadow-sm border-b border-gray-200 text-color-primary bg-[#CBDDDF]"
        elevation={0}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              className="mr-2"
              sx={{ color: "var(--color-primary)" }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h6"
            component={Link}
            to="/"
            className="flex-grow font-bold no-underline transition-colors flex items-center"
            sx={{
              color: "var(--color-primary)",
              "&:hover": { color: "#061e4a" },
            }}
          >
            <img
              src="/images/logo.png"
              alt="WingCompanion Logo"
              style={{
                height: 40,
                marginRight: 12,
                display: "inline-block",
                verticalAlign: "middle",
              }}
            />
            {title}
          </Typography>

          {!isMobile && (
            <Box className="flex items-center space-x-1">
              {navigationItems.map((item: NavigationItem) => (
                <Button
                  key={item.textKey}
                  component={Link}
                  to={item.path}
                  className={`flex items-center space-x-2 px-5 py-2 text-sm font-medium transition-colors duration-200 no-underline ${
                    location.pathname === item.path
                      ? "bg-white/40" // subtle highlight for active
                      : "hover:bg-white/30"
                  }`}
                  sx={{ color: "var(--color-primary)" }}
                >
                  {item.icon}
                  <span>{t(item.textKey)}</span>
                </Button>
              ))}

              {/* Desktop Auth Section */}
              {!isAuthenticated ? (
                <Box className="flex items-center space-x-2 ml-4">
                  <Button
                    component={Link}
                    to="/login"
                    color="inherit"
                    sx={{ color: "var(--color-primary)" }}
                  >
                    {t("login")}
                  </Button>
                  <Button
                    component={Link}
                    to="/register"
                    color="inherit"
                    variant="outlined"
                    sx={{ 
                      color: "var(--color-primary)",
                      borderColor: "var(--color-primary)"
                    }}
                  >
                    {t("register")}
                  </Button>
                </Box>
              ) : (
                <Box className="flex items-center space-x-2 ml-4">
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--color-primary)" }}
                  >
                    {t("Hi")}, {isAdmin ? "Admin" : (user?.firstName || t("user"))}
                  </Typography>
                  <Button
                    color="inherit"
                    onClick={handleLogout}
                    sx={{ color: "var(--color-primary)" }}
                  >
                    {t("logout")}
                  </Button>
                </Box>
              )}
            </Box>
          )}

          <ThemeToggle />
          <LanguageSwitcher />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        className="md:hidden"
        sx={{
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: 250,
            backgroundColor: "background.default",
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navigation;
