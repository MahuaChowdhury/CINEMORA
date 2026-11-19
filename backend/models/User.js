import mongoose from 'mongoose';
const schema = new mongoose.Schema({
 name:{type:String,required:true,trim:true},
 email:{type:String,required:true,unique:true,lowercase:true,trim:true},
 password:{type:String,required:true},
 role:{type:String,enum:['user','admin'],default:'user'},
 isVerified:{type:Boolean,default:false},
 otpHash:{type:String,default:null},
 otpExpiry:{type:Date,default:null},
 otpAttempts:{type:Number,default:0},
 otpLastSent:{type:Date,default:null},
 watchlist:[{type:mongoose.Schema.Types.ObjectId,ref:'Movie'}]
},{timestamps:true});
export default mongoose.model('User',schema);
