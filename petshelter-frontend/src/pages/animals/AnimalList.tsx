import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  TextField,
  CardActions,
  Alert,
  Container,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { animalsApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

// Add enum for adoption states
enum AdoptionState {
  Adopted = 0,
  Pending = 1,
  Available = 2
}

interface Animal {
  id: number;
  name: string;
  age: number;
  breed: string;
  adoption_State: string;
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

interface Shelter {
  ShelterId: number;
  ShelterName: string;
}

interface Category {
  CategoryId: number;
  CategoryName: string;
}

const AnimalList = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchName, setSearchName] = useState('');
  const [selectedShelter, setSelectedShelter] = useState<number | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [filteredAnimals, setFilteredAnimals] = useState<Animal[]>([]);

  // Fetch all animals
  const { data: animals, isLoading, error } = useQuery<Animal[]>({
    queryKey: ['animals', searchName],
    queryFn: async () => {
      try {
        const response = await animalsApi.getAll(searchName);
        console.log('Animals list full response:', {
          data: response.data,
          firstAnimal: response.data?.[0],
          totalCount: response.data?.length
        });
        return response.data || [];
      } catch (err) {
        console.error('Error fetching animals:', err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Extract unique shelters and categories from animals
  const shelters = React.useMemo(() => {
    if (!animals) return [];
    const uniqueShelters = new Map<number, { shelterId: number; shelterName: string }>();
    animals.forEach(animal => {
      if (animal.shelterDto) {
        uniqueShelters.set(animal.shelterDto.shelterId, {
          shelterId: animal.shelterDto.shelterId,
          shelterName: animal.shelterDto.shelterName,
        });
      }
    });
    return Array.from(uniqueShelters.values());
  }, [animals]);

  const categories = React.useMemo(() => {
    if (!animals) return [];
    const uniqueCategories = new Map<string, { categoryId: number; categoryName: string }>();
    animals.forEach(animal => {
      if (animal.shelterCategory) {
        // Use category name as key to merge same categories from different shelters
        const categoryName = animal.shelterCategory.categoryName;
        if (!uniqueCategories.has(categoryName)) {
          uniqueCategories.set(categoryName, {
            categoryId: animal.shelterCategory.categoryId,
            categoryName: categoryName,
          });
        }
      }
    });
    return Array.from(uniqueCategories.values());
  }, [animals]);

  // Filter animals based on search and filters
  useEffect(() => {
    if (animals) {
      const filtered = animals.filter(animal => {
        const matchesName = animal.name.toLowerCase().includes(searchName.toLowerCase());
        const matchesShelter = !selectedShelter || animal.shelterDto?.shelterId === selectedShelter;
        const matchesCategory = !selectedCategory || 
          (animal.shelterCategory && 
           categories.find(c => 
             c.categoryId === selectedCategory
           )?.categoryName === animal.shelterCategory.categoryName);
        return matchesName && matchesShelter && matchesCategory;
      });
      setFilteredAnimals(filtered);
    }
  }, [animals, searchName, selectedShelter, selectedCategory, categories]);

  const getAdoptionStatus = (state: AdoptionState): string => {
    console.log('Processing adoption state:', state);
    switch (state) {
      case AdoptionState.Adopted:
        return 'Adopted';
      case AdoptionState.Pending:
        return 'Pending';
      case AdoptionState.Available:
        return 'Available';
      default:
        return 'Unknown';
    }
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Error loading animals: {error instanceof Error ? error.message : 'Unknown error'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            label="Search by Name"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Shelter</InputLabel>
            <Select
              value={selectedShelter}
              label="Filter by Shelter"
              onChange={(e) => setSelectedShelter(e.target.value as number)}
            >
              <MenuItem value="">All Shelters</MenuItem>
              {shelters.map((shelter) => (
                <MenuItem key={shelter.shelterId} value={shelter.shelterId}>
                  {shelter.shelterName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth>
            <InputLabel>Filter by Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Filter by Category"
              onChange={(e) => setSelectedCategory(e.target.value as number)}
            >
              <MenuItem value="">All Categories</MenuItem>
              {categories.map((category) => (
                <MenuItem key={category.categoryId} value={category.categoryId}>
                  {category.categoryName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {filteredAnimals.length === 0 ? (
        <Typography>No animals found</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredAnimals.map((animal) => (
            <Grid item xs={12} sm={6} md={4} key={animal.id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={`https://source.unsplash.com/featured/400x300/?${animal.breed.toLowerCase()},pet`}
                  alt={animal.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {animal.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Breed: {animal.breed}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Age: {animal.age} years
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {animal.adoption_State}
                  </Typography>
                  {animal.shelterCategory && (
                    <Typography variant="body2" color="text.secondary">
                      Category: {animal.shelterCategory.categoryName}
                    </Typography>
                  )}
                  {animal.shelterDto && (
                    <Typography variant="body2" color="text.secondary">
                      Shelter: {animal.shelterDto.shelterName}
                    </Typography>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    color="primary" 
                    onClick={() => navigate(`/animals/${animal.id}`)}
                  >
                    View Details
                  </Button>
                  {isAuthenticated && animal.adoption_State === 'Available' && (
                    <Button 
                      size="small" 
                      color="primary"
                      onClick={() => navigate(`/animals/${animal.id}`)}
                    >
                      Adopt
                    </Button>
                  )}
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default AnimalList; 