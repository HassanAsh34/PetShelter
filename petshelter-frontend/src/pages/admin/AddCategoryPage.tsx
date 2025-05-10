import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  MenuItem
} from '@mui/material';
import { ArrowBack as BackIcon } from '@mui/icons-material';
import { useMutation } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface AddCategoryData {
  CategoryName: string;
  Shelter_FK: number;
}

interface Shelter {
  shelterId: number;
  shelterName: string;
}

const AddCategoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddCategoryData>({
    CategoryName: '',
    Shelter_FK: 0
  });

  // Get shelterId from query params if it exists
  const queryParams = new URLSearchParams(location.search);
  const shelterId = queryParams.get('shelterId');

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const data = await adminApi.getShelters();
        setShelters(data);
        if (shelterId) {
          setFormData(prev => ({
            ...prev,
            Shelter_FK: parseInt(shelterId)
          }));
        }
      } catch (err) {
        setError('Failed to fetch shelters');
      }
    };

    fetchShelters();
  }, [shelterId]);

  // Check if user has permission to add categories
  if (user?.adminType !== 0) { // 0 is SuperAdmin
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          You do not have permission to add categories. Only Super Admins can add new categories.
        </Alert>
      </Container>
    );
  }

  const addCategoryMutation = useMutation({
    mutationFn: (data: AddCategoryData) => adminApi.addCategory(data),
    onSuccess: () => {
      navigate(`/admin/categories${shelterId ? `?shelterId=${shelterId}` : ''}`);
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to add category');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'Shelter_FK' ? parseInt(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCategoryMutation.mutate(formData);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(`/admin/categories${shelterId ? `?shelterId=${shelterId}` : ''}`)}
          sx={{ mb: 2 }}
        >
          Back to Categories
        </Button>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Add New Category
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Category Name"
                  name="CategoryName"
                  value={formData.CategoryName}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Shelter"
                  name="Shelter_FK"
                  value={formData.Shelter_FK}
                  onChange={handleChange}
                  required
                  disabled={!!shelterId}
                >
                  {shelters.map((shelter) => (
                    <MenuItem key={shelter.shelterId} value={shelter.shelterId}>
                      {shelter.shelterName}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={addCategoryMutation.isPending}
                  fullWidth
                >
                  {addCategoryMutation.isPending ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Add Category'
                  )}
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default AddCategoryPage; 