import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  Button,
  Avatar,
  Tooltip,
  Divider,
} from '@mui/material';
import {
  Pets,
  Person,
  ExitToApp,
  Dashboard,
  History as HistoryIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, isShelterStaff, isAdopter, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showDashboard, setShowDashboard] = useState(false);

  // Update dashboard visibility whenever auth state changes
  useEffect(() => {
    setShowDashboard(isAuthenticated && (isAdmin || isShelterStaff));
  }, [isAuthenticated, isAdmin, isShelterStaff]);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/', { replace: true });
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const handleDashboard = () => {
    handleClose();
    navigate(isAdmin ? '/admin' : '/staff/dashboard', { replace: true });
  };

  const handleAdoptionHistory = () => {
    handleClose();
    navigate('/adoption-history');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Pets sx={{ mr: 1 }} />
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          Pet Shelter
        </Typography>

        {isAuthenticated ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {showDashboard && (
              <Button
                color="inherit"
                startIcon={<Dashboard />}
                onClick={handleDashboard}
                sx={{ mr: 2 }}
              >
                Dashboard
              </Button>
            )}
            {isAdopter && (
              <>
                <Button
                  color="inherit"
                  startIcon={<HistoryIcon />}
                  onClick={handleAdoptionHistory}
                  sx={{ mr: 2 }}
                >
                  Adoption History
                </Button>
                <Button
                  color="inherit"
                  startIcon={<ChatIcon />}
                  onClick={() => navigate('/talk-to-admin')}
                  sx={{ mr: 2 }}
                >
                  Talk to Admin
                </Button>
              </>
            )}
            <Tooltip title="Account settings">
              <IconButton onClick={handleMenu} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  {user?.firstName?.[0]}
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem disabled sx={{ opacity: '1 !important' }}>
                <Typography variant="body2">
                  Signed in as <strong>{user?.email}</strong>
                </Typography>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleProfile}>
                <Person sx={{ mr: 1 }} /> Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ExitToApp sx={{ mr: 1 }} /> Logout
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box>
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
            <Button color="inherit" component={RouterLink} to="/register">
              Register
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation; 