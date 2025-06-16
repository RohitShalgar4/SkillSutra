import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, BookOpen, Clock, MessageSquare, Send, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useLoadUserQuery } from "@/features/api/authApi";

const InstructorRequestForm = () => {
  const { data, isLoading } = useLoadUserQuery(undefined, {
    refetchOnMountOrArgChange: true
  });

  // Handle acceptance from URL parameters (when director clicks Accept)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const action = urlParams.get('action');
    const email = urlParams.get('email');
    const name = urlParams.get('name');
    
    if (action === 'accept' && email && name) {
      handleInstructorAcceptance(email, name);
    }
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    expertiseArea: '',
    experience: '',
    whyTeach: '',
    qualifications: '',
    availability: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Auto-populate user data when data is loaded
  useEffect(() => {
    if (data?.user) {
      setFormData(prevData => ({
        ...prevData,
        name: data.user.name || '',
        email: data.user.email || ''
      }));
    }
  }, [data]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    else if (!/^\+?[\d\s-()]{10,}$/.test(formData.phone)) newErrors.phone = 'Phone number is invalid';
    
    if (!formData.expertiseArea.trim()) newErrors.expertiseArea = 'Expertise area is required';
    if (!formData.experience.trim()) newErrors.experience = 'Teaching experience is required';
    if (!formData.whyTeach.trim()) newErrors.whyTeach = 'Please explain why you want to teach';
    if (!formData.qualifications.trim()) newErrors.qualifications = 'Qualifications are required';
    if (!formData.availability.trim()) newErrors.availability = 'Availability information is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const sendEmail = async (data) => {
    try {
      const response = await axios.post('https://skillsutra.onrender.com/api/v1/instructor-application/request-to-be-instructor', data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error sending request:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to send request' 
      };
    }
  };

  const handleInstructorAcceptance = async (email, name) => {
    try {
      setSubmitStatus({
        type: 'success',
        message: 'Processing instructor acceptance...'
      });

      // Call the backend to handle the acceptance
      const response = await axios.get(`https://skillsutra.onrender.com/api/v1/instructor-application/request-to-be-instructor`, {
        params: {
          action: 'accept',
          email,
          name
        },
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });

      if (response.data.success) {
        setSubmitStatus({
          type: 'success',
          message: `🎉 Instructor ${name} has been successfully approved! A welcome email has been sent to ${email}.`
        });
      } else {
        throw new Error(response.data.message || 'Failed to process acceptance');
      }
    } catch (error) {
      console.error('Error processing acceptance:', error);
      setSubmitStatus({
        type: 'error',
        message: `Failed to process instructor acceptance for ${name}. Please try again.`
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setSubmitStatus({ type: 'error', message: 'Please correct the errors above.' });
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const result = await sendEmail(formData);
      
      if (result.success) {
        setSubmitStatus({
          type: 'success',
          message: 'Your instructor request has been submitted successfully! You will receive a response within 2-3 business days.'
        });
        
        // Reset form except user details
        setFormData({
          name: data?.user?.name || '',
          email: data?.user?.email || '',
          phone: '',
          expertiseArea: '',
          experience: '',
          whyTeach: '',
          qualifications: '',
          availability: ''
        });
      } else {
        throw new Error(result.error || 'Failed to send request');
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: error.message || 'Failed to submit your request. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
          {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {new URLSearchParams(window.location.search).get('action') === 'accept' 
              ? 'Instructor Approved!' 
              : 'Become an Instructor'
            }
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            {new URLSearchParams(window.location.search).get('action') === 'accept'
              ? 'The instructor application has been processed and a welcome email has been sent.'
              : 'Share your expertise and help others learn. Fill out this form to apply as an instructor on our platform.'
            }
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Status Messages */}
          {submitStatus && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
              submitStatus.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {submitStatus.type === 'success' ? (
                <CheckCircle className="w-5 h-5 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
              )}
              <p className="font-medium">{submitStatus.message}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Personal Information */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Full Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Your full name"
                  disabled={true} // Auto-filled from user session
                />
                {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="w-4 h-4 inline mr-1" />
                  Email Address *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="your.email@example.com"
                  disabled={true} // Auto-filled from user session
                />
                {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                <Phone className="w-4 h-4 inline mr-1" />
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="+1 (555) 123-4567"
              />
              {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
            </div>

            {/* Professional Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Information</h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="expertiseArea" className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Area of Expertise *
                  </label>
                  <input
                    type="text"
                    id="expertiseArea"
                    name="expertiseArea"
                    value={formData.expertiseArea}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.expertiseArea ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Web Development, Data Science, Digital Marketing"
                  />
                  {errors.expertiseArea && <p className="text-red-600 text-sm mt-1">{errors.expertiseArea}</p>}
                </div>

                <div>
                  <label htmlFor="qualifications" className="block text-sm font-medium text-gray-700 mb-2">
                    Qualifications & Certifications *
                  </label>
                  <textarea
                    id="qualifications"
                    name="qualifications"
                    value={formData.qualifications}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.qualifications ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="List your relevant degrees, certifications, and professional credentials"
                  />
                  {errors.qualifications && <p className="text-red-600 text-sm mt-1">{errors.qualifications}</p>}
                </div>

                <div>
                  <label htmlFor="experience" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Teaching/Training Experience *
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={formData.experience}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.experience ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Describe your teaching experience, including years of experience, types of students taught, and any notable achievements"
                  />
                  {errors.experience && <p className="text-red-600 text-sm mt-1">{errors.experience}</p>}
                </div>

                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-2">
                    Availability *
                  </label>
                  <textarea
                    id="availability"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                    rows={3}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.availability ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="When are you available to teach? Include days, times, and time zone"
                  />
                  {errors.availability && <p className="text-red-600 text-sm mt-1">{errors.availability}</p>}
                </div>

                <div>
                  <label htmlFor="whyTeach" className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    Why do you want to teach on our platform? *
                  </label>
                  <textarea
                    id="whyTeach"
                    name="whyTeach"
                    value={formData.whyTeach}
                    onChange={handleInputChange}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.whyTeach ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    placeholder="Tell us about your motivation to teach and what you hope to achieve"
                  />
                  {errors.whyTeach && <p className="text-red-600 text-sm mt-1">{errors.whyTeach}</p>}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t pt-6">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-lg font-medium transition-all ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-200'
                } text-white`}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting Request...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Submit Instructor Request
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <p className="text-sm text-primary">
              <strong>Next Steps:</strong> After submitting your application, our team will review your information and contact you within 2-3 business days. If approved, you&apos;ll receive access to our instructor dashboard and onboarding materials.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorRequestForm;