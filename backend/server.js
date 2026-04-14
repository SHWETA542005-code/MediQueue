const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173',
  process.env.FRONTEND_URL, // will set this after Vercel deploy
];

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
  },
});

app.set('io', io);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/tokens', require('./routes/token.routes'));
app.use('/api/departments', require('./routes/dept.routes'));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('join-department', (departmentId) => {
    socket.join(departmentId);
  });
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

app.get('/', (req, res) => res.json({ message: 'MediQueue API running' }));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));