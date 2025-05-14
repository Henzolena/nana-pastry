import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';
import { auth } from '@/services/firebase';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '@/utils/toast'; // Import toast utilities

const EmailVerificationRequired: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is not logged in or already verified
  if (!user) {
    navigate('/auth'); // Redirect to login if not logged in
    return null;
  }

  if (user.emailVerified) {
    navigate('/'); // Redirect to home if already verified
    return null;
  }

  const handleResendVerificationEmail = async () => {
    if (user && auth) {
      try {
        await sendEmailVerification(user);
        console.log('Verification email resent to', user.email);
        showSuccessToast('Verification email resent! Please check your inbox.');
      } catch (error) {
        console.error('Error resending verification email:', error);
        showErrorToast('Failed to resend verification email. Please try again later.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4 text-center mt-40">
      <h1 className="text-2xl font-bold mb-4">Email Verification Required</h1>
      <p className="mb-4">
        Thank you for signing up! To access all features, please verify your email address.
        We have sent a verification link to <strong>{user.email}</strong>.
      </p>
      <p className="mb-4">
        Please check your inbox and spam folder for the verification email.
      </p>
      <button
        onClick={handleResendVerificationEmail}
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Resend Verification Email
      </button>
      <p className="mt-4">
        After verifying your email, you may need to log in again.
      </p>
    </div>
  );
};

export default EmailVerificationRequired;
