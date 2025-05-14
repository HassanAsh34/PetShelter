import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
  IconButton,
  Paper,
  CircularProgress,
  Alert,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Visibility as ViewIcon, Category as CategoryIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface Shelter {
  shelterId: number;
  shelterName: string;
  shelterLocation: string;
  shelterPhone: string;
  description: string | null;
  countStaff: number;
  categories: any[] | null;
  staff: any[] | null;
}

interface AddShelterData {
  ShelterName: string;
  Location: string;
  Phone: string;
  Description: string;
}

interface ApiError extends Error {
  response?: {
    status: number;
    data?: {
      message?: string;
    };
  };
}

interface StaffMember {
  StaffId: number;
  Uname: string;
  Email: string;
  Phone: string;
}

interface Category {
  CategoryId: number;
  CategoryName: string;
}

interface ShelterDetails {
  ShelterId: number;
  ShelterName: string;
  ShelterLocation: string;
  ShelterPhone: string;
  Description: string;
  CountStaff: number;
  staff?: StaffMember[];
  Categories?: Category[];
}

const Shelters = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const { data: shelters = [], isLoading } = useQuery<Shelter[]>({
    queryKey: ['shelters'],
    queryFn: adminApi.getShelters,
    staleTime: 30000, // 30 seconds
    gcTime: 300000, // 5 minutes
  });

  const deleteShelterMutation = useMutation({
    mutationFn: (shelter: Shelter) => {
      // const dto = {
      //   shelterId: shelter.shelterId,
      //   shelterName: shelter.shelterName
      // };
      return adminApi.deleteShelter(shelter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelters'] });
    }
  });

  const handleViewDetails = (shelter: Shelter) => {
    navigate(`/admin/shelters/${shelter.shelterId}`);
  };

  const handleViewCategories = (shelter: Shelter) => {
    navigate(`/admin/categories?shelterId=${shelter.shelterId}`);
  };

  const handleDeleteShelter = async (shelter: Shelter) => {
    if (window.confirm('Are you sure you want to delete this shelter? This action cannot be undone.')) {
      deleteShelterMutation.mutate(shelter);
    }
  };

  const handleAddShelter = () => {
    navigate('/admin/shelters/add');
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Shelters
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddShelter}
        >
          Add Shelter
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Staff Count</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shelters?.map((shelter: Shelter) => (
              <TableRow key={shelter.shelterId}>
                <TableCell>{shelter.shelterName}</TableCell>
                <TableCell>{shelter.shelterLocation}</TableCell>
                <TableCell>{shelter.shelterPhone}</TableCell>
                <TableCell>{shelter.countStaff}</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton onClick={() => handleViewDetails(shelter)} color="primary">
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Categories">
                    <IconButton onClick={() => handleViewCategories(shelter)} color="secondary">
                      <CategoryIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Shelter">
                    <IconButton onClick={() => handleDeleteShelter(shelter)} color="error">
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

export default Shelters; 