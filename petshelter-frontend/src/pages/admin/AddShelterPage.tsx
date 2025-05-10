import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface AddShelterData {
  ShelterID: number;
  ShelterName: string;
  Location: string;
  Phone: string;
  Description: string;
}

interface AddShelterErrors extends Partial<AddShelterData> {
  submit?: string;
}

const AddShelterPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState<AddShelterData>({
    ShelterID: 0,
    ShelterName: '',
    Location: '',
    Phone: '',
    Description: ''
  });
  const [errors, setErrors] = useState<AddShelterErrors>({});
  const queryClient = useQueryClient();

  // Check if user has permission to add shelters
  if (user?.adminType !== 0) { // 0 is SuperAdmin
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          You do not have permission to add shelters. Only Super Admins can add new shelters.
        </Alert>
      </Container>
    );
  }

  const mutation = useMutation({
    mutationFn: adminApi.addShelter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelters'] });
      navigate('/admin/shelters');
    },
    onError: (error: any) => {
      if (error.message === 'Shelter already exists') {
        setErrors({
          ...errors,
          submit: 'A shelter with this name already exists'
        });
      } else {
        setErrors({
          ...errors,
          submit: 'Failed to add shelter. Please try again.'
        });
      }
    },
  });

  const validateForm = () => {
    const newErrors: Partial<AddShelterData> = {};
    
    if (!formData.ShelterName.trim()) {
      newErrors.ShelterName = 'Shelter name is required';
    } else if (formData.ShelterName.length < 3) {
      newErrors.ShelterName = 'Shelter name must be at least 3 characters';
    } else if (formData.ShelterName.length > 50) {
      newErrors.ShelterName = 'Shelter name must be less than 50 characters';
    }
    
    if (!formData.Location.trim()) {
      newErrors.Location = 'Location is required';
    } else if (formData.Location.length < 3) {
      newErrors.Location = 'Location must be at least 3 characters';
    }
    
    if (!formData.Phone.trim()) {
      newErrors.Phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.Phone)) {
      newErrors.Phone = 'Please enter a valid phone number';
    }
    
    if (!formData.Description.trim()) {
      newErrors.Description = 'Description is required';
    } else if (formData.Description.length < 15) {
      newErrors.Description = 'Description must be at least 15 characters';
    } else if (formData.Description.length > 255) {
      newErrors.Description = 'Description must be less than 255 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    console.log('Submitting shelter data:', formData);
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name as keyof AddShelterData]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/admin/shelters')}
            sx={{ mr: 2 }}
          >
            Back to Shelters
          </Button>
          <Typography variant="h4" component="h1">
            Add New Shelter
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Shelter Name"
                name="ShelterName"
                value={formData.ShelterName}
                onChange={handleChange}
                error={!!errors.ShelterName}
                helperText={errors.ShelterName}
                required
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
                helperText={errors.Location}
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
                helperText={errors.Phone}
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
                helperText={errors.Description}
                multiline
                rows={4}
                required
              />
            </Grid>

            {errors.submit && (
              <Grid item xs={12}>
                <Alert severity="error">{errors.submit}</Alert>
              </Grid>
            )}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/admin/shelters')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Adding Shelter...
                    </>
                  ) : (
                    'Add Shelter'
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

export default AddShelterPage; 