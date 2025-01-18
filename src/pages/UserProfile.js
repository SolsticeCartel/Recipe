import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../context/RecipeContext';
import { useNavigate, Link } from 'react-router-dom';
import RecipeCard from '../components/RecipeCard';
import { updateProfile } from 'firebase/auth';
import { useNotification } from '../context/NotificationContext';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import { uploadToPlaybook } from '../config/playbook';
import ProfileSetup from '../components/ProfileSetup';

function UserProfile() {
  const { currentUser, logout } = useAuth();
  const { getUserRecipes, checkUsernameAvailability, deleteRecipe } = useRecipes();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState({
    displayName: currentUser?.displayName || '',
    photoURL: currentUser?.photoURL || '',
    username: '',
    bio: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        const [userDoc, recipes] = await Promise.all([
          getDoc(doc(db, 'users', currentUser.uid)),
          getUserRecipes(currentUser.uid)
        ]);

        if (!isMounted) return;

        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUserProfile({
            displayName: currentUser.displayName || '',
            photoURL: currentUser.photoURL || '',
            username: userData.username || '',
            bio: userData.bio || '',
            originalUsername: userData.username || '',
            originalBio: userData.bio || ''
          });
        }
        setUserRecipes(recipes);
        setError(null);

        // Check if profile is incomplete
        if (!currentUser.displayName) {
          setShowProfileSetup(true);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
        if (isMounted) {
          setError('Failed to load profile data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [currentUser, getUserRecipes]);

  useEffect(() => {
    if (!isEditing) return;

    const checkUsername = async () => {
      if (!userProfile.username || userProfile.username === userProfile.originalUsername) {
        setUsernameError('');
        return;
      }

      setIsCheckingUsername(true);
      try {
        const isAvailable = await checkUsernameAvailability(userProfile.username, userProfile.originalUsername);
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
  }, [userProfile.username, isEditing, userProfile.originalUsername, checkUsernameAvailability]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to log out');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile(prev => ({ ...prev, photoURL: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting || usernameError) return;
    setIsSubmitting(true);

    try {
      if (userProfile.username !== userProfile.originalUsername) {
        const isAvailable = await checkUsernameAvailability(userProfile.username, userProfile.originalUsername);
        if (!isAvailable) {
          setUsernameError('This username is already taken');
          setIsSubmitting(false);
          return;
        }
      }

      let photoURL = userProfile.photoURL;

      if (imageFile) {
        photoURL = await uploadToPlaybook(imageFile);
      }

      const updatedProfile = {
        ...userProfile,
        photoURL,
        updatedAt: new Date().toISOString()
      };

      await updateProfile(auth.currentUser, {
        displayName: updatedProfile.displayName,
        photoURL: updatedProfile.photoURL,
      });

      await setDoc(doc(db, 'users', currentUser.uid), updatedProfile);

      setUserProfile(updatedProfile);
      setIsEditing(false);
      showNotification('Profile updated successfully! 😊');
    } catch (error) {
      console.error('Error updating profile:', error);
      showNotification('Failed to update profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUsernameChange = (e) => {
    const value = e.target.value
      .toLowerCase() // Convert to lowercase
      .replace(/\s+/g, '_') // Replace spaces with underscore
      .replace(/[^a-z0-9_]/g, ''); // Remove any characters that aren't lowercase letters, numbers, or underscore

    setUserProfile(prev => ({ ...prev, username: value }));
  };

  const handleCancelEdit = () => {
    setUserProfile(prevState => ({
      ...prevState,
      displayName: currentUser?.displayName || '',
      photoURL: currentUser?.photoURL || '',
      username: prevState.originalUsername || '',
      bio: prevState.originalBio || ''
    }));
    setImageFile(null);
    setUsernameError('');
    setIsEditing(false);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe? This action cannot be undone.')) {
      try {
        await deleteRecipe(recipeId);
        // Update local userRecipes state
        setUserRecipes(prev => prev.filter(recipe => recipe.id !== recipeId));
        showNotification('Recipe deleted successfully! 🗑️');
      } catch (error) {
        console.error('Error deleting recipe:', error);
        showNotification('Failed to delete recipe');
      }
    }
  };

  // Show ProfileSetup if profile is incomplete
  if (showProfileSetup) {
    return <ProfileSetup />;
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar */}
            <div className="w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
              <img
                src={userProfile?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName}`}
                alt="Profile"
                className="w-full h-full rounded-full object-cover"
              />
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
                {currentUser?.displayName}
              </h1>
              <p className="text-gray-600 mb-2">@{userProfile?.username}</p>
              <p className="text-gray-600 mb-4 max-w-2xl">
                {userProfile?.bio || 'No bio added yet'}
              </p>
              
              {/* Stats */}
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                <div className="text-center px-4">
                  <div className="text-xl font-bold text-gray-800">{userRecipes.length}</div>
                  <div className="text-sm text-gray-600">Recipes</div>
                </div>
                {/* Add other stats if needed */}
              </div>
            </div>

            {/* Edit Profile and Logout Buttons */}
            <div className="w-full md:w-auto flex flex-col md:flex-row gap-2">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
              <button
                onClick={async () => {
                  try {
                    await logout();
                    navigate('/login');
                  } catch (error) {
                    console.error('Failed to log out:', error);
                    showNotification('Failed to log out');
                  }
                }}
                className="w-full md:w-auto px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit Profile</h2>
              
              <form onSubmit={handleEditSubmit} className="space-y-6">
                <div className="flex justify-center">
                  <div className="relative">
                    <img
                      src={userProfile?.photoURL || `https://ui-avatars.com/api/?name=${userProfile?.displayName}`}
                      alt="Profile"
                      className="w-24 h-24 rounded-full"
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
                    value={userProfile?.displayName || ''}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Your display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username *
                  </label>
                  <input
                    type="text"
                    required
                    value={userProfile?.username || ''}
                    onChange={handleUsernameChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      usernameError ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Choose a unique username"
                  />
                  {usernameError && (
                    <p className="mt-1 text-sm text-red-600">{usernameError}</p>
                  )}
                  {isCheckingUsername && (
                    <p className="mt-1 text-sm text-gray-500">Checking username availability...</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={userProfile?.bio || ''}
                    onChange={(e) => setUserProfile(prev => ({ ...prev, bio: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Tell us about yourself"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Recipes Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-6">My Recipes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userRecipes.map(recipe => (
              <div key={recipe.id} className="relative">
                <RecipeCard recipe={recipe} />
                <div className="absolute top-2 right-2 flex gap-2">
                  <Link
                    to={`/recipe/edit/${recipe.id}`}
                    className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 shadow-md transition-colors duration-200"
                    title="Edit Recipe"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </Link>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id)}
                    className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 shadow-md transition-colors duration-200"
                    title="Delete Recipe"
                  >
                    <svg 
                      className="w-5 h-5" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                      />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {userRecipes.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl shadow-sm">
              <h3 className="text-xl text-gray-600">You haven't uploaded any recipes yet</h3>
              <p className="mt-2 text-gray-500">Share your favorite recipes with the community!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile; 