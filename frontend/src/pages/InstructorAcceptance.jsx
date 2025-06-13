import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, CircularProgress, Button, Paper } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const InstructorAcceptance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [application, setApplication] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const checkApplicationStatus = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const email = params.get('email');
        const action = params.get('action');
        const name = params.get('name');
        
        if (!email || !action || !name) {
          setError('Missing required parameters: email, action, and name are required');
          setLoading(false);
          return;
        }

        // Create axios instance without auth header
        const api = axios.create({
          baseURL: API_URL,
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const response = await api.get(`/api/v1/instructor-application/request-to-be-instructor?email=${encodeURIComponent(email)}`);
        
        if (response.data.success) {
          setApplication(response.data.data);
        } else {
          setError(response.data.message || 'Failed to check application status');
        }
      } catch (error) {
        console.error('Error checking application status:', error);
        setError(error.response?.data?.message || 'Failed to check application status. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    checkApplicationStatus();
  }, [location.search]);

  const handleConfirm = async () => {
    try {
      setConfirming(true);
      const params = new URLSearchParams(location.search);
      const action = params.get('action');
      const email = params.get('email');
      const name = params.get('name');

      // Create axios instance without auth header
      const api = axios.create({
        baseURL: API_URL,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const response = await api.post(
        '/api/v1/instructor-application/request-to-be-instructor/confirm',
        { action, email, name }
      );

      if (response.data.success) {
        setSuccess(true);
        setApplication(response.data.data);
      } else {
        setError(response.data.message || 'Failed to process application');
      }
    } catch (error) {
      console.error('Error confirming application:', error);
      setError(error.response?.data?.message || 'Failed to process application. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
          <CancelIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Error
          </Typography>
          <Typography color="textSecondary" paragraph>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  if (success) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
          <CheckCircleIcon color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Application Processed Successfully
          </Typography>
          <Typography color="textSecondary" paragraph>
            {application.email_sent 
              ? 'The applicant has been notified via email.'
              : 'Note: The email notification could not be sent.'}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  if (!application) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
          <CancelIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" color="error" gutterBottom>
            Application Not Found
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  if (application.status !== 'pending') {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <Paper elevation={3} sx={{ p: 4, maxWidth: 600, textAlign: 'center' }}>
          <CancelIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            Application Already Processed
          </Typography>
          <Typography color="textSecondary" paragraph>
            This application has already been {application.status}.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
            sx={{ mt: 2 }}
          >
            Return to Home
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
      <Paper elevation={3} sx={{ p: 4, maxWidth: 600, width: '100%' }}>
        <Typography variant="h5" gutterBottom align="center">
          Confirm Application {location.search.includes('action=accept') ? 'Acceptance' : 'Rejection'}
        </Typography>
        
        <Box sx={{ my: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Applicant Details:
          </Typography>
          <Typography>Name: {application.name}</Typography>
          <Typography>Email: {application.email}</Typography>
          <Typography>Expertise Area: {application.expertiseArea}</Typography>
          <Typography>Experience: {application.experience}</Typography>
        </Box>

        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            color={location.search.includes('action=accept') ? 'success' : 'error'}
            onClick={handleConfirm}
            disabled={confirming}
          >
            {confirming ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              `Confirm ${location.search.includes('action=accept') ? 'Acceptance' : 'Rejection'}`
            )}
          </Button>
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            disabled={confirming}
          >
            Cancel
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default InstructorAcceptance; 