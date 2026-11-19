import Post from '../models/Post.js';

const publicPost = (post) => ({
  _id: post._id,
  text: post.text,
  likes: post.likes.map(String),
  createdAt: post.createdAt,
  user: post.user?._id
    ? { _id: post.user._id, name: post.user.name, role: post.user.role }
    : null,
});

/** Latest 50 posts for the community feed. */
export async function listPosts(req, res) {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).limit(50).populate('user', 'name role');
    res.json(posts.map(publicPost));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not load posts' });
  }
}

export async function createPost(req, res) {
  try {
    const text = String(req.body?.text ?? '').trim();
    if (!text) {
      return res.status(400).json({ message: 'Write something before publishing' });
    }
    if (text.length > 500) {
      return res.status(400).json({ message: 'Posts are limited to 500 characters' });
    }
    const post = await Post.create({ user: req.user.id, text });
    await post.populate('user', 'name role');
    res.status(201).json(publicPost(post));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Could not publish your post' });
  }
}

export async function toggleLike(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }
    const me = String(req.user.id);
    const liked = post.likes.some((id) => String(id) === me);
    if (liked) {
      post.likes.pull(me);
    } else {
      post.likes.addToSet(me);
    }
    await post.save();
    res.json({ liked: !liked, likes: post.likes.map(String) });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Could not update the like' });
  }
}
