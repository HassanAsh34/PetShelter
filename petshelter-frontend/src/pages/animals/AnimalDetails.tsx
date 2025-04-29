import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Button,
  Grid,
  Paper,
  Alert,
  Container,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  Close,
  Pets,
  Category,
} from '@mui/icons-material';
import { animalsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Animal {
  id: number;
  name: string;
  age: number;
  breed: string;
  adoption_State: string;
  medication_history?: string;
  shelterCategory: {
    categoryId: number;
    categoryName: string;
  };
  shelterDto: {
    shelterId: number;
    shelterName: string;
    shelterLocation: string;
    shelterPhone: string;
  };
}

const AnimalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [currentAnimalIndex, setCurrentAnimalIndex] = React.useState<number>(-1);

  // Get all animals to determine navigation
  const { data: allAnimals } = useQuery<Animal[]>({
    queryKey: ['animals'],
    queryFn: async () => {
      try {
        const response = await animalsApi.getAll();
        return response.data || [];
      } catch (err) {
        console.error('Error fetching animals:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  // Find current animal index
  React.useEffect(() => {
    if (allAnimals && id) {
      const index = allAnimals.findIndex(animal => animal.id === Number(id));
      setCurrentAnimalIndex(index);
    }
  }, [allAnimals, id]);

  const { data: animal, isLoading, error } = useQuery<Animal>({
    queryKey: ['animal', id],
    queryFn: async () => {
      try {
        const response = await animalsApi.getById(id!);
        console.log('Animal details response:', response.data);
        return response.data;
      } catch (err) {
        console.error('Error fetching animal:', err);
        throw err;
      }
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });

  const handleAdopt = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/animals/${id}` } });
      return;
    }

    if (!animal) return;
    try {
      animalsApi.adopt({ animalId: animal.id });
      navigate('/animals');
    } catch (err) {
      console.error('Error adopting animal:', err);
    }
  };

  const handleNavigation = (direction: 'prev' | 'next') => {
    if (!allAnimals || currentAnimalIndex === -1) return;
    
    const newIndex = direction === 'prev' ? currentAnimalIndex - 1 : currentAnimalIndex + 1;
    if (newIndex >= 0 && newIndex < allAnimals.length) {
      navigate(`/animals/${allAnimals[newIndex].id}`, { replace: true });
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !animal) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Error loading animal details</Alert>
      </Container>
    );
  }

  return (
    <Box sx={{ position: 'relative', bgcolor: 'background.paper', minHeight: '100vh' }}>
      {/* Navigation buttons */}
      <Box sx={{ position: 'absolute', top: 20, right: 20, zIndex: 1 }}>
        <IconButton onClick={() => navigate('/', { replace: true })} size="large">
          <Close />
        </IconButton>
      </Box>
      <Box sx={{ position: 'absolute', top: '50%', left: 20, zIndex: 1 }}>
        <IconButton 
          onClick={() => handleNavigation('prev')}
          disabled={currentAnimalIndex <= 0}
          size="large"
          sx={{ 
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'background.default' },
            opacity: currentAnimalIndex <= 0 ? 0.5 : 1
          }}
        >
          <NavigateBefore />
        </IconButton>
      </Box>
      <Box sx={{ position: 'absolute', top: '50%', right: 20, zIndex: 1 }}>
        <IconButton 
          onClick={() => handleNavigation('next')}
          disabled={!allAnimals || currentAnimalIndex >= allAnimals.length - 1}
          size="large"
          sx={{ 
            bgcolor: 'background.paper',
            '&:hover': { bgcolor: 'background.default' },
            opacity: (!allAnimals || currentAnimalIndex >= allAnimals.length - 1) ? 0.5 : 1
          }}
        >
          <NavigateNext />
        </IconButton>
      </Box>

      <Container maxWidth="lg" sx={{ pt: 8, pb: 4 }}>
        <Grid container spacing={4}>
          {/* Left column - Animal Image */}
          <Grid item xs={12} md={6}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                sx={{
                  height: 400,
                  objectFit: 'cover',
                }}
                image={`https://source.unsplash.com/featured/800x600/?${animal.breed.toLowerCase()},pet`}
                alt={animal.name}
              />
            </Card>
          </Grid>

          {/* Right column - Animal Details */}
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              {/* Basic Info */}
              <Paper sx={{ p: 3 }}>
                <Stack spacing={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h4" component="h1" gutterBottom>
                      {animal.name}
                    </Typography>
                    {animal.shelterCategory && (
                      <Chip
                        icon={<Category />}
                        label={animal.shelterCategory.categoryName}
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <Typography variant="h6" color="text.secondary">
                    {animal.breed} • {animal.age} years old
                  </Typography>
                  <Chip
                    icon={<Pets />}
                    label={animal.adoption_State}
                    color={animal.adoption_State === 'Available' ? "success" : "default"}
                    variant="outlined"
                  />
                  {animal.medication_history && (
                    <Typography variant="body1" paragraph>
                      <strong>Medical History:</strong><br />
                      {animal.medication_history}
                    </Typography>
                  )}
                </Stack>
              </Paper>

              {/* Shelter Info */}
              {animal.shelterDto && (
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Shelter Information
                  </Typography>
                  <Stack spacing={2}>
                    <Typography variant="body1">
                      <strong>Name:</strong> {animal.shelterDto.shelterName}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Location:</strong> {animal.shelterDto.shelterLocation}
                    </Typography>
                    <Typography variant="body1">
                      <strong>Phone:</strong> {animal.shelterDto.shelterPhone}
                    </Typography>
                  </Stack>
                </Paper>
              )}

              {/* Action Buttons */}
              <Box sx={{ mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleAdopt}
                >
                  {animal.adoption_State === 'Available' ? 'Adopt Now' : 'Login to Adopt'}
                </Button>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default AnimalDetails; 