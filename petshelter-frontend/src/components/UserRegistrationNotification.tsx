import React, { useEffect, useState } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { Snackbar, Alert } from '@mui/material';
import { UserDto, UserRole } from '../types';

const UserRegistrationNotification: React.FC = () => {
    const [connection, setConnection] = useState<HubConnection | null>(null);
    const [notification, setNotification] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'info' | 'warning' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'info'
    });

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:5291/userNotificationHub', {
                skipNegotiation: true,
                transport: 1 // WebSockets
            })
            .withAutomaticReconnect([0, 2000, 5000, 10000, 20000]) // Retry connection with increasing delays
            .build();

        setConnection(newConnection);
    }, []);

    useEffect(() => {
        if (connection) {
            connection.start()
                .then(() => {
                    console.log('SignalR Connected!');
                    // Join the admin group
                    return connection.invoke('JoinAdminGroup');
                })
                .then(() => {
                    console.log('Joined Admin Group!');
                    setNotification({
                        open: true,
                        message: 'Connected to real-time updates',
                        severity: 'success'
                    });
                })
                .catch(err => {
                    console.error('SignalR Connection Error: ', err);
                    setNotification({
                        open: true,
                        message: 'Failed to connect to real-time updates: ' + err.message,
                        severity: 'error'
                    });
                });

            connection.on('ReceiveNewUserRegistration', (newUser: UserDto) => {
                console.log('Received new user registration:', newUser);
                const roleName = UserRole[newUser.role] || 'User';
                setNotification({
                    open: true,
                    message: `New ${roleName} registered: ${newUser.name}`,
                    severity: 'info'
                });
            });

            connection.onreconnecting((error) => {
                console.log('Reconnecting to SignalR...', error);
                setNotification({
                    open: true,
                    message: 'Reconnecting to real-time updates...',
                    severity: 'warning'
                });
            });

            connection.onreconnected((connectionId) => {
                console.log('Reconnected to SignalR!', connectionId);
                setNotification({
                    open: true,
                    message: 'Reconnected to real-time updates',
                    severity: 'success'
                });
                // Rejoin admin group after reconnection
                connection.invoke('JoinAdminGroup');
            });

            return () => {
                connection.stop();
            };
        }
    }, [connection]);

    const handleClose = () => {
        setNotification(prev => ({ ...prev, open: false }));
    };

    return (
        <Snackbar
            open={notification.open}
            autoHideDuration={6000}
            onClose={handleClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
            <Alert onClose={handleClose} severity={notification.severity}>
                {notification.message}
            </Alert>
        </Snackbar>
    );
};

export default UserRegistrationNotification; 