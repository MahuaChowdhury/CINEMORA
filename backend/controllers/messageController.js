import mongoose from 'mongoose';
import User from '../models/User.js';
import Message from '../models/Message.js';

/** List all users (excluding passwords) for the chat directory. */
export async function listUsers(req, res) {
  try {
    const users = await User.find().select('-password -otpHash -otpExpiry -otpAttempts -otpLastSent -watchlist').sort({ name: 1 });
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load users' });
  }
}

/** Return the last 200 messages between two users (either direction). */
export async function getMessages(req, res) {
  try {
    const { a, b } = req.params;
    if (!mongoose.isValidObjectId(a) || !mongoose.isValidObjectId(b)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    const messages = await Message.find({
      $or: [{ sender: a, receiver: b }, { sender: b, receiver: a }],
    }).sort({ createdAt: 1 }).limit(200);
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load messages' });
  }
}
