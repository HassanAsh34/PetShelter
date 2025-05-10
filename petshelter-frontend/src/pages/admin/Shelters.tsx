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
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShelters = async () => {
      try {
        const data = await adminApi.getShelters();
        setShelters(data);
        setError(null);
      } catch (err) {
        const error = err as ApiError;
        setError(error.response?.data?.message || 'Failed to fetch shelters');
      } finally {
        setLoading(false);
      }
    };

    fetchShelters();
  }, []);

  const handleViewDetails = (shelterId: number) => {
    navigate(`/admin/shelters/${shelterId}`);
  };

  const handleViewCategories = (shelterId: number) => {
    navigate(`/admin/categories?shelterId=${shelterId}`);
  };

  const handleDeleteShelter = async (shelterId: number) => {
    if (window.confirm('Are you sure you want to delete this shelter? This action cannot be undone.')) {
      try {
        await adminApi.deleteShelter(shelterId);
        setShelters(shelters.filter(shelter => shelter.shelterId !== shelterId));
      } catch (err) {
        const error = err as ApiError;
        setError(error.response?.data?.message || 'Failed to delete shelter');
      }
    }
  };

  const handleAddShelter = () => {
    navigate('/admin/shelters/add');
  };

  if (loading) {
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
        <Typography variant="h4" component="h1">
          Shelters
        </Typography>
        {user?.adminType === 0 && (
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddShelter}
            startIcon={<AddIcon />}
          >
            Add Shelter
          </Button>
        )}
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
            {shelters.map((shelter) => (
              <TableRow key={shelter.shelterId}>
                <TableCell>{shelter.shelterName}</TableCell>
                <TableCell>{shelter.shelterLocation}</TableCell>
                <TableCell>{shelter.shelterPhone}</TableCell>
                <TableCell>{shelter.countStaff}</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      onClick={() => handleViewDetails(shelter.shelterId)}
                      color="primary"
                      sx={{ mr: 1 }}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Categories">
                    <IconButton
                      onClick={() => handleViewCategories(shelter.shelterId)}
                      color="secondary"
                      sx={{ mr: 1 }}
                    >
                      <CategoryIcon />
                    </IconButton>
                  </Tooltip>
                  {user?.adminType === 0 && (
                    <Tooltip title="Delete Shelter">
                      <IconButton
                        onClick={() => handleDeleteShelter(shelter.shelterId)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  )}
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