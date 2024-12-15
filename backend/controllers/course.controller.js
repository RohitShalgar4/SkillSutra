import { Course } from "../models/course.model.js";

export const createCourse = async (req,res) => {
    try {
        const {courseTitle, category} =req.body;
        if(!courseTitle || !category)
            {
            return res.status(400).json({
            message:"Course Title and Category is Required."
    })
        }
        const course = await Course.create({
            courseTitle,
            category,
            creator:req.id
        });

        return res.status(201).json({
            course,
            message:"Course Created."
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message:"Failedto create course"
        })
    }
  
}