import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Message from '../models/Message.js';

export default (io) => {
  // Authenticate socket connections using the same JWT as the REST API.
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token || socket.handshake.query?.token;
      if (!token) return next(new Error('Authentication required'));
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password -otpHash -otpExpiry -otpAttempts -otpLastSent -watchlist');
      if (!user || !user.isVerified) return next(new Error('Verified account required'));
      socket.data.userId = user._id.toString();
      socket.data.user = user;
      next();
    } catch (error) {
      next(new Error('Invalid or expired session'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.data.userId;

    // Join the user's private room so messages can be routed to them.
    socket.join(userId);
    console.log(`Chat socket connected: user ${userId}`);

    socket.on('send_message', async (data, reply) => {
      try {
        const sender = socket.data.userId;
        const receiver = data?.receiver;
        const text = String(data?.text || '').trim();

        if (!sender || !receiver || !text || text.length > 1000 || sender === receiver) {
          return reply?.({ ok: false, error: 'Invalid message or receiver' });
        }

        const receiverUser = await User.findById(receiver);
        if (!receiverUser) {
          return reply?.({ ok: false, error: 'Receiver not found' });
        }

        const msg = await Message.create({ sender, receiver, text });

        // Deliver to both sender and receiver rooms.
        io.to(sender).to(receiver).emit('new_message', msg);
        reply?.({ ok: true });
      } catch (error) {
        console.error('send_message error:', error.message);
        reply?.({ ok: false, error: 'Could not save message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Chat socket disconnected: user ${userId}`);
    });
  });
};
