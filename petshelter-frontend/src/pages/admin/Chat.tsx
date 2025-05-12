import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Paper,
  Divider,
  Badge,
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';
import ChatWindow from '../../components/Chat/ChatWindow';
import { useAuth } from '../../contexts/AuthContext';
import { MessageModel } from '../../types';
import { chatApi } from '../../services/api';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';

interface ChatMessage {
  content: string;
  timestamp: string;
  senderEmail?: string;
}

interface MessageDTO {
  senderEmail: string;
  receiverEmail: string;
  messages: ChatMessage[];
}

interface ChatUser {
  email: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

const AdminChat: React.FC = () => {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [allMessages, setAllMessages] = useState<MessageDTO[]>([]);
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const { user } = useAuth();

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

        // Set up message handlers
        newConnection.on('UpdateMessages', (messageGroups: MessageDTO[]) => {
          setAllMessages(messageGroups);
          updateUserList(messageGroups);
        });

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
        connection.off('UpdateMessages');
        connection.stop();
      }
    };
  }, [user?.email]);

  const updateUserList = (messageGroups: MessageDTO[]) => {
    const userMap = new Map<string, ChatUser>();
    
    messageGroups.forEach((messagePair: MessageDTO) => {
      // Skip if both sender and receiver are admin
      if (messagePair.senderEmail.toLowerCase() === 'admin@shelter.com' && 
          messagePair.receiverEmail.toLowerCase() === 'admin@shelter.com') {
        return;
      }

      // Get the non-admin user's email
      const userEmail = messagePair.senderEmail.toLowerCase() === 'admin@shelter.com' 
        ? messagePair.receiverEmail 
        : messagePair.senderEmail;

      if (!userMap.has(userEmail)) {
        userMap.set(userEmail, {
          email: userEmail,
          unreadCount: 0,
        });
      }

      const userData = userMap.get(userEmail)!;
      
      // Get the last message from the messages array
      const lastMessage = messagePair.messages[messagePair.messages.length - 1];
      if (lastMessage) {
        // Update last message if this is more recent
        if (!userData.lastMessageTime || 
            new Date(lastMessage.timestamp) > new Date(userData.lastMessageTime)) {
          userData.lastMessage = lastMessage.content;
          userData.lastMessageTime = lastMessage.timestamp;
        }

        // Count unread messages (messages from non-admin users)
        if (messagePair.senderEmail.toLowerCase() !== 'admin@shelter.com') {
          userData.unreadCount += messagePair.messages.length;
        }
      }
    });

    // Convert map to array and sort by last message time
    const sortedUsers = Array.from(userMap.values())
      .sort((a, b) => {
        if (!a.lastMessageTime) return 1;
        if (!b.lastMessageTime) return -1;
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });

    setUsers(sortedUsers);
  };

  const handleUserSelect = (userEmail: string) => {
    setSelectedUser(userEmail);
    // Mark messages as read when selecting a user
    setUsers(prevUsers => 
      prevUsers.map(u => 
        u.email === userEmail ? { ...u, unreadCount: 0 } : u
      )
    );
  };

  return (
    <Box sx={{ height: 'calc(100vh - 64px)', p: 2 }}>
      <Grid container spacing={2} sx={{ height: '100%' }}>
        {/* Users List */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ height: '100%', overflow: 'auto' }}>
            <List>
              {users.map((userData) => (
                <React.Fragment key={userData.email}>
                  <ListItem
                    button
                    selected={selectedUser === userData.email}
                    onClick={() => handleUserSelect(userData.email)}
                  >
                    <ListItemAvatar>
                      <Badge badgeContent={userData.unreadCount} color="error">
                        <Avatar>
                          <PersonIcon />
                        </Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={userData.email}
                      secondary={
                        <React.Fragment>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                            sx={{ display: 'block' }}
                          >
                            {userData.lastMessage || 'No messages yet'}
                          </Typography>
                          {userData.lastMessageTime && (
                            <Typography
                              component="span"
                              variant="caption"
                              color="text.secondary"
                            >
                              {new Date(userData.lastMessageTime).toLocaleString()}
                            </Typography>
                          )}
                        </React.Fragment>
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Chat Window */}
        <Grid item xs={12} md={9}>
          {selectedUser ? (
            <ChatWindow
              receiverEmail={selectedUser}
              currentUserEmail={user?.email || ''}
              isAdmin={true}
              connection={connection}
            />
          ) : (
            <Paper
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="h6" color="textSecondary">
                Select a user to start chatting
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminChat; 