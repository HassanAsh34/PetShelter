import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  CircularProgress,
  Alert,
  Button,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { ArrowBack as BackIcon, Edit as EditIcon } from '@mui/icons-material';
import { useMutation, useQuery } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface CategoryDetails {
  categoryId: number;
  categoryName: string;
  categoryDescription: string;
  shelter_FK: number;
  shelter?: {
    shelterId: number;
    shelterName: string;
    shelterLocation: string;
    shelterPhone: string;
  };
  animals?: Array<{
    animalId: number;
    animalName: string;
    animalType: string;
    animalBreed: string;
    animalAge: number;
    animalGender: string;
    animalStatus: string;
  }>;
}

const CategoryDetails = () => {
  const navigate = useNavigate();
  const { categoryId } = useParams<{ categoryId: string }>();
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editData, setEditData] = useState<Partial<CategoryDetails>>({});
  const [error, setError] = useState<string | null>(null);

  const { data: category, isLoading, error: queryError } = useQuery({
    queryKey: ['category', categoryId],
    queryFn: () => adminApi.getCategoryDetails(parseInt(categoryId!)),
    enabled: !!categoryId
  });

  const updateCategoryMutation = useMutation({
    mutationFn: (data: CategoryDetails) => adminApi.updateCategory(data),
    onSuccess: () => {
      setIsEditDialogOpen(false);
      setError(null);
    },
    onError: (error: any) => {
      setError(error.message || 'Failed to update category');
    }
  });

  const handleEditClick = () => {
    if (category) {
      setEditData({
        categoryId: category.categoryId,
        categoryName: category.categoryName,
        categoryDescription: category.categoryDescription,
        shelter_FK: category.shelter_FK
      });
      setIsEditDialogOpen(true);
    }
  };

  const handleEditSubmit = () => {
    if (editData.categoryName && editData.categoryDescription) {
      updateCategoryMutation.mutate(editData as CategoryDetails);
    } else {
      setError('Please fill in all required fields');
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (queryError) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">Error loading category details</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Button
          startIcon={<BackIcon />}
          onClick={() => navigate(-1)}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Category Details
        </Typography>
        {user?.adminType === 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleEditClick}
            startIcon={<EditIcon />}
          >
            Edit Category
          </Button>
        )}
      </Box>

      <Paper sx={{ p: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Name:</strong> {category?.categoryName}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Description:</strong> {category?.categoryDescription}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Shelter Information
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Shelter:</strong> {category?.shelter?.shelterName}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Location:</strong> {category?.shelter?.shelterLocation}
            </Typography>
            <Typography variant="body1" gutterBottom>
              <strong>Phone:</strong> {category?.shelter?.shelterPhone}
            </Typography>
          </Grid>

          {category?.animals && category.animals.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Animals in this Category
              </Typography>
              <Box sx={{ mt: 2 }}>
                {category.animals.map((animal) => (
                  <Paper key={animal.animalId} sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle1">
                      {animal.animalName} ({animal.animalBreed})
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Type: {animal.animalType} | Age: {animal.animalAge} | Gender: {animal.animalGender}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Status: {animal.animalStatus}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Category Name"
              value={editData.categoryName || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, categoryName: e.target.value }))}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Category Description"
              value={editData.categoryDescription || ''}
              onChange={(e) => setEditData(prev => ({ ...prev, categoryDescription: e.target.value }))}
              margin="normal"
              required
              multiline
              rows={4}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={updateCategoryMutation.isPending}
          >
            {updateCategoryMutation.isPending ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CategoryDetails; 