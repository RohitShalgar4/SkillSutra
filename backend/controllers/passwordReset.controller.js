import { User } from "../models/user.model.js";
import { PasswordReset } from "../models/passwordReset.model.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import axios from "axios";

// Generate a secure random token
const generateToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Send reset email using EmailJS
const sendResetEmail = async (email, resetLink) => {
  try {
    console.log("Sending reset email to:", email);
    console.log("Reset link:", resetLink);
    console.log("EmailJS Config:", {
      service_id: process.env.EMAILJS_RESET_SERVICE_ID,
      template_id: process.env.EMAILJS_RESET_TEMPLATE_ID,
      public_key: process.env.EMAILJS_RESET_PUBLIC_KEY ? "Set" : "Not Set"
    });

    const emailParams = {
      service_id: process.env.EMAILJS_RESET_SERVICE_ID,
      template_id: process.env.EMAILJS_RESET_TEMPLATE_ID,
      user_id: process.env.EMAILJS_RESET_PUBLIC_KEY,
      template_params: {
        email: email,
        reset_link: resetLink,
      },
    };

    console.log("Sending request to EmailJS with params:", emailParams);

    const response = await axios.post(
      "https://api.emailjs.com/api/v1.0/email/send",
      emailParams,
      {
        headers: {
          "Content-Type": "application/json",
          Origin: process.env.FRONTEND_URL,
          "User-Agent": "Mozilla/5.0",
          Referer: process.env.FRONTEND_URL,
        },
      }
    );

    console.log("EmailJS Response:", response.data);
    return response.data;
  } catch (error) {
    console.error("EmailJS Error Details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw new Error("Failed to send reset email");
  }
};

// Request password reset
export const requestPasswordReset = async (req, res) => {
  try {
    console.log("Password reset request received:", req.body);
    const { email } = req.body;

    if (!email) {
      console.log("Email is missing in request");
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log("No user found with email:", email);
      return res.status(404).json({
        success: false,
        message: "No account found with this email address",
      });
    }

    console.log("User found:", user._id);

    // Generate reset token
    const token = generateToken();
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token
    const resetRequest = await PasswordReset.create({
      userId: user._id,
      token,
      expiresAt,
    });

    if (!resetRequest) {
      console.error("Failed to create reset request");
      throw new Error("Failed to create reset request");
    }

    console.log("Reset request created:", resetRequest._id);

    // Generate reset link
    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    // Check if EmailJS environment variables are set
    if (!process.env.EMAILJS_RESET_SERVICE_ID || 
        !process.env.EMAILJS_RESET_TEMPLATE_ID || 
        !process.env.EMAILJS_RESET_PUBLIC_KEY) {
      console.error("Missing EmailJS configuration:", {
        service_id: !!process.env.EMAILJS_RESET_SERVICE_ID,
        template_id: !!process.env.EMAILJS_RESET_TEMPLATE_ID,
        public_key: !!process.env.EMAILJS_RESET_PUBLIC_KEY
      });
      throw new Error("Email service configuration is missing");
    }

    // Send reset email
    try {
      await sendResetEmail(email, resetLink);
    } catch (emailError) {
      console.error("Failed to send reset email:", emailError);
      // Delete the reset request if email sending fails
      await PasswordReset.findByIdAndDelete(resetRequest._id);
      throw new Error("Failed to send reset email");
    }

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to your email",
    });
  } catch (error) {
    console.error("Password reset request error:", {
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process password reset request",
    });
  }
};

// Verify reset token
export const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    const resetRequest = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Valid reset token",
    });
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify reset token",
    });
  }
};

// Reset password
export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    // Find valid reset request
    const resetRequest = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetRequest) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset link",
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user's password
    await User.findByIdAndUpdate(resetRequest.userId, {
      password: hashedPassword,
    });

    // Mark reset token as used
    resetRequest.used = true;
    await resetRequest.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successful",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset password",
    });
  }
}; 