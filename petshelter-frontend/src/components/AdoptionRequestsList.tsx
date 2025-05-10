import React, { useEffect, useState } from 'react';
import { staffApi } from '../services/api';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';

interface AdoptionRequest {
  id: number;
  petName: string;
  adopterName: string;
  adopterEmail: string;
  requestDate: string;
  status: string;
}

const AdoptionRequestsList: React.FC = () => {
  const [requests, setRequests] = useState<AdoptionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<AdoptionRequest | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await staffApi.getAdoptionRequests();
      setRequests(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch adoption requests');
      console.error('Error fetching adoption requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleRequest = async (requestId: number, approved: boolean) => {
    try {
      await staffApi.handleAdoptionRequest(
        requestId,
        approved,
        !approved ? rejectionReason : undefined
      );
      setOpenDialog(false);
      setRejectionReason('');
      fetchRequests(); // Refresh the list
    } catch (err) {
      setError('Failed to handle adoption request');
      console.error('Error handling adoption request:', err);
    }
  };

  const openRejectionDialog = (request: AdoptionRequest) => {
    setSelectedRequest(request);
    setOpenDialog(true);
  };

  if (loading) {
    return <Typography>Loading adoption requests...</Typography>;
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="h5" gutterBottom>
        Adoption Requests
      </Typography>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Pet Name</TableCell>
              <TableCell>Adopter Name</TableCell>
              <TableCell>Adopter Email</TableCell>
              <TableCell>Request Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.petName}</TableCell>
                <TableCell>{request.adopterName}</TableCell>
                <TableCell>{request.adopterEmail}</TableCell>
                <TableCell>{new Date(request.requestDate).toLocaleDateString()}</TableCell>
                <TableCell>{request.status}</TableCell>
                <TableCell>
                  {request.status === 'Pending' && (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={() => handleRequest(request.id, true)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => openRejectionDialog(request)}
                      >
                        Reject
                      </Button>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Reject Adoption Request</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Rejection Reason"
            fullWidth
            multiline
            rows={4}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            onClick={() => selectedRequest && handleRequest(selectedRequest.id, false)}
            color="error"
            disabled={!rejectionReason.trim()}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdoptionRequestsList; 