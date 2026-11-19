import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as IOServer } from 'socket.io';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import movieRoutes from './routes/movies.js';
import watchlistRoutes from './routes/watchlist.js';
import messageRoutes from './routes/messageRoutes.js';
import postRoutes from './routes/postRoutes.js';
import chatSocket from './sockets/chatSocket.js';

const app = express();
const server = http.createServer(app);
const origin = process.env.FRONTEND_URL || 'http://localhost:4200';
// Accept both spellings of the loopback host, since FRONTEND_URL may name either one.
const origins = [
  ...new Set([
    origin,
    origin.replace('127.0.0.1', 'localhost'),
    origin.replace('localhost', '127.0.0.1'),
  ]),
];
const io = new IOServer(server, {
  cors: { origin: origins, credentials: true },
  allowEIO3: true,
});

app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/posts', postRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected server error' });
});

chatSocket(io);

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'replace_with_a_long_random_secret') {
  console.error('Set a secure JWT_SECRET in backend/.env');
  process.exit(1);
}

try {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/netflix-clone');
  const port = process.env.PORT || 5000;
  server.listen(port, () => console.log(`API + Socket.IO listening at http://localhost:${port}`));
} catch (e) {
  console.error('MongoDB connection failed:', e.message);
  process.exit(1);
}
