import { Router } from 'express';
import { createPost, listPosts, toggleLike } from '../controllers/postController.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.use(auth);

router.get('/', listPosts);
router.post('/', createPost);
router.post('/:id/like', toggleLike);

export default router;
