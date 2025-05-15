import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { showSuccessToast, showErrorToast } from '@/utils/toast';
import { apiPost } from '@/services/apiService';

export default function SignupForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState(''); // Add state for display name
  const [localError, setLocalError] = useState('');
  const [loading, setLoading] = useState(false); // Manage loading state locally
  const [backendError, setBackendError] = useState<string | null>(null); // Manage backend errors

  // Remove signUp, loading, error, clearError from useAuth() as backend handles signup
  // const { signUp, loading: authLoading, error: authError, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setLocalError('');
    setBackendError(null);

    // Validate inputs
    if (!email || !password || !confirmPassword || !displayName) {
      setLocalError('Please fill out all fields');
      return;
    }

    if (password !== confirmPassword) {
      setLocalError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      console.log('Attempting to sign up with:', { email, displayName });
      
      // Use the apiPost service instead of raw fetch for better error handling and timeout
      const data = await apiPost('/auth/signup', { email, password, displayName });
      
      console.log('Signup successful:', data);
      showSuccessToast('Signup successful! Please check your email for verification.');
      
      // Store email in session storage to use on verification page
      sessionStorage.setItem('verificationEmail', email);
      
      // Redirect to email verification page
      navigate('/email-verification-required');
    } catch (error: any) {
      console.error('Error during signup:', error);
      
      // Try to extract structured error message if available
      const errorMessage = 
        (error.data && error.data.message) ? 
        error.data.message : 
        (error.message || 'An unexpected error occurred during signup');
      
      setBackendError(errorMessage);
      showErrorToast(errorMessage);
      
      // Special handling for specific error codes
      if (error.data && error.data.code === 'auth/email-already-exists') {
        console.log('User tried to register with existing email');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Account</h2>
        
        {(localError || backendError) && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded">
            {localError || backendError}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="displayName">
            Full Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="displayName"
            type="text"
            placeholder="Your Name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
            Email
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
            Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="confirm-password">
            Confirm Password
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="confirm-password"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-hotpink hover:bg-hotpink/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            type="submit"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : (
              'Sign Up'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
