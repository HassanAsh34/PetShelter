import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import { Visibility as VisibilityIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../services/api';

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

const Shelters: React.FC = () => {
  const navigate = useNavigate();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShelters = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getShelters();
      setShelters(response);
      setError(null);
    } catch (err) {
      setError('Failed to fetch shelters');
      console.error('Error fetching shelters:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShelters();
  }, []);

  const handleViewDetails = (shelterId: number) => {
    navigate(`/admin/shelters/${shelterId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" component="h1" gutterBottom>
        Shelters
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shelters.map((shelter) => (
              <TableRow key={shelter.shelterId}>
                <TableCell>{shelter.shelterName}</TableCell>
                <TableCell>{shelter.shelterLocation}</TableCell>
                <TableCell>{shelter.shelterPhone}</TableCell>
                <TableCell>{shelter.description}</TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewDetails(shelter.shelterId)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default Shelters; 