import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../config/firebase';
import { useNotification } from '../context/NotificationContext';
import { uploadToPlaybook } from '../config/playbook';
import { useRecipes } from '../context/RecipeContext';

function ProfileSetup() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: '',
    username: '',
    bio: '',
    photoURL: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { checkUsernameAvailability } = useRecipes();
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const checkUsername = async () => {
      if (!profileData.username) {
        setUsernameError('');
        return;
      }

      setIsCheckingUsername(true);
      try {
        const isAvailable = await checkUsernameAvailability(profileData.username);
        if (!isAvailable) {
          setUsernameError('This username is already taken');
        } else {
          setUsernameError('');
        }
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameError('Error checking username availability');
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [profileData.username, checkUsernameAvailability]);

  const handleUsernameChange = (e) => {
    const value = e.target.value
      .toLowerCase()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');

    setProfileData(prev => ({ ...prev, username: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || usernameError) return;
    setIsSubmitting(true);

    try {
      let photoURL = null;
      
      if (imageFile) {
        try {
          console.log('Starting image upload...');
          photoURL = await uploadToPlaybook(imageFile);
          console.log('Got image URL:', photoURL);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          showNotification('Failed to upload image. Please try again.');
          setIsSubmitting(false);
          return;
        }
      }

      // Create user profile document in Firestore
      const userProfile = {
        displayName: profileData.displayName,
        username: profileData.username.toLowerCase(),
        bio: profileData.bio,
        photoURL: photoURL,
        email: currentUser.email,
        updatedAt: new Date().toISOString()
      };

      try {
        // Update auth profile
        await updateProfile(currentUser, {
          displayName: profileData.displayName,
          photoURL: photoURL
        });

        // Save to Firestore
        await setDoc(doc(db, 'users', currentUser.uid), userProfile, { merge: true });
        
        showNotification('Profile setup completed! 🎉');
        navigate('/');
      } catch (dbError) {
        console.error('Database operation failed:', dbError);
        throw dbError;
      }

    } catch (error) {
      console.error('Profile setup error:', error);
      showNotification('Error setting up profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    // Clean up localStorage after using the username
    return () => {
      localStorage.removeItem('signupUsername');
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete Your Profile</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={imagePreview || `https://ui-avatars.com/api/?name=${profileData.displayName}`}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover"
              />
              <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Name *
            </label>
            <input
              type="text"
              required
              value={profileData.displayName}
              onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your display name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={profileData.username}
                onChange={handleUsernameChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  usernameError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Choose a unique username"
              />
              {isCheckingUsername && (
                <span className="absolute right-3 top-2 text-gray-400">
                  Checking...
                </span>
              )}
            </div>
            {usernameError && (
              <p className="mt-1 text-sm text-red-600">{usernameError}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={profileData.bio}
              onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself"
              rows={3}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Setting up...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfileSetup; 