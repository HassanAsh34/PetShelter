import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { ArrowBack as BackIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { adminApi } from '../../services/api';

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

interface BaseUser {
  id: number;
  uname: string;
  email: string;
  role: number;
  activated: number;
  banned: boolean;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  bannedAt?: string;
}

interface AdminUser extends BaseUser {
  adminType: number;
}

interface StaffUser extends BaseUser {
  staffType: number;
  hiredDate: string;
  phone: string;
  shelter?: {
    shelterId: number;
    shelterName: string;
    shelterLocation: string;
    shelterPhone: string;
  };
}

interface AdopterUser extends BaseUser {
  phone: string;
  address: string;
}

const UserDetailsPage = () => {
  const { id, role } = useParams<{ id: string; role: string }>();
  const navigate = useNavigate();
  const userId = parseInt(id || '0');
  const userRole = parseInt(role || '0');
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get the user details with role
  const { data: user, isLoading, error: queryError } = useQuery({
    queryKey: ['user', userId, userRole],
    queryFn: async () => {
      const response = await adminApi.getUserDetails(userId, userRole);
      console.log('User Details Response:', JSON.stringify(response, null, 2));
      return response;
    },
    enabled: userId > 0 && userRole >= 0,
  });

  const updateUserStatus = (newStatus: { activated?: number; banned?: boolean }) => {
    if (!user) return;
    
    // Update the user object in the cache
    queryClient.setQueryData(['user', userId, userRole], {
      ...user,
      ...newStatus
    });
  };

  const getUserTypeChip = (role: number) => {
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

  const getAdminType = (user: AdminUser) => {
    if (UserRole[user.role as keyof typeof UserRole] === 'Admin') {
      const adminTypeName = AdminType[user.adminType as keyof typeof AdminType];
      return <Chip label={adminTypeName} variant="outlined" />;
    }
    return null;
  };

  const getStaffType = (user: StaffUser) => {
    if (UserRole[user.role as keyof typeof UserRole] === 'Staff') {
      const staffTypeName = StaffType[user.staffType as keyof typeof StaffType];
      return <Chip label={staffTypeName} variant="outlined" />;
    }
    return null;
  };

  const getStatusChip = (user: BaseUser) => {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const updateUserMutation = useMutation({
    mutationFn: (data: any) => adminApi.updateUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId, userRole] });
      setIsEditDialogOpen(false);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to update user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (data: any) => adminApi.deleteUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      navigate('/admin/users');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleEditClick = () => {
    setEditedUser(user);
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = () => {
    updateUserMutation.mutate(editedUser);
  };

  const handleInputChange = (field: string, value: any) => {
    setEditedUser((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    deleteUserMutation.mutate({
      id: userId,
      role: userRole,
      uname: user.uname,
      email: user.email,
      adminType: user.adminType,
      staffType: user.staffType,
      phone: user.phone,
      address: user.address
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (queryError || !user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography color="error">Error loading user details</Typography>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/admin/users')}
            sx={{ mt: 2 }}
          >
            Back to Users
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/admin/users')}
          >
            Back to Users
          </Button>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={handleEditClick}
            >
              Edit User
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={handleDeleteClick}
            >
              Delete User
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              {user.uname}
            </Typography>
            <Typography color="text.secondary" gutterBottom>
              {user.email}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Role
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              {getUserTypeChip(user.role)}
              {getAdminType(user as AdminUser) || getStaffType(user as StaffUser)}
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" gutterBottom>
              Status
            </Typography>
            {getStatusChip(user)}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Account Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Created At
                </Typography>
                <Typography variant="body1">
                  {formatDate(user.createdAt)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Activated At
                </Typography>
                <Typography variant="body1">
                  {formatDate(user.activatedAt)}
                </Typography>
              </Grid>
              {user.banned && (
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Banned At
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(user.bannedAt)}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {user.banned ? (
                <Button
                  variant="contained"
                  color="success"
                  onClick={async () => {
                    try {
                      const response = await adminApi.unbanUser({
                        id: userId,
                        role: userRole,
                        uname: user.uname,
                        email: user.email,
                        ...(user.role === 0 && { adminType: (user as AdminUser).adminType }),
                        ...(user.role === 1 && { 
                          phone: (user as AdopterUser).phone,
                          address: (user as AdopterUser).address 
                        }),
                        ...(user.role === 2 && { 
                          staffType: (user as StaffUser).staffType,
                          phone: (user as StaffUser).phone 
                        })
                      });
                      if (response) {
                        updateUserStatus({ banned: false, activated: 1 });
                        alert('User unbanned successfully');
                      }
                    } catch (error) {
                      console.error('Error unbanning user:', error);
                      alert('Failed to unban user');
                    }
                  }}
                >
                  Unban User
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="error"
                  onClick={async () => {
                    try {
                      const response = await adminApi.banUser({
                        id: userId,
                        role: userRole,
                        uname: user.uname,
                        email: user.email,
                        ...(user.role === 0 && { adminType: (user as AdminUser).adminType }),
                        ...(user.role === 1 && { 
                          phone: (user as AdopterUser).phone,
                          address: (user as AdopterUser).address 
                        }),
                        ...(user.role === 2 && { 
                          staffType: (user as StaffUser).staffType,
                          phone: (user as StaffUser).phone 
                        })
                      });
                      if (response) {
                        updateUserStatus({ banned: true, activated: 2 });
                        alert('User banned successfully');
                      }
                    } catch (error) {
                      console.error('Error banning user:', error);
                      alert('Failed to ban user');
                    }
                  }}
                >
                  Ban User
                </Button>
              )}
              {user.activated === 1 ? (
                <Button
                  variant="contained"
                  color="warning"
                  onClick={async () => {
                    try {
                      const response = await adminApi.deactivateUser({
                        id: userId,
                        role: userRole,
                        uname: user.uname,
                        email: user.email,
                        ...(user.role === 0 && { adminType: (user as AdminUser).adminType }),
                        ...(user.role === 1 && { 
                          phone: (user as AdopterUser).phone,
                          address: (user as AdopterUser).address 
                        }),
                        ...(user.role === 2 && { 
                          staffType: (user as StaffUser).staffType,
                          phone: (user as StaffUser).phone 
                        })
                      });
                      if (response) {
                        updateUserStatus({ activated: 0 });
                        alert('User deactivated successfully');
                      }
                    } catch (error) {
                      console.error('Error deactivating user:', error);
                      alert('Failed to deactivate user');
                    }
                  }}
                >
                  Deactivate User
                </Button>
              ) : (
                <Button
                  variant="contained"
                  color="success"
                  onClick={async () => {
                    try {
                      const response = await adminApi.activateUser({
                        id: userId,
                        role: userRole,
                        uname: user.uname,
                        email: user.email,
                        ...(user.role === 0 && { adminType: (user as AdminUser).adminType }),
                        ...(user.role === 1 && { 
                          phone: (user as AdopterUser).phone,
                          address: (user as AdopterUser).address 
                        }),
                        ...(user.role === 2 && { 
                          staffType: (user as StaffUser).staffType,
                          phone: (user as StaffUser).phone 
                        })
                      });
                      if (response) {
                        updateUserStatus({ activated: 1 });
                        alert('User activated successfully');
                      }
                    } catch (error) {
                      console.error('Error activating user:', error);
                      alert('Failed to activate user');
                    }
                  }}
                >
                  Activate User
                </Button>
              )}
            </Box>
          </Grid>

          {user.role === 2 && (
            <>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Employment Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Hired Date
                    </Typography>
                    <Typography variant="body1">
                      {formatDate((user as StaffUser).hiredDate)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="body2" color="text.secondary">
                      Phone
                    </Typography>
                    <Typography variant="body1">
                      {(user as StaffUser).phone}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {(user as StaffUser).shelter && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Shelter Information
                  </Typography>
                  <Box>
                    <Typography variant="body1" fontWeight="bold">
                      {(user as StaffUser).shelter?.shelterName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(user as StaffUser).shelter?.shelterLocation}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(user as StaffUser).shelter?.shelterPhone}
                    </Typography>
                  </Box>
                </Grid>
              )}
            </>
          )}

          {user.role === 1 && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {(user as AdopterUser).phone}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Address
                  </Typography>
                  <Typography variant="body1">
                    {(user as AdopterUser).address}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User Details</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Username"
                value={editedUser?.uname || ''}
                onChange={(e) => handleInputChange('uname', e.target.value)}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Email"
                value={editedUser?.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                margin="normal"
              />
              {userRole === 0 && (
                <TextField
                  fullWidth
                  select
                  label="Admin Type"
                  value={editedUser?.adminType || 0}
                  onChange={(e) => handleInputChange('adminType', parseInt(e.target.value))}
                  margin="normal"
                >
                  {Object.entries(AdminType).map(([value, label]) => (
                    <MenuItem key={value} value={parseInt(value)}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
              {userRole === 2 && (
                <>
                  <TextField
                    fullWidth
                    select
                    label="Staff Type"
                    value={editedUser?.staffType || 0}
                    onChange={(e) => handleInputChange('staffType', parseInt(e.target.value))}
                    margin="normal"
                  >
                    {Object.entries(StaffType).map(([value, label]) => (
                      <MenuItem key={value} value={parseInt(value)}>
                        {label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={editedUser?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    margin="normal"
                  />
                </>
              )}
              {userRole === 1 && (
                <>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={editedUser?.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    margin="normal"
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    value={editedUser?.address || ''}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    margin="normal"
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button 
              onClick={handleEditSubmit}
              variant="contained"
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete user "{user.uname}"? This action cannot be undone.
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button
              onClick={handleDeleteConfirm}
              color="error"
              variant="contained"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default UserDetailsPage; 