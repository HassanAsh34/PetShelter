import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
} from '@mui/material';
import { Visibility as ViewIcon, Add as AddIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface BaseUser {
  id: number;
  uname: string;
  email: string;
  role: number;
  activated: number;
  banned: boolean;
}

interface AdminUser extends BaseUser {
  adminType: number;
}

interface StaffUser extends BaseUser {
  staffType: number;
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

const Users = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    uname: '',
    email: '',
    password: '',
    role: 1, // Default to Adopter
    adminType: 0,
    staffType: 0,
    phone: '',
    address: '',
  });
  const [error, setError] = useState<string | null>(null);

  const { data: users, isLoading, error: queryError } = useQuery({
    queryKey: ['users'],
    queryFn: () => adminApi.getUsers(),
  });

  const addUserMutation = useMutation({
    mutationFn: (data: any) => {
      if (data.role === 0) { // Admin
        return adminApi.addAdmin(data);
      } else {
        return adminApi.addUser(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddDialogOpen(false);
      setError(null);
      setNewUser({
        uname: '',
        email: '',
        password: '',
        role: 1,
        adminType: 0,
        staffType: 0,
        phone: '',
        address: '',
      });
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to add user');
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setNewUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Username validation
    if (!newUser.uname || newUser.uname.length < 3 || newUser.uname.length > 50) {
      errors.push('Username must be between 3 and 50 characters');
    }

    // Email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!newUser.email || !emailRegex.test(newUser.email)) {
      errors.push('Please enter a valid email address');
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;
    if (!newUser.password || !passwordRegex.test(newUser.password)) {
      errors.push('Password must contain at least 8 characters, 1 capital letter, and 1 number');
    }

    // Role-specific validation
    if (newUser.role === 1) { // Adopter
      if (!newUser.phone) {
        errors.push('Phone number is required for adopters');
      }
      if (!newUser.address || newUser.address.length < 15) {
        errors.push('Address must be at least 15 characters long');
      }
    } else if (newUser.role === 2) { // Staff
      if (!newUser.phone) {
        errors.push('Phone number is required for staff');
      }
    }

    return errors;
  };

  const handleAddUser = () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    addUserMutation.mutate(newUser);
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

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (queryError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography color="error">Error loading users</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">
            Users
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add New User
          </Button>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users?.map((user: BaseUser) => (
                <TableRow key={user.id}>
                  <TableCell>{user.uname}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getUserTypeChip(user.role)}</TableCell>
                  <TableCell>
                    {getAdminType(user as AdminUser) || getStaffType(user as StaffUser) || '-'}
                  </TableCell>
                  <TableCell>{getStatusChip(user)}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => navigate(`/admin/users/${user.id}/${user.role}`)}
                      color="primary"
                    >
                      <ViewIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add User Dialog */}
        <Dialog open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
                {error}
              </Alert>
            )}
            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Username"
                value={newUser.uname}
                onChange={(e) => handleInputChange('uname', e.target.value)}
                margin="normal"
                required
                error={error?.includes('Username')}
                helperText={error?.includes('Username') ? 'Username must be between 3 and 50 characters' : ''}
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={newUser.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                margin="normal"
                required
                error={error?.includes('email')}
                helperText={error?.includes('email') ? 'Please enter a valid email address' : ''}
              />
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={newUser.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                margin="normal"
                required
                error={error?.includes('Password')}
                helperText={error?.includes('Password') ? 'Password must contain at least 8 characters, 1 capital letter, and 1 number' : ''}
              />
              <TextField
                fullWidth
                select
                label="Role"
                value={newUser.role}
                onChange={(e) => handleInputChange('role', parseInt(e.target.value))}
                margin="normal"
                required
              >
                {Object.entries(UserRole).map(([value, label]) => (
                  <MenuItem key={value} value={parseInt(value)}>
                    {label}
                  </MenuItem>
                ))}
              </TextField>

              {newUser.role === 0 && (
                <TextField
                  fullWidth
                  select
                  label="Admin Type"
                  value={newUser.adminType}
                  onChange={(e) => handleInputChange('adminType', parseInt(e.target.value))}
                  margin="normal"
                  required
                >
                  {Object.entries(AdminType).map(([value, label]) => (
                    <MenuItem key={value} value={parseInt(value)}>
                      {label}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {newUser.role === 2 && (
                <>
                  <TextField
                    fullWidth
                    select
                    label="Staff Type"
                    value={newUser.staffType}
                    onChange={(e) => handleInputChange('staffType', parseInt(e.target.value))}
                    margin="normal"
                    required
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
                    value={newUser.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    margin="normal"
                    required
                    error={error?.includes('Phone')}
                    helperText={error?.includes('Phone') ? 'Phone number is required for staff' : ''}
                  />
                </>
              )}

              {newUser.role === 1 && (
                <>
                  <TextField
                    fullWidth
                    label="Phone"
                    value={newUser.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    margin="normal"
                    required
                    error={error?.includes('Phone')}
                    helperText={error?.includes('Phone') ? 'Phone number is required for adopters' : ''}
                  />
                  <TextField
                    fullWidth
                    label="Address"
                    value={newUser.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    margin="normal"
                    required
                    error={error?.includes('Address')}
                    helperText={error?.includes('Address') ? 'Address must be at least 15 characters long' : ''}
                  />
                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              setIsAddDialogOpen(false);
              setError(null);
            }}>Cancel</Button>
            <Button 
              onClick={handleAddUser}
              variant="contained"
              disabled={addUserMutation.isPending}
            >
              {addUserMutation.isPending ? 'Adding...' : 'Add User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Container>
  );
};

export default Users; 