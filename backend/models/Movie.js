import mongoose from 'mongoose';
const schema=new mongoose.Schema({title:{type:String,required:true,trim:true},description:{type:String,required:true},genre:{type:String,required:true},year:{type:Number,required:true,min:1888,max:2100},duration:{type:String,default:'2h 00m'},rating:{type:String,default:'PG-13'},poster:{type:String,required:true},backdrop:{type:String,required:true},videoUrl:{type:String,default:''},featured:{type:Boolean,default:false},trending:{type:Boolean,default:false}},{timestamps:true});
export default mongoose.model('Movie',schema);
