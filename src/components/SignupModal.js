import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function SignupModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { updateUserProfile } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields are filled
    if (!formData.displayName.trim() || !formData.username.trim() || !formData.bio.trim()) {
      setError('All fields are required');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_]{3,15}$/;
    if (!usernameRegex.test(formData.username)) {
      setError('Username must be 3-15 characters long and can only contain letters, numbers, and underscores');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await updateUserProfile(formData);
      onClose();
    } catch (err) {
      setError('Failed to update profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Complete Your Profile
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Please fill in all fields to complete your profile setup
          </p>
          {error && (
            <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name *
              </label>
              <input
                type="text"
                required
                value={formData.displayName}
                onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Your display name"
                minLength={2}
                maxLength={50}
              />
              <p className="mt-1 text-xs text-gray-500">
                This is how your name will appear to other users
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase() })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Choose a username"
                pattern="^[a-zA-Z0-9_]{3,15}$"
                title="3-15 characters, letters, numbers and underscores only"
              />
              <p className="mt-1 text-xs text-gray-500">
                3-15 characters, letters, numbers and underscores only
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bio *
              </label>
              <textarea
                required
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell us about yourself"
                minLength={10}
                maxLength={200}
              />
              <p className="mt-1 text-xs text-gray-500">
                Minimum 10 characters, maximum 200 characters
              </p>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Complete Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SignupModal; 