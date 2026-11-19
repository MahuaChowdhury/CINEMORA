import {Router} from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {randomInt} from 'node:crypto';
import nodemailer from 'nodemailer';
import User from '../models/User.js';
import {auth} from '../middleware/auth.js';

const router=Router();
const publicUser=u=>({id:u._id,name:u.name,email:u.email,role:u.role});
const tokenFor=u=>jwt.sign({id:u._id},process.env.JWT_SECRET,{expiresIn:'7d'});
const mailer=nodemailer.createTransport({service:'gmail',auth:{user:process.env.SMTP_EMAIL,pass:process.env.SMTP_APP_PASSWORD}});
const cleanEmail=value=>String(value||'').trim().toLowerCase();
const emailValid=email=>/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
async function sendNewOTP(user){
 const otp=String(randomInt(100000,1000000));
 user.otpHash=await bcrypt.hash(otp,10);
 user.otpExpiry=new Date(Date.now()+5*60*1000);
 user.otpAttempts=0;
 user.otpLastSent=new Date();
 await user.save();
 await mailer.sendMail({from:process.env.SMTP_EMAIL,to:user.email,subject:'Netflix Clone email verification OTP',text:`Your Netflix Clone verification code is ${otp}. It expires in 5 minutes. Do not share this code.`});
}
router.post('/register',async(req,res)=>{
 try{
  const name=String(req.body.name||'').trim(),email=cleanEmail(req.body.email),password=String(req.body.password||'').trim();
  if(name.length<2||!emailValid(email)||password.length<8)return res.status(400).json({message:'Enter name, valid email and password (minimum 8 characters)'});
  if(await User.exists({email}))return res.status(409).json({message:'Email already registered. Use Verify Email or Login.'});
  const user=await User.create({name,email,password:await bcrypt.hash(password,12)});
  try{await sendNewOTP(user)}catch(e){console.error('OTP email failed:',e.message);return res.status(503).json({message:'Account created but email could not be sent. Check SMTP settings and use Resend OTP.'})}
  res.status(201).json({message:'Registered! Check your email for a 6-digit OTP.'});
 }catch(e){console.error(e);res.status(500).json({message:'Registration failed'})}
});
router.post('/verify-otp',async(req,res)=>{
 try{
  const email=cleanEmail(req.body.email),otp=String(req.body.otp||'');
  const user=await User.findOne({email});
  if(!user)return res.status(400).json({message:'Invalid email or OTP'});
  if(user.isVerified)return res.json({message:'Email already verified. Please login.'});
  if(!user.otpHash||!user.otpExpiry||user.otpExpiry.getTime()<Date.now())return res.status(400).json({message:'OTP expired. Please resend OTP.'});
  if(user.otpAttempts>=5)return res.status(429).json({message:'Too many attempts. Please resend OTP.'});
  const valid=/^\d{6}$/.test(otp)&&await bcrypt.compare(otp,user.otpHash);
  if(!valid){user.otpAttempts++;await user.save();return res.status(400).json({message:'Incorrect OTP'})}
  user.isVerified=true;user.otpHash=null;user.otpExpiry=null;user.otpAttempts=0;await user.save();
  res.json({message:'Email verified! You can login now.'});
 }catch(e){console.error(e);res.status(500).json({message:'OTP verification failed'})}
});
router.post('/resend-otp',async(req,res)=>{
 try{
  const user=await User.findOne({email:cleanEmail(req.body.email)});
  const message='If your account needs verification, a new OTP will be emailed.';
  if(!user||user.isVerified)return res.json({message});
  if(user.otpLastSent&&Date.now()-user.otpLastSent.getTime()<60000)return res.status(429).json({message:'Please wait 60 seconds before resending OTP.'});
  await sendNewOTP(user);res.json({message});
 }catch(e){console.error('Resend failed:',e.message);res.status(503).json({message:'Could not send OTP. Check email configuration.'})}
});
router.post('/login',async(req,res)=>{
 try{
  const user=await User.findOne({email:cleanEmail(req.body.email)});
  if(!user||!await bcrypt.compare(String(req.body.password||'').trim(),user.password))return res.status(401).json({message:'Invalid email or password'});
  if(!user.isVerified)return res.status(403).json({message:'Verify your email first',verificationRequired:true});
  res.json({token:tokenFor(user),user:publicUser(user)});
 }catch(e){console.error(e);res.status(500).json({message:'Login failed'})}
});
router.get('/me',auth,(req,res)=>res.json(publicUser(req.user)));
export default router;
