import React, { useState, useEffect } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import ChatWindow from '../../components/Chat/ChatWindow';
import { useAuth } from '../../contexts/AuthContext';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';

const TalkToAdmin: React.FC = () => {
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const { user } = useAuth();
  const ADMIN_EMAIL = "Admin@shelter.com";

  // Initialize SignalR connection
  useEffect(() => {
    const initializeConnection = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }

      try {
        const newConnection = new HubConnectionBuilder()
          .withUrl('http://localhost:5291/chatHub', {
            skipNegotiation: true,
            transport: 1,
            accessTokenFactory: () => token
          })
          .withAutomaticReconnect()
          .build();

        await newConnection.start();
        console.log('Chat Connected!');
        setConnection(newConnection);
        
        // Get initial messages
        if (user?.email) {
          await newConnection.invoke('GetMessages', user.email);
        }
      } catch (err) {
        console.error('Chat Connection Error:', err);
      }
    };

    initializeConnection();

    return () => {
      if (connection) {
        connection.stop();
      }
    };
  }, [user?.email]);

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', p: 2 }}>
      <Paper sx={{ height: '100%' }}>
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h5">Talk to Admin</Typography>
          <Typography variant="body2" color="textSecondary">
            Have questions? Our admin team is here to help!
          </Typography>
        </Box>
        <Box sx={{ height: 'calc(100% - 80px)' }}>
          {user?.email ? (
            <ChatWindow
              receiverEmail={ADMIN_EMAIL}
              currentUserEmail={user.email}
              connection={connection}
            />
          ) : (
            <Box sx={{ 
              height: '100%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center' 
            }}>
              <Typography variant="h6" color="textSecondary">
                Please log in to chat with admin
              </Typography>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default TalkToAdmin; 