const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const aiRoutes = require('./routes/aiRoutes');
const billRoutes = require('./routes/billRoutes');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
        credentials: true
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/menu', require('./routes/menuRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/ai', aiRoutes);
app.use('/api/bills', billRoutes);

// Socket.io connection
io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('orderUpdate', (data) => {
        io.emit('orderUpdated', data);
    });
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

// Make io accessible to routes
app.set('io', io);

// Error handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});