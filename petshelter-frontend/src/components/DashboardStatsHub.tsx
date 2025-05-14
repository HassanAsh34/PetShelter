import React, { useEffect, useState } from 'react';
import { HubConnectionBuilder, HubConnection } from '@microsoft/signalr';
import { DashboardStatsDto } from '../types';

interface DashboardStatsHubProps {
    onStatsUpdate: (stats: DashboardStatsDto) => void;
}

const DashboardStatsHub: React.FC<DashboardStatsHubProps> = ({ onStatsUpdate }) => {
    const [connection, setConnection] = useState<HubConnection | null>(null);

    useEffect(() => {
        const newConnection = new HubConnectionBuilder()
            .withUrl('http://localhost:5291/dashboardHub', {
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
                    console.log('Dashboard Stats Hub Connected!');
                })
                .catch(err => {
                    console.error('Dashboard Stats Hub Connection Error: ', err);
                });

            // Listen for dashboard updates
            connection.on('ReceiveDashboardUpdate', (stats: DashboardStatsDto) => {
                console.log('Received dashboard update:', stats);
                onStatsUpdate(stats);
            });

            connection.onreconnecting((error) => {
                console.log('Reconnecting to Dashboard Stats Hub...', error);
            });

            connection.onreconnected((connectionId) => {
                console.log('Reconnected to Dashboard Stats Hub!', connectionId);
            });

            return () => {
                connection.stop();
            };
        }
    }, [connection, onStatsUpdate]);

    return null; // This component doesn't render anything
};

export default DashboardStatsHub; 