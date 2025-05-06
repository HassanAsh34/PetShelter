import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Modal,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Shelter {
  shelterId: number;
  shelterName: string;
  shelterLocation: string;
  shelterPhone: string;
  description: string | null;
  countStaff: number;
  categories: any[] | null;
  staff: any[] | null;
}

interface AddShelterData {
  ShelterName: string;
  Location: string;
  Phone: string;
  Description: string;
}

interface ApiError extends Error {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

interface StaffMember {
  StaffId: number;
  Uname: string;
  Email: string;
  Phone: string;
}

interface Category {
  CategoryId: number;
  CategoryName: string;
}

interface ShelterDetails {
  ShelterId: number;
  ShelterName: string;
  ShelterLocation: string;
  ShelterPhone: string;
  Description: string;
  CountStaff: number;
  staff?: StaffMember[];
  Categories?: Category[];
}

export default function Shelters() {
  const navigate = useNavigate();
  const { user, isAdmin, adminType } = useAuth();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [selectedShelter, setSelectedShelter] = useState<Shelter | null>(null);
  const [formData, setFormData] = useState<AddShelterData>({
    ShelterName: '',
    Location: '',
    Phone: '',
    Description: '',
  });
  const [errors, setErrors] = useState<Partial<AddShelterData>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [shelterToDelete, setShelterToDelete] = useState<Shelter | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add detailed debug logging
  const isSuperAdmin = user?.adminType === 0;
  console.log('User admin type:', user?.adminType);
  console.log('Is SuperAdmin:', isSuperAdmin);
  console.log('Dialog open state:', open);

  // Fetch all shelters
  const { data: shelters, isLoading, error: sheltersError } = useQuery({
    queryKey: ['shelters'],
    queryFn: () => adminApi.getShelters(),
    enabled: isAdmin
  });

  // Fetch shelter details
  const { data: shelterDetails, isLoading: isLoadingDetails, error: shelterDetailsError } = useQuery({
    queryKey: ['shelterDetails', selectedShelter?.shelterId],
    queryFn: () => adminApi.getShelterDetails(selectedShelter?.shelterId || 0),
    enabled: !!selectedShelter?.shelterId && isSuperAdmin,
    retry: 1,
  });

  // Add shelter mutation
  const addShelterMutation = useMutation({
    mutationFn: (data: {
      ShelterName: string;
      Location: string;
      Phone: string;
      Description: string;
    }) => adminApi.addShelter(data),
    onSuccess: () => {
      console.log('Shelter added successfully');
      queryClient.invalidateQueries({ queryKey: ['shelters'] });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      setError(error.message || 'Failed to add shelter');
    }
  });

  // Delete shelter mutation
  const deleteShelterMutation = useMutation({
    mutationFn: (shelterId: number) => adminApi.deleteShelter(shelterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelters'] });
    },
  });

  const handleOpen = () => {
    console.log('Opening add shelter dialog');
    setOpen(true);
    setError(null);
    setErrors({});
    setFormData({
      ShelterName: '',
      Location: '',
      Phone: '',
      Description: ''
    });
  };

  const handleClose = () => {
    console.log('Closing add shelter dialog');
    setOpen(false);
    setError(null);
    setErrors({});
    setFormData({
      ShelterName: '',
      Location: '',
      Phone: '',
      Description: ''
    });
  };

  const handleViewDetails = (shelter: Shelter) => {
    navigate(`/admin/shelters/${shelter.shelterId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    try {
      console.log('Attempting to add shelter with data:', formData);
      const result = await addShelterMutation.mutateAsync(formData);
      console.log('Add shelter result:', result);
      
      // Close dialog and refresh list on success
      handleClose();
      queryClient.invalidateQueries({ queryKey: ['shelters'] });
    } catch (error: any) {
      console.error('Error adding shelter:', error);
      if (error.response?.status === 401) {
        setError('Unauthorized: You do not have permission to add shelters');
      } else if (error.response?.status === 400) {
        setError(error.response.data.message || 'Failed to add shelter');
      } else {
        setError(error.message || 'Failed to add shelter. Please try again.');
      }
    }
  };

  const validateForm = () => {
    const newErrors: Partial<AddShelterData> = {};
    
    // Shelter Name validation
    if (!formData.ShelterName) {
      newErrors.ShelterName = 'Shelter name is required';
    } else if (formData.ShelterName.length < 3) {
      newErrors.ShelterName = 'Shelter name must be at least 3 characters';
    } else if (formData.ShelterName.length > 50) {
      newErrors.ShelterName = 'Shelter name must be at most 50 characters';
    }

    // Location validation
    if (!formData.Location) {
      newErrors.Location = 'Location is required';
    } else if (formData.Location.length < 3) {
      newErrors.Location = 'Location must be at least 3 characters';
    }

    // Phone validation
    if (!formData.Phone) {
      newErrors.Phone = 'Phone is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.Phone)) {
      newErrors.Phone = 'Please enter a valid phone number';
    }

    // Description validation
    if (!formData.Description) {
      newErrors.Description = 'Description is required';
    } else if (formData.Description.length < 15) {
      newErrors.Description = 'Description must be at least 15 characters';
    } else if (formData.Description.length > 255) {
      newErrors.Description = 'Description must be at most 255 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    console.log('Form field changed:', name, value);
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for the field being changed
    if (errors[name as keyof AddShelterData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleDeleteClick = (shelter: Shelter) => {
    console.log('Delete clicked for shelter:', shelter);
    setShelterToDelete(shelter);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (shelterToDelete) {
      try {
        console.log('Confirming deletion of shelter:', shelterToDelete);
        await deleteShelterMutation.mutateAsync(shelterToDelete.shelterId);
        setIsDeleteDialogOpen(false);
        setShelterToDelete(null);
      } catch (error) {
        console.error('Error deleting shelter:', error);
        setError('Failed to delete shelter. Please try again.');
      }
    }
  };

  const handleCloseDeleteDialog = () => {
    console.log('Closing delete dialog');
    setIsDeleteDialogOpen(false);
    setShelterToDelete(null);
  };

  const handleCloseDetails = () => {
    setSelectedShelter(null);
  };

  if (!isAdmin) {
    return (
      <Container>
        <Typography variant="h5" color="error" align="center">
          You do not have permission to access this page.
        </Typography>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (sheltersError) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          Error loading shelters: {sheltersError instanceof Error ? sheltersError.message : 'Unknown error'}
        </Alert>
      </Container>
    );
  }

  if (!shelters || shelters.length === 0) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 4 }}>
          No shelters found. Add a new shelter to get started.
        </Alert>
        {isSuperAdmin && (
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              console.log('Add Shelter button clicked');
              handleOpen();
            }}
            sx={{ mt: 2 }}
          >
            Add Shelter
          </Button>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Shelters
        </Typography>
        {isSuperAdmin && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            startIcon={<AddIcon />}
          >
            Add Shelter
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        {shelters.map((shelter: Shelter) => (
          <Grid item xs={12} md={6} lg={4} key={shelter.shelterId}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" component="div" gutterBottom>
                      {shelter.shelterName}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom>
                      {shelter.shelterLocation}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      ID: {shelter.shelterId}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Phone: {shelter.shelterPhone}
                    </Typography>
                  </Box>
                  <Box>
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetails(shelter)}
                      aria-label={`View details for ${shelter.shelterName}`}
                    >
                      <ViewIcon />
                    </IconButton>
                    {isSuperAdmin && (
                      <IconButton
                        color="error"
                        onClick={() => handleDeleteClick(shelter)}
                        aria-label={`Delete ${shelter.shelterName}`}
                        disabled={deleteShelterMutation.isPending}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                </Box>
                {shelter.description && (
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      mt: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {shelter.description}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Shelter Details Dialog */}
      <Dialog
        open={!!selectedShelter}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            {selectedShelter?.shelterName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Shelter Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {isLoadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : shelterDetailsError ? (
            <Box sx={{ p: 2 }}>
              <Typography color="error">
                {isSuperAdmin 
                  ? 'Error loading shelter details'
                  : 'Only SuperAdmin can view detailed shelter information'}
              </Typography>
            </Box>
          ) : shelterDetails ? (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, mb: 2 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Basic Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          ID
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {shelterDetails.ShelterId}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Name
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {shelterDetails.ShelterName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Location
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {shelterDetails.ShelterLocation}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Phone
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {shelterDetails.ShelterPhone}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Paper sx={{ p: 3, mb: 2 }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                      {shelterDetails.Description}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Staff Members */}
                {shelterDetails.staff && shelterDetails.staff.length > 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6" color="primary">
                          Staff Members
                        </Typography>
                        <Box
                          sx={{
                            ml: 2,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            bgcolor: (theme) => {
                              const count = shelterDetails.CountStaff;
                              if (count >= 10) return theme.palette.success.light;
                              if (count >= 5) return theme.palette.warning.light;
                              return theme.palette.error.light;
                            },
                            color: (theme) => {
                              const count = shelterDetails.CountStaff;
                              if (count >= 10) return theme.palette.success.contrastText;
                              if (count >= 5) return theme.palette.warning.contrastText;
                              return theme.palette.error.contrastText;
                            },
                          }}
                        >
                          <Typography variant="subtitle2">
                            {shelterDetails.CountStaff} staff members
                          </Typography>
                        </Box>
                      </Box>
                      <Grid container spacing={2}>
                        {shelterDetails.staff.map((staff: StaffMember) => (
                          <Grid item xs={12} md={6} key={staff.StaffId}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 2, height: '100%' }}
                            >
                              <Typography variant="subtitle1">
                                {staff.Uname}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {staff.Email}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {staff.Phone}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Categories */}
                {shelterDetails.Categories && shelterDetails.Categories.length > 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 3 }}>
                      <Typography variant="h6" color="primary" gutterBottom>
                        Categories
                      </Typography>
                      <Grid container spacing={2}>
                        {shelterDetails.Categories.map((category: Category) => (
                          <Grid item xs={12} sm={6} md={4} key={category.CategoryId}>
                            <Paper
                              variant="outlined"
                              sx={{ p: 2, height: '100%' }}
                            >
                              <Typography variant="subtitle1">
                                {category.CategoryName}
                              </Typography>
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          ) : (
            <Box sx={{ p: 2 }}>
              <Typography color="error">
                {isSuperAdmin 
                  ? 'No shelter details available'
                  : 'Only SuperAdmin can view detailed shelter information'}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Add Shelter Dialog */}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="add-shelter-modal"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            maxWidth: 500,
            bgcolor: 'background.paper',
            boxShadow: 24,
            p: 4,
            borderRadius: 2,
            outline: 'none'
          }}
        >
          <Typography variant="h6" component="h2" gutterBottom>
            Add New Shelter
          </Typography>
          <form onSubmit={handleSubmit} noValidate>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Shelter Name"
                  name="ShelterName"
                  value={formData.ShelterName}
                  onChange={handleChange}
                  error={!!errors.ShelterName}
                  helperText={errors.ShelterName || "3-50 characters"}
                  required
                  autoFocus
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="Location"
                  value={formData.Location}
                  onChange={handleChange}
                  error={!!errors.Location}
                  helperText={errors.Location || "Minimum 3 characters"}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="Phone"
                  value={formData.Phone}
                  onChange={handleChange}
                  error={!!errors.Phone}
                  helperText={errors.Phone || "Enter a valid phone number"}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="Description"
                  value={formData.Description}
                  onChange={handleChange}
                  error={!!errors.Description}
                  helperText={errors.Description || "15-255 characters"}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
            </Grid>
            {error && (
              <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
                {error}
              </Alert>
            )}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={handleClose} color="inherit">
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={addShelterMutation.isPending}
              >
                {addShelterMutation.isPending ? 'Adding...' : 'Add Shelter'}
              </Button>
            </Box>
          </form>
        </Box>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">
          Confirm Delete
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {shelterToDelete?.shelterName}? This action cannot be undone.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteShelterMutation.isPending}
          >
            {deleteShelterMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
} 