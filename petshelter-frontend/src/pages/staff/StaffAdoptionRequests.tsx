import React from 'react';
import {
  Box,
  Typography,
  List,
  Button,
  CircularProgress,
  Alert,
  Stack,
  Paper,
} from '@mui/material';
import {
  People,
  Check as ApproveIcon,
  Close as RejectIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../../services/api';

interface Animal {
  id: number;
  name: string;
  age: number;
  breed: string | null;
  adoption_State: string | null;
  shelterCategory: any | null;
  shelterDto: any | null;
}

interface Adopter {
  id: number;
  uname: string;
  email: string | null;
  address: string | null;
  phone: string | null;
  role: number;
  banned: boolean;
  activated: number;
  createdAt: string;
}

interface AdoptionRequest {
  requestId: number;
  shelter: any | null;
  animal: Animal;
  adopter: Adopter;
  status: string;
  requestDate: string;
  approved_At: string | null;
}

const StaffAdoptionRequests = () => {
  const queryClient = useQueryClient();
  const { data: adoptionRequests, isLoading, error } = useQuery<AdoptionRequest[]>({
    queryKey: ['adoptionRequests'],
    queryFn: async () => {
      const response = await staffApi.getAdoptionRequests();
      console.log('Raw Adoption Requests Response:', response);
      return response;
    },
  });

  React.useEffect(() => {
    if (adoptionRequests) {
      console.log('Processed Adoption Requests:', adoptionRequests);
      console.log('First Request:', adoptionRequests[0]);
    }
    if (error) {
      console.error('Error fetching adoption requests:', error);
    }
  }, [adoptionRequests, error]);

  const handleApproveAdoptionRequest = async (requestId: number) => {
    try {
      console.log(`Approving adoption request ${requestId}`);
      const response = await staffApi.approveAdoptionRequest(requestId);
      console.log('Approve request response:', response);
      alert('Adoption request approved successfully');
      queryClient.invalidateQueries({ queryKey: ['adoptionRequests'] });
    } catch (error: any) {
      console.error('Error approving adoption request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to process adoption request. Please try again.';
      alert(errorMessage);
    }
  };

  const handleRejectAdoptionRequest = async (requestId: number) => {
    try {
      // Implement your reject logic here
      console.log(`Rejecting adoption request ${requestId}`);
      const response = await staffApi.rejectAdoptionRequest(requestId);
      console.log('Reject request response:', response);
      alert('Adoption request rejected successfully');
      queryClient.invalidateQueries({ queryKey: ['adoptionRequests'] });
    } catch (error: any) {
      console.error('Error rejecting adoption request:', error);
      const errorMessage = error.response?.data?.message || 'Failed to process adoption request. Please try again.';
      alert(errorMessage);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Adoption Requests
      </Typography>

      {isLoading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">Error loading requests</Alert>
      ) : !adoptionRequests || adoptionRequests.length === 0 ? (
        <Typography variant="body1" color="text.secondary" align="center">
          No adoption requests found
        </Typography>
      ) : (
        <List>
          {adoptionRequests.map((request) => (
            <Paper
              key={request.requestId}
              sx={{
                mb: 2,
                p: 2,
                '&:hover': {
                  backgroundColor: 'action.hover',
                },
              }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <People />
                <Box flex={1}>
                  <Typography variant="h6">{request.animal.name}</Typography>
                  <Typography variant="body2" color="text.primary">
                    Adopter: {request.adopter.uname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Email: {request.adopter.email || 'Not provided'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Request Date: {new Date(request.requestDate).toLocaleDateString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Status: {request.status}
                  </Typography>
                </Box>
                {request.status === 'Pending' && (
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<ApproveIcon />}
                      onClick={() => handleApproveAdoptionRequest(request.requestId)}
                      size="small"
                    >
                      Approve
                    </Button>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<RejectIcon />}
                      onClick={() => handleRejectAdoptionRequest(request.requestId)}
                      size="small"
                    >
                      Reject
                    </Button>
                  </Stack>
                )}
              </Stack>
            </Paper>
          ))}
        </List>
      )}
    </Box>
  );
};

export default StaffAdoptionRequests; 