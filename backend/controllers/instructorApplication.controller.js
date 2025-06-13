import mongoose from 'mongoose';
import axios from 'axios';
import InstructorApplication from '../models/instructorApplication.model.js';
import { User } from '../models/user.model.js';
import dotenv from 'dotenv';

dotenv.config();

// Log all environment variables (excluding sensitive values)
console.log('Environment check:', {
  FRONTEND_URL: process.env.FRONTEND_URL,
  DIRECTOR_EMAIL: process.env.DIRECTOR_EMAIL,
  HAS_DIRECTOR_SERVICE_ID: !!process.env.EMAILJS_DIRECTOR_SERVICE_ID,
  HAS_DIRECTOR_PUBLIC_KEY: !!process.env.EMAILJS_DIRECTOR_PUBLIC_KEY,
  HAS_DIRECTOR_TEMPLATE_ID: !!process.env.EMAILJS_DIRECTOR_TEMPLATE_ID,
  HAS_ACCEPT_SERVICE_ID: !!process.env.EMAILJS_ACCEPT_SERVICE_ID,
  HAS_ACCEPT_PUBLIC_KEY: !!process.env.EMAILJS_ACCEPT_PUBLIC_KEY,
  HAS_ACCEPT_TEMPLATE_ID: !!process.env.EMAILJS_ACCEPT_TEMPLATE_ID,
  HAS_DECLINE_SERVICE_ID: !!process.env.EMAILJS_DECLINE_SERVICE_ID,
  HAS_DECLINE_PUBLIC_KEY: !!process.env.EMAILJS_DECLINE_PUBLIC_KEY,
  HAS_DECLINE_TEMPLATE_ID: !!process.env.EMAILJS_DECLINE_TEMPLATE_ID
});

// EmailJS configuration for different email types
const EMAILJS_CONFIG = {
  director: {
    service_id: process.env.EMAILJS_DIRECTOR_SERVICE_ID,
    public_key: process.env.EMAILJS_DIRECTOR_PUBLIC_KEY,
    template_id: process.env.EMAILJS_DIRECTOR_TEMPLATE_ID
  },
  accept: {
    service_id: process.env.EMAILJS_ACCEPT_SERVICE_ID,
    public_key: process.env.EMAILJS_ACCEPT_PUBLIC_KEY,
    template_id: process.env.EMAILJS_ACCEPT_TEMPLATE_ID
  },
  decline: {
    service_id: process.env.EMAILJS_DECLINE_SERVICE_ID,
    public_key: process.env.EMAILJS_DECLINE_PUBLIC_KEY,
    template_id: process.env.EMAILJS_DECLINE_TEMPLATE_ID
  }
};

// Submit new instructor application
export const submitApplication = async (req, res) => {
  try {
    console.log('Received application data:', JSON.stringify(req.body, null, 2));
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'phone', 'expertiseArea', 'experience', 'whyTeach', 'qualifications', 'availability'];
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    const application = new InstructorApplication(req.body);
    await application.save();
    console.log('Application saved successfully with ID:', application._id);

    // Send email to director using EmailJS
    const directorEmailParams = {
      service_id: EMAILJS_CONFIG.director.service_id,
      template_id: EMAILJS_CONFIG.director.template_id,
      user_id: EMAILJS_CONFIG.director.public_key,
      template_params: {
        to_email: process.env.DIRECTOR_EMAIL,
        application_id: application._id,
        name: application.name,
        email: application.email,
        phone: application.phone,
        expertiseArea: application.expertiseArea,
        experience: application.experience,
        whyTeach: application.whyTeach,
        qualifications: application.qualifications,
        availability: application.availability,
        accept_url: `${process.env.FRONTEND_URL}/instructor-acceptance?action=accept&email=${application.email}&name=${application.name}`,
        decline_url: `${process.env.FRONTEND_URL}/instructor-acceptance?action=decline&email=${application.email}&name=${application.name}`
      }
    };

    console.log('Attempting to send email with params:', JSON.stringify(directorEmailParams, null, 2));

    try {
      const emailResponse = await axios.post(
        'https://api.emailjs.com/api/v1.0/email/send',
        directorEmailParams,
        {
          headers: {
            'Content-Type': 'application/json',
            'Origin': process.env.FRONTEND_URL,
            'User-Agent': 'Mozilla/5.0',
            'Referer': process.env.FRONTEND_URL
          }
        }
      );
      console.log('Email sent successfully:', emailResponse.data);
    } catch (emailError) {
      console.error('Error sending email:', {
        message: emailError.message,
        response: emailError.response?.data,
        status: emailError.response?.status
      });
      // Continue with the response even if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application
    });
  } catch (error) {
    console.error('Error in submitApplication:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Check application status (first step)
export const checkApplicationStatus = async (req, res) => {
  try {
    const { email } = req.query;
    console.log('Checking application status for:', email);

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const application = await InstructorApplication.findOne({ email });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        name: application.name,
        email: application.email,
        status: application.status,
        expertiseArea: application.expertiseArea,
        experience: application.experience
      }
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check application status'
    });
  }
};

