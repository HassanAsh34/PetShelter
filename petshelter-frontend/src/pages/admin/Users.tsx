import React, { useState, useEffect } from 'react';
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
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  Grid,
  InputAdornment,
} from '@mui/material';
import { Visibility as ViewIcon, Add as AddIcon, Visibility, VisibilityOff } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface BaseUser {
  id: number;
  uname: string;
  email: string;
  role: number;
  activated: number;
  banned: boolean;
  staffType?: number;
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

interface Shelter {
  id: number;
  name: string;
}

interface StaffAssignment {
  id: number;
  role: number;
  shelter_FK: number;
}

// Enum mapping for user roles
const UserRole = {
  1: 'Adopter',
  2: 'ShelterStaff'
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
  const { user } = useAuth();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    uname: '',
    email: '',
    password: '',
    role: 1, // Default to Adopter
    staffType: 0,
    phone: '',
    address: '',
    shelter_FK: 1, // Default shelter ID
  });
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    type: '',
    status: '',
    role: ''
  });
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [showPassword, setShowPassword] = useState(false);

  const { data: users, isLoading, error: queryError } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => adminApi.listUsers(),
  });

  const addUserMutation = useMutation({
    mutationFn: async (data: any) => {
      console.log('Sending user data:', data);
      const response = await adminApi.addUser(data);
      console.log('API response:', response);
      
      // If the user is a shelter staff, assign them to the selected shelter
      if (data.role === 2) {
        // Wait a moment to ensure the user is created in the database
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const assignment = {
          id: response.id,
          role: data.role,
          shelter_FK: data.shelter_FK,
          uname: data.uname,
          email: data.email,
          activated: 1,
          banned: false,
          staffType: data.staffType,
          phone: data.phone
        };
        console.log('Sending assignment data:', assignment);
        try {
          await adminApi.assignToShelter(assignment);
        } catch (error) {
          console.error('Error assigning to shelter:', error);
          // If assignment fails, we should still return the created user
          return response;
        }
      }
      return response;
    }
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

  const handleAddUser = async () => {
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join('\n'));
      return;
    }

    try {
      const response = await addUserMutation.mutateAsync(newUser);
      console.log('Add user response:', response);
      
      // Update the cache immediately with the new user data
      queryClient.setQueryData(['adminUsers'], (oldData: any) => {
        const newUserData = {
          id: response.id,
          uname: newUser.uname,
          email: newUser.email,
          role: newUser.role,
          activated: 1,
          banned: false,
          staffType: newUser.staffType
        };
        return [...(oldData || []), newUserData];
      });

      // Close dialog and reset form
      setIsAddDialogOpen(false);
      setError(null);
      setNewUser({
        uname: '',
        email: '',
        password: '',
        role: 1,
        staffType: 0,
        phone: '',
        address: '',
        shelter_FK: 1,
      });

      // Force a refetch of the users list
      await queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      
      // Navigate to users list
      navigate('/admin/users', { replace: true });
    } catch (error: any) {
      console.error('Error adding user:', error);
      setError(error.response?.data?.message || 'Failed to add user');
    }
  };

  const getUserTypeChip = (role: number) => {
    const roleName = UserRole[role as keyof typeof UserRole];
    switch (roleName) {
      case 'ShelterStaff':
        return <Chip label="Shelter Staff" color="secondary" />;
      case 'Adopter':
        return <Chip label="Adopter" color="success" />;
      default:
        return <Chip label={roleName} />;
    }
  };

  const getAdminType = (user: AdminUser) => {
    return null;
  };

  const getStaffType = (user: StaffUser) => {
    if (UserRole[user.role as keyof typeof UserRole] === 'ShelterStaff') {
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

  const handleFilterChange = (field: string) => (event: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const filteredUsers = users?.filter((user: BaseUser) => {
    return (
      (!filters.type || user.staffType?.toString() === filters.type) &&
      (!filters.status || user.activated?.toString() === filters.status) &&
      (!filters.role || user.role?.toString() === filters.role)
    );
  }) || [];

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
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Users
        </Typography>
        {user?.adminType === 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsAddDialogOpen(true)}
            startIcon={<AddIcon />}
          >
            Add User
          </Button>
        )}
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>User Type</InputLabel>
            <Select
              value={filters.type}
              onChange={handleFilterChange('type')}
              label="User Type"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="0">Super Admin</MenuItem>
              <MenuItem value="1">Manager</MenuItem>
              <MenuItem value="2">Interviewer</MenuItem>
              <MenuItem value="3">CareTaker</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={filters.status}
              onChange={handleFilterChange('status')}
              label="Status"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="1">Active</MenuItem>
              <MenuItem value="0">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Role</InputLabel>
            <Select
              value={filters.role}
              onChange={handleFilterChange('role')}
              label="Role"
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="1">Adopter</MenuItem>
              <MenuItem value="2">ShelterStaff</MenuItem>
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.map((user: BaseUser) => (
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
              type={showPassword ? 'text' : 'password'}
              value={newUser.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              margin="normal"
              required
              error={error?.includes('Password')}
              helperText={error?.includes('Password') ? 'Password must contain at least 8 characters, 1 capital letter, and 1 number' : ''}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
                  select
                  label="Assign to Shelter"
                  value={newUser.shelter_FK}
                  onChange={(e) => handleInputChange('shelter_FK', parseInt(e.target.value))}
                  margin="normal"
                  required
                  error={error?.includes('Shelter')}
                  helperText={error?.includes('Shelter') ? 'Please select a shelter' : ''}
                >
                  {shelters.map((shelter) => (
                    <MenuItem key={shelter.id} value={shelter.id}>
                      {shelter.name}
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
    </Container>
  );
};

export default Users; 