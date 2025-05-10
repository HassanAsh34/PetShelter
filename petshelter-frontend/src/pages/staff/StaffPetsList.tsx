import React from 'react';
import {
  Box,
  Typography,
  List,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Chip,
  Paper,
} from '@mui/material';
import {
  Pets,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../../services/api';

interface Animal {
  id: number;
  name: string;
  age: number;
  breed: string;
  adoption_State: string;
  shelterCategory: {
    categoryId: number;
    categoryName: string;
    shelter: null;
    animalCount: number;
  };
  shelterDto: {
    shelterId: number;
    shelterName: string;
    shelterLocation: string;
    shelterPhone: string;
    description: null;
    countStaff: number;
    categories: null;
    staff: null;
  };
}

const StaffPetsList = () => {
  const navigate = useNavigate();
  const { data: pets, isLoading, error } = useQuery<Animal[]>({
    queryKey: ['staffPets'],
    queryFn: async () => {
      const response = await staffApi.getShelterPets();
      console.log('Raw API Response:', response);
      return response;
    },
    enabled: true,
    retry: false,
  });

  // Add logging to see the response data
  React.useEffect(() => {
    if (pets) {
      console.log('Pets data from backend:', pets);
      console.log('First pet adoption state:', pets[0]?.adoption_State);
      console.log('First pet complete data:', pets[0]);
    }
    if (error) {
      console.error('Error fetching pets:', error);
    }
  }, [pets, error]);

  const handleAddPet = () => {
    navigate('/staff/pets/add');
  };

  const handleEditPet = (petId: number) => {
    navigate(`/staff/pets/edit/${petId}`);
  };

  const handleDeletePet = async (petId: number) => {
    if (window.confirm('Are you sure you want to delete this pet?')) {
      try {
        await staffApi.deletePet(petId);
        window.location.reload();
      } catch (error) {
        console.error('Error deleting pet:', error);
      }
    }
  };

  const getStatusColor = (status: string | undefined | null) => {
    if (!status) return 'default';
    
    switch (status.toLowerCase()) {
      case 'available':
        return 'success';
      case 'adopted':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Pets List</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddPet}
        >
          Add New Pet
        </Button>
      </Stack>

      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">Error loading pets</Alert>
      ) : !pets || pets.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center">
          No pets found in your shelter
        </Typography>
      ) : (
        <List>
          {pets.map((pet) => (
            <Paper
              key={pet.id}
              sx={{
                mb: 2,
                p: 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Pets />
                <Box flex={1}>
                  <Typography variant="h6">{pet.name}</Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">
                      Status:
                    </Typography>
                    <Chip
                      label={pet.adoption_State}
                      color={getStatusColor(pet.adoption_State)}
                      size="small"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Category: {pet.shelterCategory.categoryName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Breed: {pet.breed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Age: {pet.age} years
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    startIcon={<EditIcon />}
                    onClick={() => handleEditPet(pet.id)}
                    size="small"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDeletePet(pet.id)}
                    size="small"
                  >
                    Delete
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default StaffPetsList; 