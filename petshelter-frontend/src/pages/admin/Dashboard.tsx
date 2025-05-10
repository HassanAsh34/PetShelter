import React, { useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  AppBar,
  Toolbar,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Pets,
  People,
  Business,
  Assessment,
  ExitToApp,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import UserRegistrationNotification from '../../components/UserRegistrationNotification';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const queryClient = useQueryClient();

  // Get admin type from user
  const adminType = user?.adminType;

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: () => adminApi.getDashboardStats(),
    // Poll every 5 seconds when the window is focused
    refetchInterval: (data) => {
      // Only poll if we have data (meaning we've already loaded once)
      return data ? 5000 : false;
    },
    // Only poll when the window is focused
    refetchIntervalInBackground: false,
  });

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Define menu items based on admin type
  const menuItems = [
    { text: 'Shelters', icon: <Business />, path: '/admin/shelters' },
    { text: 'Users', icon: <People />, path: '/admin/users' },
    { text: 'Pets', icon: <Pets />, path: '/admin/pets' },
    { text: 'Reports', icon: <Assessment />, path: '/admin/reports' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <UserRegistrationNotification />
      {/* Top AppBar */}
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Admin Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2">
              Welcome, {user?.firstName} {user?.lastName}
            </Typography>
            <IconButton color="inherit" onClick={handleLogout}>
              <ExitToApp />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Navigation */}
      <Box
        component="nav"
        sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
      >
        <Paper
          sx={{
            display: { xs: mobileOpen ? 'block' : 'none', sm: 'block' },
            width: 240,
            height: '100vh',
            position: 'fixed',
            top: 0,
            pt: 8,
          }}
        >
          <List>
            {menuItems.map((item) => (
              <ListItem
                button
                key={item.text}
                onClick={() => navigate(item.path)}
                sx={{ py: 2 }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          ml: { sm: '240px' },
          mt: 8,
        }}
      >
        <Container maxWidth="lg">
          {/* Overview Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {isLoading ? (
              <Box display="flex" justifyContent="center" width="100%" p={3}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Typography color="error" width="100%" textAlign="center">
                Error loading dashboard statistics
              </Typography>
            ) : (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Shelters
                      </Typography>
                      <Typography variant="h4">{stats?.totalShelters || 0}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Total Pets
                      </Typography>
                      <Typography variant="h4">{stats?.totalPets || 0}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Active Users
                      </Typography>
                      <Typography variant="h4">{stats?.activeUsers || 0}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Adoptions This Month
                      </Typography>
                      <Typography variant="h4">{stats?.approvedAdoptions || 0}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}
          </Grid>

          {/* Recent Activity */}
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recent Adoptions
                </Typography>
                <List>
                  {stats?.recentRequests?.map((adoption: any) => (
                    <React.Fragment key={adoption.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Pets />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${adoption.pet?.name || 'Unknown Pet'} adopted by ${adoption.user?.Uname || 'Unknown'}''}`}
                          secondary={new Date(adoption.approvedAt).toLocaleString()}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  New Shelters
                </Typography>
                <List>
                  {/* Add shelter list items here */}
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default AdminDashboard; 