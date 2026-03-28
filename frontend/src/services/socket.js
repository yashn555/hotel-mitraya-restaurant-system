import io from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5000';

let socket = null;

export const connectSocket = () => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
        });
        
        socket.on('connect', () => {
            console.log('Socket connected successfully');
        });
        
        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
        
        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const emitOrderUpdate = (data) => {
    if (socket && socket.connected) {
        socket.emit('orderUpdate', data);
    } else {
        console.warn('Socket not connected, cannot emit orderUpdate');
    }
};

export const onOrderUpdate = (callback) => {
    if (socket) {
        socket.on('orderUpdated', callback);
    }
};

export const offOrderUpdate = () => {
    if (socket) {
        socket.off('orderUpdated');
    }
};

export default {
    connectSocket,
    disconnectSocket,
    emitOrderUpdate,
    onOrderUpdate,
    offOrderUpdate
};