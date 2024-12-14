import {User} from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";

export const register = async (req,res) => {
    try 
    {
        const {name,email,password} = req.body;
        if(!name || !email || !password)
            {
                return res.status(400).json
                    ({
                        sucess:false,
                        message:"All fields are required."
                    })
            }   
            const user = await User.findOne({email})
            if(user) 
                {
                    return res.status(400).json
                    ({
                        sucess:false,
                        message:"User Already Exists."
                    })
                }
                const hashedPassword = await bcrypt.hash(password,10);
            await User.create
            ({
                name,
                email,
                password:hashedPassword
            });
            return res.status(201).json
            ({
                sucess: true,
                message: "Account Created Sucessfully."
            })
    }
    catch (error) 
    { 
        console.log(error);
        return res.status(500).json
        ({
            success: false,
            message: "Error creating account"
        })
    }

}

export const login = async (req, res) => {
    try {
        const{email,password} = req.body
        if(!email || !password)
            {
                return res.status(400).json
                    ({
                        sucess:false,
                        message:"All fields are required."
                    })
            }
            const user = await User.findOne({ email});
            if(!user) {
                return res.status(400).json
                ({
                    sucess:false,
                    message:"Incorrect password or email."
                })
            }
            const isPasswordMatch = await bcrypt.compare(password, user.password);
        if(!isPasswordMatch) {
            return res.status(400).json
            ({
                sucess:false,
                message:"Incorrect password or email."
            });
        }
        generateToken (res,user, `Welcome Back ${user.name}`);
    }catch (error) {
        console.log(error);
        return res.status(500).json
        ({
            success: false,
            message: "Failed to login."
        })
    }
}