import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Button,
  Chip
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Pets as PetsIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Category {
  categoryId: number;
  categoryName: string;
  shelter_FK: number;
  shelterName?: string;
  animalCount?: number;
  animals?: any[];
  shelter?: {
    ShelterName: string;
  };
}

const Categories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Get shelterId from query params if it exists
  const queryParams = new URLSearchParams(location.search);
  const shelterId = queryParams.get('shelterId');

  // Fetch categories using React Query
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['categories', shelterId],
    queryFn: () => adminApi.getCategories(shelterId ? parseInt(shelterId) : undefined),
    staleTime: 30000, // Data will be considered fresh for 30 seconds
    cacheTime: 5 * 60 * 1000, // Cache will be kept for 5 minutes
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (category: Category) => adminApi.deleteCategory({
      CategoryId: category.categoryId,
      CategoryName: category.categoryName,
      CategoryDescription: '',
      Shelter_FK: category.shelter_FK
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories', shelterId] });
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to delete category');
    }
  });

  const handleAddCategory = () => {
    navigate(`/admin/categories/add${shelterId ? `?shelterId=${shelterId}` : ''}`);
  };

  const handleEditCategory = (category: Category) => {
    navigate(`/admin/categories/edit/${category.categoryId}`, {
      state: {
        category: {
          CategoryId: category.categoryId,
          CategoryName: category.categoryName,
          Shelter_FK: category.shelter_FK
        },
        shelterId: shelterId // Pass the current shelterId to the edit page
      }
    });
  };

  const handleDeleteCategory = async (category: Category) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      deleteCategoryMutation.mutate(category);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1">
            Categories
          </Typography>
          {shelterId && categories[0]?.shelter?.ShelterName && (
            <Typography variant="subtitle1" color="text.secondary">
              for {categories[0].shelter.ShelterName}
            </Typography>
          )}
        </Box>
        {user?.adminType === 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddCategory}
            startIcon={<AddIcon />}
          >
            Add Category
          </Button>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Shelter</TableCell>
              <TableCell>Animals</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((category: Category) => (
              <TableRow key={category.categoryId}>
                <TableCell>{category.categoryName}</TableCell>
                <TableCell>{category.shelter?.ShelterName}</TableCell>
                <TableCell>
                  <Chip
                    icon={<PetsIcon />}
                    label={category.animalCount || 0}
                    color="primary"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Edit Category">
                    <IconButton
                      onClick={() => handleEditCategory(category)}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Category">
                    <IconButton
                      onClick={() => handleDeleteCategory(category)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default Categories; 