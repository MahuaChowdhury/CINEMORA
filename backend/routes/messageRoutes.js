import express from 'express';
import { listUsers, getMessages } from '../controllers/messageController.js';
import { chatbot } from '../controllers/chatbotController.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.use(auth);

router.get('/users', listUsers);
router.get('/:a/:b', getMessages);
router.post('/chatbot', chatbot);

export default router;
