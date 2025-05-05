import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Box,
  Chip,
  CircularProgress,
  Button,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { adminApi } from '../../services/api';

interface ShelterDetails {
  shelterId: number;
  shelterName: string;
  shelterLocation: string;
  shelterPhone: string;
  description: string | null;
  countStaff: number;
  categories: Array<{
    categoryId: number;
    categoryName: string;
  }> | null;
  staff: Array<{
    staffId: number;
    uname: string;
    email: string;
    phone: string;
  }> | null;
}

const ShelterDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const shelterId = parseInt(id || '0', 10);

  const { data: shelter, isLoading, error } = useQuery<ShelterDetails>({
    queryKey: ['shelterDetails', shelterId],
    queryFn: async () => {
      console.log('Fetching shelter details for ID:', shelterId);
      try {
        const response = await adminApi.getShelterDetails(shelterId);
        console.log('Shelter details response:', {
          data: response,
          type: typeof response,
          isArray: Array.isArray(response),
          length: Array.isArray(response) ? response.length : 'not an array'
        });
        return response;
      } catch (error) {
        console.error('Error fetching shelter details:', error);
        throw error;
      }
    },
    enabled: shelterId > 0
  });

  // Add debug logging for shelter data
  React.useEffect(() => {
    if (shelter) {
      console.log('Shelter data in component:', {
        shelter,
        type: typeof shelter,
        isArray: Array.isArray(shelter),
        length: Array.isArray(shelter) ? shelter.length : 'not an array',
        properties: Object.keys(shelter)
      });
    }
  }, [shelter]);

  if (!shelterId) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Invalid shelter ID</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/shelters')}
          sx={{ mt: 2 }}
        >
          Back to Shelters
        </Button>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">
          Error loading shelter details: {error instanceof Error ? error.message : 'Unknown error'}
        </Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/shelters')}
          sx={{ mt: 2 }}
        >
          Back to Shelters
        </Button>
      </Container>
    );
  }

  if (!shelter) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">Shelter not found</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/admin/shelters')}
          sx={{ mt: 2 }}
        >
          Back to Shelters
        </Button>
      </Container>
    );
  }

  const getStaffCountColor = (count: number) => {
    if (count >= 10) return 'success.main';
    if (count >= 5) return 'warning.main';
    return 'error.main';
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/admin/shelters')}
        sx={{ mb: 3 }}
      >
        Back to Shelters
      </Button>

      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h4" gutterBottom>
              {shelter.shelterName}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Typography variant="body1" color="text.secondary">
                ID: {shelter.shelterId}
              </Typography>
              <Chip
                label={`${shelter.countStaff} Staff Members`}
                sx={{
                  bgcolor: getStaffCountColor(shelter.countStaff),
                  color: 'white'
                }}
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Basic Information
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Location:</strong> {shelter.shelterLocation}
            </Typography>
            <Typography variant="body1" paragraph>
              <strong>Phone:</strong> {shelter.shelterPhone}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {shelter.description || 'No description available'}
            </Typography>
          </Grid>

          {shelter.staff && shelter.staff.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Staff Members
              </Typography>
              <Grid container spacing={2}>
                {shelter.staff.map((member) => (
                  <Grid item xs={12} sm={6} md={4} key={member.staffId}>
                    <Paper elevation={1} sx={{ p: 2 }}>
                      <Typography variant="subtitle1">{member.uname}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.email}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {member.phone}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          )}

          {shelter.categories && shelter.categories.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {shelter.categories.map((category) => (
                  <Chip
                    key={category.categoryId}
                    label={category.categoryName}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
};

export default ShelterDetails; 