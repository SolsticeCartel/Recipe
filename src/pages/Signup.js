import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SignupModal from '../components/SignupModal';
import ProfileSetup from '../components/ProfileSetup';

function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, currentUser } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [initialAuthCheck, setInitialAuthCheck] = useState(false);

  // Initial auth check
  useEffect(() => {
    if (currentUser?.displayName) {
      navigate('/profile');
    }
    setInitialAuthCheck(true);
  }, [currentUser, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      setShowProfileSetup(true);
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create an account: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  // Only show ProfileSetup after initial auth check and when needed
  if (initialAuthCheck && ((currentUser && !currentUser.displayName) || showProfileSetup)) {
    return <ProfileSetup />;
  }

  // Don't render anything until initial auth check is complete
  if (!initialAuthCheck) {
    return null;
  }

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Create your account
            </h2>
          </div>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">Email address</label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Password</label>
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign up
              </button>
            </div>

            <div className="text-sm text-center">
              <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Already have an account? Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
      <SignupModal 
        isOpen={showProfileModal} 
        onClose={() => {
          setShowProfileModal(false);
          if (currentUser?.displayName) {
            navigate('/');
          }
        }}
      />
    </>
  );
}

export default Signup; 