// Confirm application (second step)
export const confirmApplication = async (req, res) => {
  try {
    const { action, email, name } = req.body;
    console.log('Confirming application:', { action, email, name });

    if (!action || !email || !name) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: action, email, and name are required'
      });
    }

    if (!['accept', 'decline'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be either "accept" or "decline"'
      });
    }

    // Find and update application
    const application = await InstructorApplication.findOneAndUpdate(
      { email, status: 'pending' },
      { $set: { status: action === 'accept' ? 'approved' : 'rejected' } },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found or already processed'
      });
    }

    // If application is approved, update user role to Instructor
    if (action === 'accept') {
      const updatedUser = await User.findOneAndUpdate(
        { email },
        { $set: { role: 'Instructor' } },
        { new: true }
      );

      if (!updatedUser) {
        console.error('Failed to update user role for:', email);
        // Continue with the process even if user update fails
      } else {
        console.log('Successfully updated user role to Instructor for:', email);
      }
    }

    // Get email configuration
    const emailConfig = EMAILJS_CONFIG[action];
    if (!emailConfig || !emailConfig.service_id || !emailConfig.template_id || !emailConfig.public_key) {
      console.error('Invalid email configuration:', {
        action,
        hasServiceId: !!emailConfig?.service_id,
        hasTemplateId: !!emailConfig?.template_id,
        hasPublicKey: !!emailConfig?.public_key
      });
      throw new Error('Email configuration is incomplete');
    }

    // Prepare email parameters
    const emailParams = {
      service_id: emailConfig.service_id,
      template_id: emailConfig.template_id,
      user_id: emailConfig.public_key,
      template_params: {
        name: application.name,
        email: application.email,
        frontend_url: process.env.FRONTEND_URL,
        application_id: application._id,
        status: action === 'accept' ? 'approved' : 'rejected',
        expertise_area: application.expertiseArea,
        experience: application.experience,
        login_url: `${process.env.FRONTEND_URL}/login`,
        why_teach: application.whyTeach,
        qualifications: application.qualifications,
        availability: application.availability
      }
    };

    console.log('Sending email with params:', JSON.stringify(emailParams, null, 2));

    // Send email
    let emailSent = false;
    let emailError = null;

    try {
      const emailResponse = await axios.post(
        'https://api.emailjs.com/api/v1.0/email/send',
        emailParams,
        {
          headers: {
            'Content-Type': 'application/json',
            'Origin': process.env.FRONTEND_URL,
            'User-Agent': 'Mozilla/5.0',
            'Referer': process.env.FRONTEND_URL
          }
        }
      );
      console.log('Email sent successfully:', emailResponse.data);
      emailSent = true;
    } catch (error) {
      console.error('Error sending email:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      emailError = error;

      // Try one more time
      try {
        console.log('Retrying email send...');
        const retryResponse = await axios.post(
          'https://api.emailjs.com/api/v1.0/email/send',
          emailParams,
          {
            headers: {
              'Content-Type': 'application/json',
              'Origin': process.env.FRONTEND_URL,
              'User-Agent': 'Mozilla/5.0',
              'Referer': process.env.FRONTEND_URL
            }
          }
        );
        console.log('Email sent successfully on retry:', retryResponse.data);
        emailSent = true;
      } catch (retryError) {
        console.error('Error sending email on retry:', retryError);
        emailError = retryError;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Application ${action}ed successfully${emailSent ? ' and email sent' : ' but email failed to send'}`,
      data: {
        name: application.name,
        email: application.email,
        status: application.status,
        email_sent: emailSent,
        email_error: emailSent ? null : emailError?.response?.data?.message || emailError?.message
      }
    });
  } catch (error) {
    console.error('Error confirming application:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process application',
      error: error.message
    });
  }
}; 