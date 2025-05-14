import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi, Shelter } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface EditShelterData {
  shelterId: number;
  shelterName: string;
  shelterLocation: string;
  shelterPhone: string;
  description: string;
}

const EditShelterPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditShelterData>({
    shelterId: 0,
    shelterName: '',
    shelterLocation: '',
    shelterPhone: '',
    description: ''
  });

  // Fetch shelter details
  const { data: shelter, isLoading } = useQuery<Shelter>({
    queryKey: ['shelter', id],
    queryFn: () => adminApi.getShelterDetails(Number(id)),
    enabled: !!id,
  });

  // Update form data when shelter data is loaded
  useEffect(() => {
    if (shelter) {
      setFormData({
        shelterId: shelter.shelterId,
        shelterName: shelter.shelterName,
        shelterLocation: shelter.shelterLocation,
        shelterPhone: shelter.shelterPhone,
        description: shelter.description || ''
      });
    }
  }, [shelter]);

  // Check if user has permission to edit shelters
  if (user?.adminType !== 0) { // 0 is SuperAdmin
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          You do not have permission to edit shelters. Only Super Admins can edit shelters.
        </Alert>
      </Container>
    );
  }

  const updateShelterMutation = useMutation({
    mutationFn: async (data: EditShelterData) => {
      const Shelter = {
        shelterId: data.shelterId,
        shelterName: data.shelterName,
        shelterLocation: data.shelterLocation,
        shelterPhone: data.shelterPhone,
        description: data.description
      };
      console.log('Sending data to API:', Shelter);
      return adminApi.updateShelter(Shelter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelters'] });
      queryClient.invalidateQueries({ queryKey: ['shelter', id] });
      navigate(`/admin/shelters/${id}`);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to update shelter');
    }
  });

  const validateForm = () => {
    const newErrors: Partial<EditShelterData> = {};
    
    if (!formData.shelterName.trim()) {
      newErrors.shelterName = 'Shelter name is required';
    } else if (formData.shelterName.length < 3) {
      newErrors.shelterName = 'Shelter name must be at least 3 characters';
    } else if (formData.shelterName.length > 50) {
      newErrors.shelterName = 'Shelter name must be less than 50 characters';
    }
    
    if (!formData.shelterLocation.trim()) {
      newErrors.shelterLocation = 'Location is required';
    } else if (formData.shelterLocation.length < 3) {
      newErrors.shelterLocation = 'Location must be at least 3 characters';
    }
    
    if (!formData.shelterPhone.trim()) {
      newErrors.shelterPhone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.shelterPhone)) {
      newErrors.shelterPhone = 'Please enter a valid phone number';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length < 15) {
      newErrors.description = 'Description must be at least 15 characters';
    } else if (formData.description.length > 255) {
      newErrors.description = 'Description must be less than 255 characters';
    }

    const firstError = Object.values(newErrors)[0];
    setError(firstError ? String(firstError) : null);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    updateShelterMutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) {
      setError(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(`/admin/shelters/${id}`)}
            sx={{ mr: 2 }}
          >
            Back to Shelter Details
          </Button>
          <Typography variant="h4" component="h1">
            Edit Shelter
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Shelter Name"
                name="shelterName"
                value={formData.shelterName}
                onChange={handleChange}
                error={!!error && error.includes('Shelter name')}
                helperText={error && error.includes('Shelter name') ? error : ''}
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
                error={!!error && error.includes('Location')}
                helperText={error && error.includes('Location') ? error : ''}
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
                error={!!error && error.includes('Phone')}
                helperText={error && error.includes('Phone') ? error : ''}
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
                error={!!error && error.includes('Description')}
                helperText={error && error.includes('Description') ? error : ''}
                multiline
                rows={4}
                required
              />
            </Grid>

            {error && !error.includes('required') && (
              <Grid item xs={12}>
                <Alert severity="error">{error}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate(`/admin/shelters/${id}`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={updateShelterMutation.isPending}
                >
                  {updateShelterMutation.isPending ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Saving Changes...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default EditShelterPage; 