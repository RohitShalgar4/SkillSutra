import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    courseTitle:{
        type:String,
   },
   subTitle: {type:String}, 
   description:{
    type:String,
   },
   category:{
    type:String,
    required:true,
   },
   courseLevel:{
    type:String,
    enum:["Beginner","Intermidate", "Advance"]
   },
   coursePrice:{
    type:Number,
   },
   courseThumbnail:{
    type:String,
   },
   enrolledStudents:[
    {type:mongoose.Schema.Types.ObjectId,
    ref:'USer',
    }
   ],
   lectures:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"Lecture"
    }
   ],
   creator:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User"
   },
   isPublished:{
    type:Boolean,
    default:false
   },
   
}, {timestamps:true});

export const Course = mongoose.model('Course',courseSchema);