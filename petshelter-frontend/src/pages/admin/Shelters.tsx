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
  shelterName: string;
  shelterLocation: string;
  shelterPhone: string;
  description: string;
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
    shelterName: '',
    shelterLocation: '',
    shelterPhone: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<AddShelterData>>({});
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [shelterToDelete, setShelterToDelete] = useState<Shelter | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Add detailed debug logging
  const isSuperAdmin = user?.adminType === 0;

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
    mutationFn: (data: AddShelterData) => adminApi.addShelter(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelters'] });
    },
  });

  // Delete shelter mutation
  const deleteShelterMutation = useMutation({
    mutationFn: (shelterId: number) => adminApi.deleteShelter(shelterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelters'] });
    },
  });

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFormData({
      shelterName: '',
      shelterLocation: '',
      shelterPhone: '',
      description: '',
    });
    setErrors({});
  };

  const handleViewDetails = (shelter: Shelter) => {
    navigate(`/admin/shelters/${shelter.shelterId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        await addShelterMutation.mutateAsync(formData);
        handleClose();
      } catch (error) {
        console.error('Error adding shelter:', error);
      }
    }
  };

  const validateForm = () => {
    const newErrors: Partial<AddShelterData> = {};
    if (!formData.shelterName) newErrors.shelterName = 'Shelter name is required';
    if (!formData.shelterLocation) newErrors.shelterLocation = 'Location is required';
    if (!formData.shelterPhone) newErrors.shelterPhone = 'Phone is required';
    if (!formData.description) newErrors.description = 'Description is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteClick = (shelter: Shelter) => {
    setShelterToDelete(shelter);
  };

  const handleDeleteConfirm = async () => {
    if (shelterToDelete) {
      try {
        await deleteShelterMutation.mutateAsync(shelterToDelete.shelterId);
        setShelterToDelete(null);
      } catch (error) {
        console.error('Error deleting shelter:', error);
      }
    }
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
            onClick={handleOpen}
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
      <Dialog 
        open={open} 
        onClose={handleClose} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>Add New Shelter</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Shelter Name"
                  name="shelterName"
                  value={formData.shelterName}
                  onChange={handleChange}
                  error={!!errors.shelterName}
                  helperText={errors.shelterName}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  name="shelterLocation"
                  value={formData.shelterLocation}
                  onChange={handleChange}
                  error={!!errors.shelterLocation}
                  helperText={errors.shelterLocation}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="shelterPhone"
                  value={formData.shelterPhone}
                  onChange={handleChange}
                  error={!!errors.shelterPhone}
                  helperText={errors.shelterPhone}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  error={!!errors.description}
                  helperText={errors.description}
                  multiline
                  rows={4}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={addShelterMutation.isPending}
            >
              {addShelterMutation.isPending ? 'Adding...' : 'Add Shelter'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {shelterToDelete?.shelterName}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
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