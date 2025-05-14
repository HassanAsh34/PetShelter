import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '80vh',
        textAlign: 'center',
        p: 3,
      }}
    >
      <Typography variant="h1" component="h1" gutterBottom sx={{ fontSize: '6rem', fontWeight: 'bold' }}>
        404
      </Typography>
      <Typography variant="h4" component="h2" gutterBottom sx={{ mb: 4 }}>
        PAGE NOT FOUND!!
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        The page you are looking for might have been removed, had its name changed,
        or is temporarily unavailable.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        size="large"
        onClick={() => navigate('/')}
      >
        Go to Home Page
      </Button>
    </Box>
  );
};

export default NotFound; 