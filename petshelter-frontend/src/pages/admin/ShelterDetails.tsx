import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../services/api';

interface Shelter {
  shelterId: number;
  shelterName: string;
  shelterLocation: string;
  shelterPhone: string;
  description: string;
  countStaff: number;
  categories: Array<{
    categoryId: number;
    categoryName: string;
  }>;
  staff: Array<{
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

const ShelterDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const { data: shelter, isLoading, error: queryError } = useQuery<Shelter>({
    queryKey: ['shelter', id],
    queryFn: () => adminApi.getShelterDetails(Number(id)),
    enabled: !!id,
  });

  const deleteShelterMutation = useMutation({
    mutationFn: (shelter: Shelter) => {
      return adminApi.deleteShelter(shelter);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shelters'] });
      navigate('/admin/shelters');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to delete shelter');
    }
  });

  const handleDelete = () => {
    if (shelter) {
      deleteShelterMutation.mutate(shelter);
      setDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (queryError) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Error loading shelter details. Please try again.</Alert>
      </Container>
    );
  }

  if (!shelter) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="warning">No shelter found.</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/admin/shelters')}
            sx={{ mb: 2 }}
          >
            Back to Shelters
          </Button>
          <Typography variant="h4" gutterBottom>
            {shelter.shelterName}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/admin/shelters/${id}/edit`)}
          >
            Edit Shelter
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Delete Shelter
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
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
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Phone"
                    secondary={shelter.shelterPhone}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Description"
                    secondary={shelter.description}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Staff Count"
                    secondary={shelter.countStaff}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Categories */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              {shelter.categories?.length > 0 ? (
                <List>
                  {shelter.categories.map((category) => (
                    <ListItem key={category.categoryId}>
                      <ListItemText primary={category.categoryName} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No categories found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Staff Members */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Staff Members
              </Typography>
              {shelter.staff?.length > 0 ? (
                <List>
                  {shelter.staff.map((member) => (
                    <ListItem key={member.id}>
                      <ListItemText
                        primary={`${member.firstName} ${member.lastName}`}
                        secondary={member.email}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary">
                  No staff members found
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Shelter</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {shelter.shelterName}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ShelterDetails; 