import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
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
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface EditCategoryData {
  CategoryId: number;
  CategoryName: string;
  Shelter_FK: number;
}

interface Shelter {
  shelterId: number;
  shelterName: string;
}

const EditCategoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { categoryId } = useParams();
  const { user } = useAuth();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<EditCategoryData>({
    CategoryId: 0,
    CategoryName: '',
    Shelter_FK: 0
  });

  // Get initial category data from location state
  useEffect(() => {
    const categoryData = location.state?.category;
    if (categoryData) {
      setFormData(categoryData);
    }
  }, [location.state]);

  // Fetch shelters
  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const data = await adminApi.getShelters();
        setShelters(data);
      } catch (error) {
        console.error('Error fetching shelters:', error);
      }
    };

    fetchShelters();
  }, []);

  // Check if user has permission to edit categories
  if (user?.adminType !== 0) { // 0 is SuperAdmin
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">
          You do not have permission to edit categories. Only Super Admins can edit categories.
        </Alert>
      </Container>
    );
  }

  const updateCategoryMutation = useMutation({
    mutationFn: (data: EditCategoryData) => adminApi.updateCategory(data),
    onSuccess: () => {
      navigate('/admin/categories');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to update category');
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCategoryMutation.mutate(formData);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate('/admin/categories')}
          sx={{ mb: 2 }}
        >
          Back to Categories
        </Button>

        <Paper sx={{ p: 3 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            Edit Category
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
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={updateCategoryMutation.isPending}
                  fullWidth
                >
                  {updateCategoryMutation.isPending ? (
                    <CircularProgress size={24} />
                  ) : (
                    'Update Category'
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

export default EditCategoryPage; 