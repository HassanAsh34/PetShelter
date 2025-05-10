import React from 'react';
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
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
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
}

const AdoptionHistory = () => {
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

  // Add debug logging
  console.log('Processed Adoption History Data:', JSON.stringify(adoptionHistory, null, 2));
  console.log('Adoption History Loading:', isLoading);
  console.log('Adoption History Error:', error);

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
                <TableCell>Status</TableCell>
                <TableCell>Request Date</TableCell>
                <TableCell>Approved Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.map((adoption: AdoptionRequest) => (
                <TableRow key={adoption.requestId}>
                  <TableCell>{adoption.animal?.name || 'N/A'}</TableCell>
                  <TableCell>{adoption.shelter?.shelterName || 'N/A'}</TableCell>
                  <TableCell>{getStatusChip(adoption.status)}</TableCell>
                  <TableCell>{new Date(adoption.requestDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {adoption.approved_At 
                      ? new Date(adoption.approved_At).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
};

export default AdoptionHistory; 