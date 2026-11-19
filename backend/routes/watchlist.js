import {Router} from 'express';import User from '../models/User.js';import Movie from '../models/Movie.js';import {auth} from '../middleware/auth.js';
const router=Router();router.use(auth);
router.get('/',async(req,res)=>{const user=await User.findById(req.user.id).populate('watchlist');res.json(user.watchlist.filter(Boolean))});
router.post('/:id',async(req,res)=>{try{if(!await Movie.exists({_id:req.params.id}))return res.status(404).json({message:'Movie not found'});await User.findByIdAndUpdate(req.user.id,{$addToSet:{watchlist:req.params.id}});res.json({message:'Added to My List'})}catch{res.status(400).json({message:'Invalid movie ID'})}});
router.delete('/:id',async(req,res)=>{try{await User.findByIdAndUpdate(req.user.id,{$pull:{watchlist:req.params.id}});res.json({message:'Removed from My List'})}catch{res.status(400).json({message:'Invalid movie ID'})}});
export default router;
