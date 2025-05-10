import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Alert,
  CircularProgress,
  SelectChangeEvent,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../../services/api';

interface Category {
  categoryId: number;
  categoryName: string;
  shelter: {
    shelterId: number;
    shelterName: string;
  };
}

// Match the backend enum values
enum AdoptionState {
  Adopted = 0,
  Pending = 1,
  Available = 2
}

interface Animal {
  name: string;
  age: number;
  breed: string;
  medication_history: string;
  Category_FK: number;
  Adoption_State: AdoptionState;
}

interface FormData {
  name: string;
  age: string;
  breed: string;
  medication_history: string;
  Category_FK: string;
  Adoption_State: AdoptionState;
}

const AddPetPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    age: '',
    breed: '',
    medication_history: '',
    Category_FK: '',
    Adoption_State: AdoptionState.Available, // Use the enum value
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => staffApi.getCategories(),
  });

  // Filter out categories with "unset" in their name
  const filteredCategories = categories?.filter(
    category => !category.categoryName.toLowerCase().includes('unset')
  );

  const addPetMutation = useMutation({
    mutationFn: (data: Animal) => staffApi.addPet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staffPets'] });
      navigate('/staff/pets');
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const animalData: Animal = {
      name: formData.name,
      age: Number(formData.age),
      breed: formData.breed,
      medication_history: formData.medication_history,
      Category_FK: Number(formData.Category_FK),
      Adoption_State: formData.Adoption_State,
    };
    addPetMutation.mutate(animalData);
  };

  if (isLoadingCategories) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Add New Pet
        </Typography>

        {addPetMutation.isError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Error adding pet. Please try again.
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Pet Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                inputProps={{ minLength: 3, maxLength: 50 }}
                helperText="Name must be between 3 and 50 characters"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                label="Breed"
                name="breed"
                value={formData.breed}
                onChange={handleChange}
                inputProps={{ minLength: 2 }}
                helperText="Breed must be at least 2 characters"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="Category_FK"
                  value={formData.Category_FK}
                  label="Category"
                  onChange={handleChange}
                >
                  {filteredCategories?.map((category) => (
                    <MenuItem key={category.categoryId} value={category.categoryId.toString()}>
                      {category.categoryName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                multiline
                rows={4}
                label="Medication History"
                name="medication_history"
                value={formData.medication_history}
                onChange={handleChange}
                inputProps={{ minLength: 15, maxLength: 255 }}
                helperText="Please write a brief description of the pet's medication history (15-255 characters)"
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={() => navigate('/staff/pets')}
                  disabled={addPetMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={addPetMutation.isPending}
                >
                  {addPetMutation.isPending ? <CircularProgress size={24} /> : 'Add Pet'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Paper>
    </Box>
  );
};

export default AddPetPage; 