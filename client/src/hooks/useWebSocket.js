import { useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url, onMessage) => {
    const socket = useRef(null);
    const reconnectTimer = useRef(null);
    const connectRef = useRef(null);

    const connect = useCallback(() => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        const wsUrl = `${url}?token=${token}`;
        const ws = new WebSocket(wsUrl);
        socket.current = ws;

        ws.onopen = () => {
            console.log('WebSocket Connected');
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            onMessage(data);
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected. Reconnecting...');
            reconnectTimer.current = setTimeout(() => {
                if (connectRef.current) connectRef.current();
            }, 3000);
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            ws.close();
        };
    }, [url, onMessage]);

    useEffect(() => {
        connectRef.current = connect;
    }, [connect]);

    useEffect(() => {
        connect();
        return () => {
            if (socket.current) {
                socket.current.onclose = null;
                socket.current.close();
            }
            if (reconnectTimer.current) {
                clearTimeout(reconnectTimer.current);
            }
        };
    }, [connect]);
};

export default useWebSocket;
