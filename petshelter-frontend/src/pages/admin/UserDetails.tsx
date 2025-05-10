import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider,
} from '@mui/material';
import { adminApi } from '../../services/api';
import { useQuery } from '@tanstack/react-query';

// Enum mapping for user roles
const UserRole = {
  0: 'Admin',
  1: 'Adopter',
  2: 'Staff'
} as const;

// Enum mapping for staff types
const StaffType = {
  0: 'Manager',
  1: 'Interviewer',
  2: 'CareTaker'
} as const;

// Enum mapping for admin types
const AdminType = {
  0: 'SuperAdmin',
  1: 'ShelterAdmin',
  2: 'UsersAdmin'
} as const;

interface UserDetailsProps {
  userId: number;
  userRole: number;
  open: boolean;
  onClose: () => void;
  isProfileView?: boolean;
}

const UserDetails = ({ userId, userRole, open, onClose, isProfileView = false }: UserDetailsProps) => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId, userRole],
    queryFn: () => adminApi.getUserDetails(userId, userRole),
    enabled: open,
  });

  const getUserTypeChip = (role?: number) => {
    if (role === undefined) return null;
    const roleName = UserRole[role as keyof typeof UserRole];
    switch (roleName) {
      case 'Admin':
        return <Chip label="Admin" color="primary" />;
      case 'Staff':
        return <Chip label="Staff" color="secondary" />;
      case 'Adopter':
        return <Chip label="Adopter" color="success" />;
      default:
        return <Chip label={roleName} />;
    }
  };

  const getAdminType = (user: any) => {
    if (!user || user.role === undefined) return null;
    if (UserRole[user.role as keyof typeof UserRole] === 'Admin' && 'adminType' in user) {
      const adminTypeName = AdminType[user.adminType as keyof typeof AdminType];
      return <Chip label={adminTypeName} variant="outlined" />;
    }
    return null;
  };

  const getStaffType = (user: any) => {
    if (!user || user.role === undefined) return null;
    if (UserRole[user.role as keyof typeof UserRole] === 'Staff' && 'staffType' in user) {
      const staffTypeName = StaffType[user.staffType as keyof typeof StaffType];
      return <Chip label={staffTypeName} variant="outlined" />;
    }
    return null;
  };

  const getStatusChip = (user: any) => {
    if (!user) return null;
    if (user.banned) {
      return <Chip label="Banned" color="error" />;
    }
    return (
      <Chip
        label={user.activated === 1 ? 'Active' : 'Inactive'}
        color={user.activated === 1 ? 'success' : 'warning'}
      />
    );
  };

  const handleBanUser = async () => {
    if (!user) return;
    try {
      await adminApi.banUser({
        id: userId,
        role: userRole,
        uname: user.uname,
        email: user.email,
        activated: user.activated,
        banned: true,
        ...(user.role === 0 && { adminType: user.adminType }),
        ...(user.role === 1 && { 
          phone: user.phone,
          address: user.address 
        }),
        ...(user.role === 2 && { 
          staffType: user.staffType,
          phone: user.phone 
        })
      });
      onClose();
    } catch (error) {
      console.error('Error banning user:', error);
    }
  };

  const handleUnbanUser = async () => {
    if (!user) return;
    try {
      await adminApi.unbanUser({
        id: userId,
        role: userRole,
        uname: user.uname,
        email: user.email,
        activated: user.activated,
        banned: false,
        ...(user.role === 0 && { adminType: user.adminType }),
        ...(user.role === 1 && { 
          phone: user.phone,
          address: user.address 
        }),
        ...(user.role === 2 && { 
          staffType: user.staffType,
          phone: user.phone 
        })
      });
      onClose();
    } catch (error) {
      console.error('Error unbanning user:', error);
    }
  };

  const handleActivateUser = async () => {
    if (!user) return;
    try {
      await adminApi.toggleActivation({
        id: userId,
        role: userRole,
        uname: user.uname,
        email: user.email,
        activated: user.activated === 1 ? 0 : 1,
        banned: user.banned,
        ...(user.role === 0 && { adminType: user.adminType }),
        ...(user.role === 1 && { 
          phone: user.phone,
          address: user.address 
        }),
        ...(user.role === 2 && { 
          staffType: user.staffType,
          phone: user.phone 
        })
      });
      onClose();
    } catch (error) {
      console.error('Error toggling user activation:', error);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" p={3}>
            <Typography>Loading user details...</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !user) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
        <DialogTitle>User Details</DialogTitle>
        <DialogContent>
          <Box display="flex" justifyContent="center" p={3}>
            <Typography color="error">Error loading user details</Typography>
          </Box>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>User Details</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">{user.uname}</Typography>
            <Typography color="text.secondary">{user.email}</Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Role</Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {getUserTypeChip(user.role)}
              {getAdminType(user) || getStaffType(user)}
            </Box>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>Status</Typography>
            {getStatusChip(user)}
          </Box>

          {user.role === 2 && user.shelter && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Shelter</Typography>
              <Box>
                <Typography variant="body1" fontWeight="bold">{user.shelter.shelterName}</Typography>
                <Typography variant="body2" color="text.secondary">{user.shelter.shelterLocation}</Typography>
                <Typography variant="body2" color="text.secondary">{user.shelter.shelterPhone}</Typography>
              </Box>
            </Box>
          )}

          {user.role === 1 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>Contact Information</Typography>
              <Typography variant="body2">{user.phone}</Typography>
              <Typography variant="body2">{user.address}</Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {isProfileView ? (
          <Button onClick={onClose} color="primary">Close</Button>
        ) : (
          <>
            <Button onClick={() => {/* TODO: handle edit */}} color="primary">Edit</Button>
            <Button onClick={() => {/* TODO: handle delete */}} color="error">Delete</Button>
            {user.banned ? (
              <Button onClick={handleUnbanUser} color="success">Unban</Button>
            ) : (
              <Button onClick={handleBanUser} color="error">Ban</Button>
            )}
            {user.activated === 1 ? (
              <Button onClick={handleActivateUser} color="warning">Deactivate</Button>
            ) : (
              <Button onClick={handleActivateUser} color="success">Activate</Button>
            )}
            <Button onClick={onClose}>Close</Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default UserDetails; 