import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc,
  getFirestore,
  collection,
  query,
  where,
  getDocs
} from 'firebase/firestore';
import { auth } from '../config/firebase';

const db = getFirestore();
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        if (user) {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
          }
        } else {
          setUserProfile(null);
        }
      } catch (err) {
        console.error('Auth state change error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const signup = async (email, password) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create initial user document in Firestore (without username)
      const userProfile = {
        email,
        displayName: '', // Will be set during profile setup
        bio: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to Firestore
      await setDoc(doc(db, 'users', result.user.uid), userProfile);

      // Update local state
      setUserProfile(userProfile);

      return result;
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (profileData) => {
    if (!currentUser) throw new Error('No user logged in');

    const updatedProfile = {
      ...userProfile,
      ...profileData,
      username: userProfile.username, // Keep the original username
      updatedAt: new Date().toISOString()
    };

    // Update Firestore profile
    await setDoc(doc(db, 'users', currentUser.uid), updatedProfile, { merge: true });

    // Update Auth profile
    await updateProfile(currentUser, {
      displayName: profileData.displayName,
      photoURL: profileData.photoURL || currentUser.photoURL
    });

    // Update local state
    setUserProfile(updatedProfile);
  };

  const login = async (username, password) => {
    try {
      // First find the user with this username in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username.toLowerCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        throw new Error('User not found');
      }

      // Get the user's email from Firestore
      const userDoc = querySnapshot.docs[0];
      const userEmail = userDoc.data().email;

      // Now sign in with email and password
      return signInWithEmailAndPassword(auth, userEmail, password);
    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Invalid username or password');
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    currentUser,
    userProfile,
    error,
    signup,
    login,
    logout,
    updateUserProfile
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-red-600 mb-4">Authentication Error</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
} 