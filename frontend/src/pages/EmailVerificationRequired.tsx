import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast, showInfoToast } from '@/utils/toast';
import { reload, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { apiPost } from '@/services/apiService';

const EmailVerificationRequired: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string>('');
  const [isChecking, setIsChecking] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Get email from session storage if available (from signup flow)
  useEffect(() => {
    const verificationEmail = sessionStorage.getItem('verificationEmail');
    if (verificationEmail) {
      setEmail(verificationEmail);
    } else if (user?.email) {
      setEmail(user.email);
    }
  }, [user]);

  // Auto-check verification status every 30 seconds
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Only set up auto-check if we have an email to work with
    if (email) {
      timer = setInterval(() => {
        handleCheckVerificationStatus();
      }, 30000); // 30 seconds
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [email]);

  // If user is already verified, redirect to home
  useEffect(() => {
    if (user?.emailVerified) {
      showSuccessToast('Email verified successfully!');
      navigate('/');
    }
  }, [user, navigate]);

  // Timer for resend cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [resendCooldown]);

  // Handle checking verification status
  const handleCheckVerificationStatus = async () => {
    if (!email) {
      showErrorToast('Email address is not available');
      return;
    }
    
    setIsChecking(true);
    
    try {
      // If user is logged in, just reload the user to check verification status
      if (user) {
        await reload(user);
        if (user.emailVerified) {
          showSuccessToast('Email verified successfully!');
          navigate('/');
          return;
        }
      } 
      
      // If user is not logged in or still not verified, check with backend
      try {
        const data = await apiPost<{ isVerified: boolean }>('/auth/check-email-verification', { email });
        
        if (data.isVerified) {
          showSuccessToast('Email verified successfully!');
          // Redirect to login page with verified email as query param for auto-fill
          navigate(`/auth?verified=${encodeURIComponent(email)}`);
          return;
        }
        
        // If still not verified
        showInfoToast('Email not verified yet. Please check your inbox and click the verification link.');
      } catch (error: any) {
        console.error('API error checking verification status:', error);
        const errorMessage = 
          (error.data && error.data.message) ? 
          error.data.message : 
          (error.message || 'Failed to check verification status');
        showErrorToast(`Verification check failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
      showErrorToast('Error checking verification status. Please try again.');
    } finally {
      setIsChecking(false);
    }
  };

  // Handle resending verification email
  const handleResendVerificationEmail = async () => {
    setLoading(true);
    
    try {
      if (user && auth) {
        // If user is logged in, use Firebase SDK directly
        await sendEmailVerification(user);
        showSuccessToast('Verification email resent! Please check your inbox.');
        
        // Start a 60-second cooldown to prevent spamming
        setResendCooldown(60);
      } else if (email) {
        // If user is not logged in, use backend API
        try {
          await apiPost('/auth/send-verification-email', { email });
          showSuccessToast('Verification email resent! Please check your inbox.');
          
          // Start a 60-second cooldown to prevent spamming
          setResendCooldown(60);
        } catch (error: any) {
          console.error('API error resending verification email:', error);
          
          // Extract the most informative error message
          const errorMessage = 
            (error.data && error.data.message) ? 
            error.data.message : 
            (error.message || 'Failed to resend verification email');
          
          showErrorToast(`Failed to resend: ${errorMessage}`);
          throw error; // Re-throw to be caught by the outer catch
        }
      } else {
        showErrorToast('Email address is not available');
      }
    } catch (error) {
      console.error('Error resending verification email:', error);
      
      // Show a user-friendly error message based on the error type
      if (error instanceof Error) {
        const errorMessage = error.message;
        
        // Check for specific rate limit related messages
        if (errorMessage.includes('Too many') || errorMessage.includes('TRY_LATER')) {
          showErrorToast('Too many verification emails sent. Please wait a few minutes before trying again.');
        } else {
          showErrorToast(errorMessage);
        }
      } else {
        showErrorToast('Failed to resend verification email. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 text-center mt-40">
      <h1 className="text-2xl font-bold mb-4">Email Verification Required</h1>
      <p className="mb-4">
        Thank you for signing up! To access all features, please verify your email address.
      </p>
      <p className="mb-4">
        We have sent a verification link to <strong>{email}</strong>.
      </p>
      <p className="mb-4">
        Please check your inbox and spam folder for the verification email.
      </p>
      
      <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4 mb-6">
        <button
          onClick={handleCheckVerificationStatus}
          disabled={isChecking || loading}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out w-full md:w-auto"
        >
          {isChecking ? 'Checking...' : 'Check Verification Status'}
        </button>
        
        <button
          onClick={handleResendVerificationEmail}
          disabled={loading || isChecking || resendCooldown > 0}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out w-full md:w-auto disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
        </button>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded-lg max-w-lg mx-auto">
        <h3 className="font-medium text-lg mb-2">What to do next?</h3>
        <ol className="text-left list-decimal list-inside space-y-2">
          <li>Open the verification email we sent you (check inbox and spam folders)</li>
          <li>Click the verification link in the email</li>
          <li>Return to this page and click "Check Verification Status"</li>
          <li>Once verified, you'll be automatically redirected to the homepage</li>
        </ol>
        <p className="mt-3 text-amber-700 text-sm">
          <strong>Note:</strong> Verification links expire after some time. If it's been a while since you received the email, 
          please click "Resend Verification Email" to get a fresh link.
        </p>
        
        {/* Email verification information */}
        <div className="mt-4 p-2 bg-blue-100 rounded border border-blue-300 text-sm">
          <p className="font-medium text-blue-800">Email Verification Information:</p>
          <p className="text-blue-700 mb-2">
            A verification email has been sent to your email address. If you don't see it in your inbox, please:
          </p>
          <ul className="list-disc pl-5 text-blue-700 space-y-1">
            <li>Check your spam or junk folder</li>
            <li>Make sure you entered the correct email address</li>
            <li>Wait a few minutes as emails can sometimes be delayed</li>
            <li>Use the "Resend Verification Email" button if needed</li>
          </ul>
        </div>
      </div>
      
      <p className="mt-6 text-sm text-gray-600">
        Having trouble? Contact our support team at support@nanapastry.com
      </p>
    </div>
  );
};

export default EmailVerificationRequired;
