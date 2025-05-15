import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { showInfoToast } from '@/utils/toast';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, loading, error, clearError } = useAuth();

  // Check for prefilled email from email verification flow
  useEffect(() => {
    const prefillEmail = sessionStorage.getItem('prefillEmail');
    if (prefillEmail) {
      setEmail(prefillEmail);
      showInfoToast('Your email has been verified! Please sign in to continue.');
      // Clear from session storage to avoid showing the message again
      sessionStorage.removeItem('prefillEmail');
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!email || !password) {
      return;
    }
    
    // Clear any previous errors
    clearError();
    
    // Call the signIn method from AuthContext
    await signIn(email, password);
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Login</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 border border-red-200 rounded">
            {error}
          </div>
        )}
        
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
        
        <div className="mb-6">
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
            autoComplete="current-password"
          />
        </div>
        
        <div className="flex items-center justify-between">
          <button
            className="bg-hotpink hover:bg-hotpink/90 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </form>
    </div>
  );
}