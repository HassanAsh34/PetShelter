import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const Dashboard = () => {
  const { user, isAdmin, isShelterStaff, isAdopter, adminType, staffType } = useAuth();

  const renderAdminDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome, {adminType} {user?.firstName}
          </Typography>
          <Typography variant="body1">
            You have full access to manage the system based on your admin type.
          </Typography>
        </Paper>
      </Grid>
      {/* Add more admin-specific components here */}
    </Grid>
  );

  const renderStaffDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome, {staffType} {user?.firstName}
          </Typography>
          <Typography variant="body1">
            You can manage shelter operations and handle adoption requests.
          </Typography>
        </Paper>
      </Grid>
      {/* Add more staff-specific components here */}
    </Grid>
  );

  const renderAdopterDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome, {user?.firstName}
          </Typography>
          <Typography variant="body1">
            View your adoption requests and browse available pets.
          </Typography>
        </Paper>
      </Grid>
      {/* Add more adopter-specific components here */}
    </Grid>
  );

  return (
    <Box sx={{ flexGrow: 1 }}>
      {isAdmin && renderAdminDashboard()}
      {isShelterStaff && renderStaffDashboard()}
      {isAdopter && renderAdopterDashboard()}
    </Box>
  );
};

export default Dashboard; 