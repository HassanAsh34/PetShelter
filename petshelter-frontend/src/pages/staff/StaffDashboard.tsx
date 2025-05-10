import React from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Pets,
  People,
  Assessment,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { staffApi } from '../../services/api';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch data based on staff type
  const { data: pets, isLoading: petsLoading, error: petsError } = useQuery({
    queryKey: ['staffPets'],
    queryFn: () => staffApi.getShelterPets(),
    enabled: true,
    retry: false,
  });

  const { data: adoptionRequests, isLoading: requestsLoading, error: requestsError } = useQuery({
    queryKey: ['adoptionRequests'],
    queryFn: () => staffApi.getAdoptionRequests(),
    enabled: true,
    retry: false,
  });

  // Debug logs
  console.log('StaffDashboard - User:', user);
  console.log('StaffDashboard - Pets:', pets);
  console.log('StaffDashboard - Adoption Requests:', adoptionRequests);

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
        // Refresh the pets list
        window.location.reload();
      } catch (error) {
        console.error('Error deleting pet:', error);
      }
    }
  };

  const handleAdoptionRequest = async (requestId: number, approved: boolean) => {
    try {
      await staffApi.handleAdoptionRequest(requestId, approved);
      // Refresh the adoption requests list
      window.location.reload();
    } catch (error) {
      console.error('Error handling adoption request:', error);
    }
  };

  const renderEmptyState = (message: string) => (
    <Box sx={{ p: 2, textAlign: 'center' }}>
      <Typography variant="body1" color="text.secondary">
        {message}
      </Typography>
    </Box>
  );

  // Determine which dashboard to render based on staff type
  const renderDashboard = () => {
    // Staff type can be 0 (Manager), 1 (Interviewer), or 2 (Care Taker)
    switch (user?.staffType) {
      case 0: // Manager
        return renderManagerDashboard();
      case 1: // Interviewer
        return renderInterviewerDashboard();
      case 2: // Care Taker
        return renderCareTakerDashboard();
      default:
        return renderDefaultDashboard();
    }
  };

  const renderManagerDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome, Manager {user?.uname}
          </Typography>
          <Typography variant="body1">
            You have full access to manage shelter operations.
          </Typography>
        </Paper>
      </Grid>

      {/* Pets Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Shelter Pets
            </Typography>
            {petsLoading ? (
              <CircularProgress />
            ) : petsError ? (
              renderEmptyState("Error loading pets. Please try again.")
            ) : !pets || pets.length === 0 ? (
              renderEmptyState("No pets found in your shelter yet.")
            ) : (
              <List>
                {pets.map((pet: any) => (
                  <ListItem key={pet.id}>
                    <ListItemIcon>
                      <Pets />
                    </ListItemIcon>
                    <ListItemText
                      primary={pet.name}
                      secondary={`Status: ${pet.Adoption_State}`}
                    />
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => handleEditPet(pet.id)}
                      sx={{ mr: 1 }}
                    >
                      Edit
                    </Button>
                    <Button
                      startIcon={<DeleteIcon />}
                      color="error"
                      onClick={() => handleDeletePet(pet.id)}
                    >
                      Delete
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddPet}
              sx={{ mt: 2 }}
            >
              Add New Pet
            </Button>
          </CardContent>
        </Card>
      </Grid>

      {/* Adoption Requests Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Adoption Requests
            </Typography>
            {requestsLoading ? (
              <CircularProgress />
            ) : requestsError ? (
              renderEmptyState("Error loading adoption requests. Please try again.")
            ) : !adoptionRequests || adoptionRequests.length === 0 ? (
              renderEmptyState("No adoption requests found.")
            ) : (
              <List>
                {adoptionRequests.map((request: any) => (
                  <ListItem key={request.id}>
                    <ListItemIcon>
                      <People />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Pet: ${request.petName}`}
                      secondary={`Adopter: ${request.adopterName}`}
                    />
                    <Button
                      startIcon={<ApproveIcon />}
                      color="success"
                      onClick={() => handleAdoptionRequest(request.id, true)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      startIcon={<RejectIcon />}
                      color="error"
                      onClick={() => handleAdoptionRequest(request.id, false)}
                    >
                      Reject
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderInterviewerDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome, Interviewer {user?.uname}
          </Typography>
          <Typography variant="body1">
            You can manage adoption requests and conduct interviews.
          </Typography>
        </Paper>
      </Grid>

      {/* Adoption Requests Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Adoption Requests
            </Typography>
            {requestsLoading ? (
              <CircularProgress />
            ) : requestsError ? (
              renderEmptyState("Error loading adoption requests. Please try again.")
            ) : !adoptionRequests || adoptionRequests.length === 0 ? (
              renderEmptyState("No adoption requests found.")
            ) : (
              <List>
                {adoptionRequests.map((request: any) => (
                  <ListItem key={request.id}>
                    <ListItemIcon>
                      <People />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Pet: ${request.petName}`}
                      secondary={`Adopter: ${request.adopterName}`}
                    />
                    <Button
                      startIcon={<ApproveIcon />}
                      color="success"
                      onClick={() => handleAdoptionRequest(request.id, true)}
                      sx={{ mr: 1 }}
                    >
                      Approve
                    </Button>
                    <Button
                      startIcon={<RejectIcon />}
                      color="error"
                      onClick={() => handleAdoptionRequest(request.id, false)}
                    >
                      Reject
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderCareTakerDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome, Care Taker {user?.uname}
          </Typography>
          <Typography variant="body1">
            You can manage the pets in your care.
          </Typography>
        </Paper>
      </Grid>

      {/* Pets Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Pets Under Care
            </Typography>
            {petsLoading ? (
              <CircularProgress />
            ) : petsError ? (
              renderEmptyState("Error loading pets. Please try again.")
            ) : !pets || pets.length === 0 ? (
              renderEmptyState("No pets found under your care.")
            ) : (
              <List>
                {pets.map((pet: any) => (
                  <ListItem key={pet.id}>
                    <ListItemIcon>
                      <Pets />
                    </ListItemIcon>
                    <ListItemText
                      primary={pet.name}
                      secondary={`Status: ${pet.Adoption_State}`}
                    />
                    <Button
                      startIcon={<EditIcon />}
                      onClick={() => handleEditPet(pet.id)}
                    >
                      Update Status
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const renderDefaultDashboard = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome, {user?.uname}
          </Typography>
          <Typography variant="body1">
            Please contact your administrator if you don't see your dashboard.
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Staff Dashboard
      </Typography>
      {renderDashboard()}
    </Container>
  );
};

export default StaffDashboard; 