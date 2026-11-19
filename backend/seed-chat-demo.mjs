import 'dotenv/config';
import mongoose from 'mongoose';
import Message from './models/Message.js';
import User from './models/User.js';

await mongoose.connect(process.env.MONGO_URI);

const admin = await User.findOne({ email: 'admin@netflixclone.dev' });
const demo = await User.findOne({ email: { $ne: 'admin@netflixclone.dev' } }).sort({ createdAt: 1 });
if (!admin || !demo) throw new Error('users not found');

console.log('admin', admin.name, admin._id.toString());
console.log('other', demo.name, demo._id.toString());

await Message.deleteMany({
  $or: [
    { sender: admin._id, receiver: demo._id },
    { sender: demo._id, receiver: admin._id },
  ],
});

const now = Date.now();
const thread = [
  [demo._id, admin._id, 'Hey! Did you catch Neon Streets yet?', -42],
  [admin._id, demo._id, 'Not yet — is it worth it?', -38],
  [demo._id, admin._id, 'Absolutely. The soundtrack alone is worth it.', -35],
  [admin._id, demo._id, 'Adding it to My List right now.', -30],
  [demo._id, admin._id, 'Also try The Last Horizon if you like sci-fi.', -12],
];

for (const [sender, receiver, text, mins] of thread) {
  await Message.create({ sender, receiver, text, createdAt: new Date(now + mins * 60000) });
}

const count = await Message.countDocuments({});
console.log('messages in db:', count);
await mongoose.disconnect();
process.exit(0);
