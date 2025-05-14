import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../../services/api';

interface PetFormData {
  name: string;
  breed: string;
  age: number;
  categoryId: number;
  medication_history?: string;
}

const AddEditPet = () => {
  const navigate = useNavigate();
  const { petId } = useParams();
  const queryClient = useQueryClient();
  const isEditMode = Boolean(petId);

  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    breed: '',
    age: 0,
    categoryId: 0,
    medication_history: '',
  });

  const [error, setError] = useState<string | null>(null);

  // Fetch categories for the dropdown
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => staffApi.getCategories(),
  });

  // Fetch pet details if in edit mode
  const { data: petDetails } = useQuery({
    queryKey: ['pet', petId],
    queryFn: () => staffApi.getPetDetails(Number(petId)),
    enabled: isEditMode,
  });

  // Set initial form data when pet details are loaded
  useEffect(() => {
    if (isEditMode && petDetails) {
      setFormData({
        name: petDetails.name,
        breed: petDetails.breed,
        age: petDetails.age,
        categoryId: petDetails.shelterCategory.categoryId,
        medication_history: petDetails.medication_history || '',
      });
    }
  }, [isEditMode, petDetails]);

  const addPetMutation = useMutation({
    mutationFn: (data: PetFormData) => staffApi.addPet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffPets'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      navigate('/staff/dashboard');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to add pet');
    },
  });

  const updatePetMutation = useMutation({
    mutationFn: (data: PetFormData) => staffApi.updatePet({
      id: Number(petId),
      name: data.name,
      breed: data.breed,
      age: data.age,
      Category_FK: data.categoryId,
      medication_history: data.medication_history,
      Adoption_State: petDetails?.Adoption_State || 2 // Keep the current adoption state
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffPets'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      navigate('/staff/pets');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to update pet');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isEditMode) {
      updatePetMutation.mutate(formData);
    } else {
      addPetMutation.mutate(formData);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? 'Edit Pet' : 'Add New Pet'}
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Pet Name"
                name="name"
                value={formData.name}
                onChange={handleTextChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Breed"
                name="breed"
                value={formData.breed}
                onChange={handleTextChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleTextChange}
                required
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleSelectChange}
                  label="Category"
                >
                  {categories?.map((category: any) => (
                    <MenuItem key={category.categoryId} value={category.categoryId}>
                      {category.categoryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Medical History"
                name="medication_history"
                value={formData.medication_history}
                onChange={handleTextChange}
                multiline
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/staff/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={addPetMutation.isPending || updatePetMutation.isPending}
                >
                  {isEditMode ? 'Update Pet' : 'Add Pet'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Container>
  );
};

export default AddEditPet; 