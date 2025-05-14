import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  TextField,
  IconButton,
  Typography,
  List,
  ListItem,
} from '@mui/material';
import { Send as SendIcon } from '@mui/icons-material';
import { HubConnection } from '@microsoft/signalr';
import { chatApi } from '../../services/api';
import { MessageModel } from '../../types';

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

interface ChatWindowProps {
  receiverEmail: string;
  currentUserEmail: string;
  isAdmin?: boolean;
  connection?: HubConnection | null;
  onMessageSent?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  receiverEmail, 
  currentUserEmail, 
  isAdmin,
  connection,
  onMessageSent 
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const processMessages = (messageGroups: MessageDTO[]) => {
    const allMessages: ChatMessage[] = [];
    
    // Find messages where current user is either sender or receiver
    const relevantGroups = messageGroups.filter(group => 
      (group.senderEmail.toLowerCase() === currentUserEmail.toLowerCase() && 
       group.receiverEmail.toLowerCase() === receiverEmail.toLowerCase()) ||
      (group.senderEmail.toLowerCase() === receiverEmail.toLowerCase() && 
       group.receiverEmail.toLowerCase() === currentUserEmail.toLowerCase())
    );

    // Combine all messages from relevant groups
    relevantGroups.forEach(group => {
      const messagesWithSender = group.messages.map(msg => ({
        ...msg,
        senderEmail: group.senderEmail
      }));
      allMessages.push(...messagesWithSender);
    });

    // Sort messages by timestamp
    return allMessages.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
  };

  const fetchMessages = async () => {
    try {
      if (!connection) return;
      await connection.invoke('GetMessages', currentUserEmail);
      console.log(currentUserEmail);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // Initial message load
  useEffect(() => {
    if (connection) {
      fetchMessages();
    }
  }, [connection, receiverEmail, currentUserEmail]);

  // Set up message handlers
  useEffect(() => {
    if (!connection) return;

    const handleMessageUpdate = (messageGroups: MessageDTO[]) => {
      const sortedMessages = processMessages(messageGroups);
      setMessages(sortedMessages);
    };

    // Set up event handlers
    connection.on('UpdateMessages', handleMessageUpdate);

    // Cleanup
    return () => {
      connection.off('UpdateMessages', handleMessageUpdate);
    };
  }, [connection, currentUserEmail, receiverEmail]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !connection) return;

    const message: MessageModel = {
      id: 0,
      senderEmail: currentUserEmail,
      receiverEmail: receiverEmail,
      message: newMessage,
      timestamp: new Date().toISOString()
    };

    try {
      await connection.invoke('SendMessage', message);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <Paper sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6">
          Chat with {receiverEmail}
        </Typography>
      </Box>

      {/* Messages List */}
      <List sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message, index) => (
          <ListItem
            key={index}
            sx={{
              justifyContent: message.senderEmail?.toLowerCase() === currentUserEmail.toLowerCase() ? 'flex-end' : 'flex-start',
            }}
          >
            <Box
              sx={{
                maxWidth: '70%',
                bgcolor: message.senderEmail?.toLowerCase() === currentUserEmail.toLowerCase() ? 'primary.main' : 'grey.200',
                color: message.senderEmail?.toLowerCase() === currentUserEmail.toLowerCase() ? 'white' : 'text.primary',
                borderRadius: 2,
                p: 1,
              }}
            >
              <Typography variant="body1">{message.content}</Typography>
              <Typography variant="caption" sx={{ opacity: 0.7 }}>
                {new Date(message.timestamp).toLocaleTimeString()}
              </Typography>
            </Box>
          </ListItem>
        ))}
        <div ref={messagesEndRef} />
      </List>

      {/* Message Input */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <IconButton color="primary" onClick={handleSendMessage}>
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Paper>
  );
};

export default ChatWindow; 