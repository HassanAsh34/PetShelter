import React from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Pets as PetsIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  ExitToApp as LogoutIcon,
  Business as ShelterIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 240;

const Layout = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { user, logout, isAdmin, isShelterStaff, adminType } = useAuth();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getMenuItems = () => {
    const items = [
      { text: 'Home', icon: <HomeIcon />, path: '/' },
      { text: 'Animals', icon: <PetsIcon />, path: '/animals' },
    ];

    if (isAdmin) {
      if (adminType === 'SuperAdmin') {
        items.push(
          { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
          { text: 'Shelters', icon: <ShelterIcon />, path: '/admin/shelters' }
        );
      } else if (adminType === 'UsersAdmin') {
        items.push({ text: 'Users', icon: <PeopleIcon />, path: '/admin/users' });
      } else if (adminType === 'ShelterAdmin') {
        items.push({ text: 'Shelters', icon: <ShelterIcon />, path: '/admin/shelters' });
      }
    }

    if (isShelterStaff) {
      items.push(
        { text: 'Shelter Dashboard', icon: <ShelterIcon />, path: '/staff/dashboard' },
        { text: 'Adoption Requests', icon: <PeopleIcon />, path: '/staff/adoptions' }
      );
    }

    return items;
  };

  const drawer = (
    <div>
      <Toolbar />
      <List>
        {getMenuItems().map((item) => (
          <ListItem button key={item.text} component={RouterLink} to={item.path}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Pet Shelter
          </Typography>
          {user ? (
            <>
              <Typography variant="body1" sx={{ mr: 2 }}>
                {user.firstName} {user.lastName}
              </Typography>
              <IconButton color="inherit" onClick={logout}>
                <LogoutIcon />
              </IconButton>
            </>
          ) : (
            <Button color="inherit" component={RouterLink} to="/login">
              Login
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default Layout; 