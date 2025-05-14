import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animalsApi } from '../../services/api';

interface AdoptionRequest {
  requestId: number;
  animal: {
    id: number;
    name: string;
  };
  status: string;
  requestDate: string;
  approved_At?: string;
  shelter?: {
    shelterName: string;
  };
  interviewDto?: {
    interviewDate: string;
  };
}

const AdoptionHistory = () => {
  const queryClient = useQueryClient();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AdoptionRequest | null>(null);

  const { data: adoptionHistory, isLoading, error } = useQuery({
    queryKey: ['adoptionHistory'],
    queryFn: async () => {
      try {
        const response = await animalsApi.getAdoptionHistory();
        console.log('Raw Adoption History Response:', JSON.stringify(response, null, 2));
        console.log('Response Type:', typeof response);
        console.log('Is Array:', Array.isArray(response));
        console.log('Response Length:', Array.isArray(response) ? response.length : 'Not an array');
        
        if (Array.isArray(response)) {
          console.log('First Request:', JSON.stringify(response[0], null, 2));
          console.log('Request Status:', response[0]?.status);
          console.log('Request Animal:', JSON.stringify(response[0]?.animal, null, 2));
          console.log('Request Shelter:', JSON.stringify(response[0]?.shelter, null, 2));
        }
        return response;
      } catch (error) {
        console.error('Error fetching adoption history:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const cancelAdoptionMutation = useMutation({
    mutationFn: (requestId: number) => animalsApi.cancelAdoption(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoptionHistory'] });
      setCancelDialogOpen(false);
      setSelectedRequest(null);
    },
  });

  const handleCancelClick = (adoption: AdoptionRequest) => {
    setSelectedRequest(adoption);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = () => {
    if (selectedRequest) {
      cancelAdoptionMutation.mutate(selectedRequest.requestId);
    }
  };

  const getStatusChip = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <Chip label="Approved" color="success" />;
      case 'pending':
        return <Chip label="Pending" color="warning" />;
      case 'rejected':
        return <Chip label="Rejected" color="error" />;
      default:
        return <Chip label={status} />;
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
        <Alert severity="error">Error loading adoption history</Alert>
      </Container>
    );
  }

  // Ensure adoptionHistory is an array and has data
  const history = Array.isArray(adoptionHistory) ? adoptionHistory : [];
  console.log('Final History Array:', JSON.stringify(history, null, 2));
  console.log('History Length:', history.length);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        My Adoption History
      </Typography>
      
      {!history || history.length === 0 ? (
        <Alert severity="info" sx={{ mt: 2 }}>
          You haven't made any adoption requests yet.
        </Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pet Name</TableCell>
                <TableCell>Shelter</TableCell>
                <TableCell>Request Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Interview Date</TableCell>
                <TableCell>Approved At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((request) => (
                <TableRow key={request.requestId}>
                  <TableCell>{request.animal.name}</TableCell>
                  <TableCell>{request.shelter?.shelterName || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(request.requestDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={
                        request.status === 'Approved'
                          ? 'success'
                          : request.status === 'Rejected'
                          ? 'error'
                          : 'warning'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {request.status.toLowerCase() === 'pending' ? (
                      <Chip label="Not Scheduled" color="default" />
                    ) : request.status.toLowerCase() === 'rejected' ? (
                      '-'
                    ) : request.interviewDto ? (
                      new Date(request.interviewDto.interviewDate).toLocaleDateString()
                    ) : (
                      '-'
                    )}
                  </TableCell>
                  <TableCell>
                    {request.approved_At
                      ? new Date(request.approved_At).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {request.status.toLowerCase() === 'pending' && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleCancelClick(request)}
                      >
                        Cancel
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
      >
        <DialogTitle>Cancel Adoption Request</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel your adoption request for {selectedRequest?.animal.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Keep Request</Button>
          <Button 
            onClick={handleCancelConfirm} 
            color="error" 
            variant="contained"
            disabled={cancelAdoptionMutation.isPending}
          >
            {cancelAdoptionMutation.isPending ? 'Canceling...' : 'Yes, Cancel Request'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdoptionHistory; 