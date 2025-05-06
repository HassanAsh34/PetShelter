import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
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

const ShelterDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [shelter, setShelter] = useState<Shelter | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShelterDetails = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getShelters();
        const foundShelter = response.find(s => s.shelterId === Number(id));
        if (foundShelter) {
          setShelter(foundShelter);
        } else {
          setError('Shelter not found');
        }
      } catch (err) {
        setError('Failed to fetch shelter details');
        console.error('Error fetching shelter details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchShelterDetails();
    }
  }, [id]);

  const handleBack = () => {
    navigate('/admin/shelters');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !shelter) {
    return (
      <Box p={3}>
        <Alert severity="error">{error || 'Shelter not found'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ mt: 2 }}
        >
          Back to Shelters
        </Button>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 3 }}
      >
        Back to Shelters
      </Button>

      <Typography variant="h4" component="h1" gutterBottom>
        {shelter.shelterName}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Location"
                  secondary={shelter.shelterLocation}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Phone"
                  secondary={shelter.shelterPhone}
                />
              </ListItem>
              <ListItem>
                <ListItemText
                  primary="Description"
                  secondary={shelter.description || 'No description available'}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Staff Information
            </Typography>
            <Typography variant="body1" gutterBottom>
              Total Staff: {shelter.countStaff}
            </Typography>
            {shelter.staff && shelter.staff.length > 0 ? (
              <List>
                {shelter.staff.map((staffMember: any) => (
                  <ListItem key={staffMember.staffId}>
                    <ListItemText
                      primary={staffMember.staffName}
                      secondary={staffMember.role}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                No staff members assigned
              </Typography>
            )}
          </Paper>
        </Grid>

        {shelter.categories && shelter.categories.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              <Grid container spacing={2}>
                {shelter.categories.map((category: any) => (
                  <Grid item xs={12} sm={6} md={4} key={category.categoryId}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">
                          {category.categoryName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {category.description || 'No description available'}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default ShelterDetails; 