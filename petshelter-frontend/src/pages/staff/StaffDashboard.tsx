import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Stack,
} from '@mui/material';
import {
  Pets,
  People,
  BarChart as BarChartIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const StaffReports = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Staff Reports
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Reports and analytics will be implemented here.
      </Typography>
    </Box>
  );
};

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedMenu, setSelectedMenu] = useState('reports');

  const menuItems = [
    { id: 'reports', label: 'Reports', icon: <BarChartIcon />, path: '/staff/dashboard' },
    { id: 'pets', label: 'Pets List', icon: <Pets />, path: '/staff/pets' },
    { id: 'adoption-requests', label: 'Adoption Requests', icon: <AssignmentIcon />, path: '/staff/adoption-requests' },
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
    setSelectedMenu(path.split('/').pop() || 'reports');
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Side Menu */}
      <Paper
        sx={{
          width: 240,
          borderRight: '1px solid',
          borderColor: 'divider',
          borderRadius: 0,
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Staff Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome, {user?.uname}
          </Typography>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={selectedMenu === item.id}
                onClick={() => handleMenuClick(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <StaffReports />
      </Box>
    </Box>
  );
};

export default StaffDashboard; 