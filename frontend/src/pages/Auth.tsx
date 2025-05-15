import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { useNavigate } from 'react-router-dom';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Check for verified email parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verifiedEmail = urlParams.get('verified');

    if (verifiedEmail) {
      // Switch to login mode and show success message
      setIsLogin(true);
      // Fill the email field (will be handled in the LoginForm)
      sessionStorage.setItem('prefillEmail', verifiedEmail);
      // Show toast notification (assuming you have it in your page)
      // If you're using the same toast system, you'd need to import it
    }
  }, []);

  // Use useEffect for navigation instead of during render
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  // Early return without immediate navigation
  if (user) {
    return null;
  }

  return (
    <div className="container mx-auto py-44 px-4">
      <div className="max-w-md mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2 text-primary">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p className="text-gray-600">
            {isLogin
              ? 'Sign in to access your account'
              : 'Join us for delicious cakes and pastries'}
          </p>
        </div>

        <div className="flex justify-center mb-8">
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg w-full max-w-xs">
            <button
              className={`w-1/2 py-2 text-sm font-medium rounded-md transition ${
                isLogin
                  ? 'bg-hotpink shadow-sm text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`w-1/2 py-2 text-sm font-medium rounded-md transition ${
                !isLogin
                  ? 'bg-hotpink shadow-sm text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>
        </div>

        {isLogin ? <LoginForm /> : <SignupForm />}
      </div>
    </div>
  );
}