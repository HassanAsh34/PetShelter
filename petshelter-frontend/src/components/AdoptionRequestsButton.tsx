import React from 'react';
import { Button, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PetsIcon from '@mui/icons-material/Pets';

const AdoptionRequestsButton: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/staff/adoption-requests');
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
      <Button
        variant="contained"
        color="primary"
        size="large"
        startIcon={<PetsIcon />}
        onClick={handleClick}
        sx={{
          minWidth: '200px',
          py: 1.5,
          px: 3,
          borderRadius: 2,
          boxShadow: 2,
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 4,
          },
          transition: 'all 0.2s ease-in-out',
        }}
      >
        View Adoption Requests
      </Button>
    </Box>
  );
};

export default AdoptionRequestsButton; 