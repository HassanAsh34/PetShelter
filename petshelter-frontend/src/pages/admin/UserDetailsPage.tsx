import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
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
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { ArrowBack as BackIcon, Edit as EditIcon, Delete as DeleteIcon, Business as BusinessIcon } from '@mui/icons-material';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { adminApi, authApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { parseJwt, getToken } from '../../utils/tokenUtils';
import { Console } from 'console';

// Enum mapping for user roles
const UserRole = {
  0: 'Admin',
  1: 'Adopter',
  2: 'Staff'
} as const;

type UserRoleType = keyof typeof UserRole;

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

interface UserDto {
  id: number;
  role: number;
  uname: string;
  email: string;
  activated: number;
  banned: boolean;
  adminType?: number;
  staffType?: number;
  phone?: string;
  address?: string;
  hiredDate?: string;
}

interface Shelter {
  id: number;
  name: string;
}

const UserDetailsPage = () => {
  const { id, role } = useParams<{ id: string; role: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const isProfileRoute = location.pathname === '/profile';
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<number>(0);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [assignError, setAssignError] = useState<string | null>(null);
  
  // Get user data from token for profile route
  const token = getToken();
  const decodedToken = token ? parseJwt(token) : null;
  
  // Use current user's ID and role for profile route, otherwise use URL params
  const userId = isProfileRoute 
    ? (decodedToken?.nameid ? parseInt(decodedToken.nameid) : 0)
    : parseInt(id || '0');
  const userRole = isProfileRoute 
    ? (decodedToken?.role === 'Admin' ? 0 : 
       decodedToken?.role === 'Adopter' ? 1 : 
       decodedToken?.role === 'ShelterStaff' ? 2 : 0)
    : parseInt(role || '0');
  
  console.log('UserDetailsPage - User Info:', {
    isProfileRoute,
    userId,
    userRole,
    decodedToken,
    currentUser,
    token,
    roleString: decodedToken?.role
  });
  
  const queryClient = useQueryClient();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get the user details with role
  const { data: user, isLoading, error: queryError } = useQuery({
    queryKey: ['user', userId, userRole, isProfileRoute],
    queryFn: async () => {
      console.log('Fetching user details:', { userId, userRole, isProfileRoute });
      if (isProfileRoute) {
        // Use the Protected endpoint for profile route
        const response = await authApi.getCurrentUser();
        console.log('User Details Response (Auth):', response);
        return response;
      } else {
        // Use admin API for admin routes - keep using the original endpoint
        const response = await adminApi.getUserDetails(userId, userRole);
        console.log('User Details Response (Admin):', response);
        return response;
      }
    },
    enabled: userId > 0 && userRole >= 0,
  });

  // Fetch shelters when component mounts
  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const data = await adminApi.getShelters();
        setShelters(data.map((shelter: any) => ({
          id: shelter.shelterId,
          name: shelter.shelterName
        })));
      } catch (err) {
        console.error('Error fetching shelters:', err);
      }
    };

    fetchShelters();
  }, []);

  const updateUserStatus = (newStatus: { activated?: number; banned?: boolean }) => {
    if (!user) return;
    
    // Update the user object in the cache
    queryClient.setQueryData(['user', userId, userRole, isProfileRoute], {
      ...user,
      ...newStatus
    });
  };

  const getUserTypeChip = (role?: number) => {
    if (role === undefined) return null;
    const roleName = UserRole[role as UserRoleType];
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

  const handleEditClick = () => {
    setEditedUser(user);
    setIsEditDialogOpen(true);
  };

  const updateUserMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Updating user with data:', {
        isProfileRoute,
        endpoint: isProfileRoute ? '/AuthApi/UpdateProfile' : '/Admin/Update-User',
        userData: data
      });
      
      if (isProfileRoute) {
        return await authApi.updateUserDetails(data);
      } else {
        return await adminApi.updateUser(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user', userId, userRole, isProfileRoute] });
      setIsEditDialogOpen(false);
      setError(null);
    },
    onError: (error: any) => {
      console.error('Error updating user:', error);
      setError(error.response?.data?.message || 'Failed to update user');
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (data: any) => {
      // console.log(data);
      return adminApi.deleteUser(data)},
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Only navigate if we're not on the profile page
      if (!isProfileRoute) {
        navigate('/admin/users');
      } else {
        // If it's the user's own profile, log them out
        authApi.logout();
        navigate('/login');
      }
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleBanUser = async () => {
    if (!user) return;
    
    try {
      const userData: UserDto = {
        id: user.id,
        role: user.role,
        uname: user.uname,
        email: user.email,
        activated: user.activated,
        banned: true,
        adminType: user.adminType,
        staffType: user.staffType,
        phone: user.phone,
        address: user.address,
        hiredDate: user.hiredDate
      };

      await adminApi.banUser(userData);
      
      // Update the user object in the cache
      updateUserStatus({ banned: true });
      
      // Show success message
      alert('User has been banned successfully');
    } catch (error: any) {
      console.error('Error banning user:', error);
      alert(error.response?.data?.message || 'Failed to ban user');
    }
  };

  const handleUnbanUser = async () => {
    if (!user) return;
    
    try {
      const userData: UserDto = {
        id: user.id,
        role: user.role,
        uname: user.uname,
        email: user.email,
        activated: user.activated,
        banned: false,
        adminType: user.adminType,
        staffType: user.staffType,
        phone: user.phone,
        address: user.address,
        hiredDate: user.hiredDate
      };

      await adminApi.unbanUser(userData);
      
      // Update the user object in the cache
      updateUserStatus({ banned: false });
      
      // Show success message
      alert('User has been unbanned successfully');
    } catch (error: any) {
      console.error('Error unbanning user:', error);
      alert(error.response?.data?.message || 'Failed to unban user');
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
      updateUserStatus({ activated: user.activated === 1 ? 0 : 1 });
      queryClient.invalidateQueries({ queryKey: ['user', userId, userRole, isProfileRoute] });
    } catch (error) {
      console.error('Error toggling user activation:', error);
    }
  };

  const handleEditSubmit = () => {
    const baseDto: UserDto = {
      id: userId,
      role: userRole,
      uname: editedUser.uname,
      email: editedUser.email,
      activated: editedUser.activated,
      banned: editedUser.banned
    };

    let userDto: UserDto;
    switch (userRole) {
      case 0: // Admin
        userDto = {
          ...baseDto,
          adminType: editedUser.adminType
        };
        break;
      case 1: // Adopter
        userDto = {
          ...baseDto,
          phone: editedUser.phone,
          address: editedUser.address
        };
        break;
      case 2: // Staff
        userDto = {
          ...baseDto,
          staffType: editedUser.staffType,
          phone: editedUser.phone,
          hiredDate: editedUser.hiredDate
        };
        break;
      default:
        userDto = baseDto;
    }

    console.log('Sending user DTO:', {
      role: UserRole[userRole as keyof typeof UserRole],
      dto: userDto
    });

    updateUserMutation.mutate(userDto);
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

  const handleDeleteConfirm = async () => {
    if (!user) return;
    try {
      console.log('Delete User - Complete User Object:', {
        user,
        userId,
        userRole,
        userType: UserRole[userRole as keyof typeof UserRole],
        roleSpecificFields: {
          adminType: user.role === 0 ? AdminType[user.adminType as keyof typeof AdminType] : null,
          phone: user.role === 1 || user.role === 2 ? user.phone : null,
          address: user.role === 1 ? user.address : null,
          staffType: user.role === 2 ? StaffType[user.staffType as keyof typeof StaffType] : null
        }
      });

      const userDto: UserDto = {
        id: userId,
        role: userRole,
        uname: user.uname,
        email: user.email,
        activated: user.activated,
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
      };

      console.log('Delete User - Request DTO:', {
        dto: userDto,
        role: UserRole[userRole as keyof typeof UserRole],
        roleSpecificFields: {
          adminType: userDto.adminType !== undefined ? AdminType[userDto.adminType as keyof typeof AdminType] : null,
          phone: userDto.phone,
          address: userDto.address,
          staffType: userDto.staffType !== undefined ? StaffType[userDto.staffType as keyof typeof StaffType] : null
        }
      });

      await adminApi.deleteUser(userDto);
  
      queryClient.invalidateQueries({
        queryKey: ['user', userId, userRole, isProfileRoute],
      });

      // Close the delete dialog
      setIsDeleteDialogOpen(false);
      
      // Navigate to users list page
      navigate('/admin/users');
    } catch (error: any) {
      console.error('Error deleting user:', {
        error,
        response: error.response?.data,
        status: error.response?.status,
        message: error.message
      });
      setError(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleBackClick = () => {
    if (isProfileRoute) {
      navigate('/');
    } else {
      navigate('/admin/users');
    }
  };

  const renderRoleSpecificDetails = (user: any) => {
    switch (user.role) {
      case 0: // Admin
        return (
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Admin Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Admin Type
                </Typography>
                <Typography variant="body1">
                  {AdminType[user.adminType as keyof typeof AdminType] || 'Not specified'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        );

      case 1: // Adopter
        return (
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
                  {user.phone || 'Not provided'}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1">
                  {user.address || 'Not provided'}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        );

      case 2: // Staff
        return (
          <>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Employment Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Staff Type
                  </Typography>
                  <Typography variant="body1">
                    {StaffType[user.staffType as keyof typeof StaffType] || 'Not specified'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Phone
                  </Typography>
                  <Typography variant="body1">
                    {user.phone || 'Not provided'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body2" color="text.secondary">
                    Hired Date
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(user.hiredDate)}
                  </Typography>
                </Grid>
              </Grid>
            </Grid>

            {user.shelter && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Shelter Information
                </Typography>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    {user.shelter.shelterName}
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Location
                      </Typography>
                      <Typography variant="body1">
                        {user.shelter.shelterLocation}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="body2" color="text.secondary">
                        Contact
                      </Typography>
                      <Typography variant="body1">
                        {user.shelter.shelterPhone}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            )}
          </>
        );

      default:
        return null;
    }
  };

  const handleAssignToShelter = async () => {
    if (!selectedShelter) {
      setAssignError('Please select a shelter');
      return;
    }

    try {
      const assignmentData = {
        id: userId,
        role: userRole,
        shelter_FK: selectedShelter,
        uname: user?.uname,
        email: user?.email,
        activated: user?.activated,
        banned: user?.banned,
        staffType: user?.staffType,
        phone: user?.phone
      };

      console.log('Assigning to shelter with data:', assignmentData);
      
      await adminApi.assignToShelter(assignmentData);
      setIsAssignDialogOpen(false);
      setAssignError(null);
      // Refresh user data
      queryClient.invalidateQueries({ queryKey: ['user', userId, userRole, isProfileRoute] });
    } catch (error: any) {
      console.error('Error assigning to shelter:', error);
      setAssignError(error.response?.data?.message || 'Failed to assign user to shelter');
    }
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
            onClick={handleBackClick}
            sx={{ mt: 2 }}
          >
            {isProfileRoute ? 'Back to Home' : 'Back to Users'}
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
            onClick={handleBackClick}
          >
            {isProfileRoute ? 'Back to Home' : 'Back to Users'}
          </Button>
          {!isProfileRoute && (
            <Box>
              <Button
                startIcon={<EditIcon />}
                onClick={handleEditClick}
                sx={{ mr: 1 }}
              >
                Edit
              </Button>
              <Button
                startIcon={<DeleteIcon />}
                onClick={handleDeleteClick}
                color="error"
              >
                Delete
              </Button>
            </Box>
          )}
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

          {/* Role-specific details */}
          {user && renderRoleSpecificDetails(user)}

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              {isProfileRoute ? (
                // Profile view actions
                <>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<EditIcon />}
                    onClick={handleEditClick}
                  >
                    Edit Details
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleDeleteClick}
                  >
                    Delete Account
                  </Button>
                </>
              ) : (
                // Admin view actions
                <>
                  {user.banned ? (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleUnbanUser}
                    >
                      Unban User
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="error"
                      onClick={handleBanUser}
                    >
                      Ban User
                    </Button>
                  )}
                  {user.activated === 1 ? (
                    <Button
                      variant="contained"
                      color="warning"
                      onClick={handleActivateUser}
                    >
                      Deactivate User
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      color="success"
                      onClick={handleActivateUser}
                    >
                      Activate User
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Grid>

          {/* Add Assign to Shelter button for staff users */}
          {!isProfileRoute && user?.role === 2 && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setIsAssignDialogOpen(true)}
                startIcon={<BusinessIcon />}
              >
                Assign to Shelter
              </Button>
            </Box>
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
                disabled
                margin="normal"
              />
              {!isProfileRoute && userRole === 0 && (
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
              {!isProfileRoute && userRole === 2 && (
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

        {/* Assign to Shelter Dialog */}
        <Dialog open={isAssignDialogOpen} onClose={() => setIsAssignDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Assign to Shelter</DialogTitle>
          <DialogContent>
            {assignError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {assignError}
              </Alert>
            )}
            <Box sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Select Shelter</InputLabel>
                <Select
                  value={selectedShelter}
                  onChange={(e) => setSelectedShelter(Number(e.target.value))}
                  label="Select Shelter"
                >
                  {shelters.map((shelter) => (
                    <MenuItem key={shelter.id} value={shelter.id}>
                      {shelter.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsAssignDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignToShelter} variant="contained" color="primary">
              Assign
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default UserDetailsPage; 