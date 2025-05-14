import React, { useState } from 'react';
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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { staffApi } from '../../services/api';

interface AdoptionRequest {
  id: number;
  petName: string;
  adopterName: string;
  adopterEmail: string;
  adopterPhone: string;
  requestDate: string;
  status: string;
  notes?: string;
}

const AdoptionRequests = () => {
  const queryClient = useQueryClient();
  const [selectedRequest, setSelectedRequest] = useState<AdoptionRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['adoptionRequests'],
    queryFn: () => staffApi.getAdoptionRequests(),
  });

  const handleRequestMutation = useMutation({
    mutationFn: ( requestId : number) => {
      console.log('Approving request with ID:', requestId); // Log the ID
      return staffApi.approveAdoptionRequest(requestId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adoptionRequests'] });
      setSelectedRequest(null);
      setRejectionReason('');
    },
    onError: (error: any) => {
      setError(error.response?.data?.message || 'Failed to process request');
    },
  });

  const handleApprove = (request: AdoptionRequest) => {
    handleRequestMutation.mutate(request.id);
  };

  const handleReject = (request: AdoptionRequest) => {
    if (!rejectionReason) {
      setError('Please provide a reason for rejection');
      return;
    }
    handleRequestMutation.mutate({
      requestId: request.id,
      approved: false,
      reason: rejectionReason,
    });
  };

  const getStatusChip = (status: string) => {
    const statusConfig = {
      pending: { color: 'warning', label: 'Pending' },
      approved: { color: 'success', label: 'Approved' },
      rejected: { color: 'error', label: 'Rejected' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <Chip
        label={config.label}
        color={config.color as any}
        size="small"
      />
    );
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Adoption Requests
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pet Name</TableCell>
              <TableCell>Adopter</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Request Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests?.map((request: AdoptionRequest) => (
              <TableRow key={request.id}>
                <TableCell>{request.petName}</TableCell>
                <TableCell>{request.adopterName}</TableCell>
                <TableCell>
                  {request.adopterEmail}
                  <br />
                  {request.adopterPhone}
                </TableCell>
                <TableCell>
                  {new Date(request.requestDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{getStatusChip(request.status)}</TableCell>
                <TableCell>
                  <Button
                    startIcon={<ViewIcon />}
                    onClick={() => setSelectedRequest(request)}
                    sx={{ mr: 1 }}
                  >
                    View
                  </Button>
                  {request.status === 'pending' && (
                    <>
                      <Button
                        startIcon={<ApproveIcon />}
                        color="success"
                        onClick={() => handleApprove(request)}
                        sx={{ mr: 1 }}
                      >
                        Approve
                      </Button>
                      <Button
                        startIcon={<RejectIcon />}
                        color="error"
                        onClick={() => setSelectedRequest(request)}
                      >
                        Reject
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* View/Reject Dialog */}
      <Dialog
        open={Boolean(selectedRequest)}
        onClose={() => {
          setSelectedRequest(null);
          setRejectionReason('');
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {selectedRequest?.status === 'pending' ? 'Reject Adoption Request' : 'Request Details'}
        </DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Pet: {selectedRequest.petName}
              </Typography>
              <Typography variant="subtitle1" gutterBottom>
                Adopter: {selectedRequest.adopterName}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Email: {selectedRequest.adopterEmail}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Phone: {selectedRequest.adopterPhone}
              </Typography>
              <Typography variant="body2" gutterBottom>
                Request Date: {new Date(selectedRequest.requestDate).toLocaleDateString()}
              </Typography>
              {selectedRequest.notes && (
                <Typography variant="body2" gutterBottom>
                  Notes: {selectedRequest.notes}
                </Typography>
              )}
              {selectedRequest.status === 'pending' && (
                <TextField
                  fullWidth
                  label="Reason for Rejection"
                  multiline
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setSelectedRequest(null);
              setRejectionReason('');
            }}
          >
            Cancel
          </Button>
          {selectedRequest?.status === 'pending' && (
            <Button
              color="error"
              onClick={() => handleReject(selectedRequest)}
              disabled={!rejectionReason}
            >
              Reject Request
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdoptionRequests; 