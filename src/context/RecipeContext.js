import { createContext, useContext, useState } from 'react';
import { db, auth } from '../config/firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, arrayUnion, getDoc, where, setDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebase';

const RecipeContext = createContext();

export function RecipeProvider({ children }) {
  const [recipes, setRecipes] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const { currentUser } = useAuth();

  const uploadImage = async (file, path) => {
    if (!file) return null;
    try {
      const storageRef = ref(storage, path);
      const uploadResult = await uploadBytes(storageRef, file);
      return await getDownloadURL(uploadResult.ref);
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image');
    }
  };

  const addRecipe = async (newRecipe) => {
    try {
      if (!currentUser) throw new Error('Must be logged in to add recipe');

      // Ensure instructions is an array
      const instructions = Array.isArray(newRecipe.instructions) 
        ? newRecipe.instructions 
        : newRecipe.instructions.split('\n').filter(line => line.trim());

      const recipeData = {
        ...newRecipe,
        instructions, // Use the processed instructions
        authorId: currentUser.uid,
        author: {
          id: currentUser.uid,
          name: currentUser.displayName || 'Anonymous',
          avatar: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}`
        },
        rating: 0,
        reviews: 0,
        createdAt: new Date().toISOString(),
        userReviews: []
      };

      const docRef = await addDoc(collection(db, 'recipes'), recipeData);
      const recipeWithId = { ...recipeData, id: docRef.id };
      setRecipes(prevRecipes => [recipeWithId, ...prevRecipes]);
      setSearchResults(prevResults => [recipeWithId, ...prevResults]);
      return recipeWithId;
    } catch (error) {
      console.error('Error adding recipe:', error);
      throw error;
    }
  };

  // Fetch recipes from Firestore
  const fetchRecipes = async () => {
    try {
      const q = query(collection(db, 'recipes'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedRecipes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setRecipes(fetchedRecipes);
      setSearchResults(fetchedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };

  const addReview = async (recipeId, review) => {
    try {
      if (!currentUser) throw new Error('Must be logged in to review');

      // Check if user profile is complete
      const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
      if (!userDoc.exists()) {
        throw new Error('Profile not found');
      }
      
      const userData = userDoc.data();
      if (!userData.username || !userData.displayName) {
        throw new Error('Please complete your profile before adding reviews');
      }

      const recipeRef = doc(db, 'recipes', recipeId);
      const recipeDoc = await getDoc(recipeRef);
      
      if (!recipeDoc.exists()) {
        throw new Error('Recipe not found');
      }

      const recipeData = recipeDoc.data();
      const newReview = {
        id: Date.now().toString(),
        user: currentUser.displayName,
        userId: currentUser.uid,
        avatar: currentUser.photoURL || `https://ui-avatars.com/api/?name=${currentUser.displayName}`,
        rating: review.rating,
        comment: review.comment,
        date: new Date().toISOString().split('T')[0]
      };

      // Calculate new average rating
      const totalRatings = (recipeData.userReviews?.length || 0) + 1;
      const currentTotalRating = (recipeData.rating || 0) * (recipeData.userReviews?.length || 0);
      const newRating = (currentTotalRating + review.rating) / totalRatings;

      // Update recipe document
      await updateDoc(recipeRef, {
        rating: parseFloat(newRating.toFixed(1)),
        reviews: totalRatings,
        userReviews: arrayUnion(newReview)
      });

      // Update local state
      setRecipes(prevRecipes => 
        prevRecipes.map(recipe => {
          if (recipe.id === recipeId) {
            return {
              ...recipe,
              rating: parseFloat(newRating.toFixed(1)),
              reviews: totalRatings,
              userReviews: [...(recipe.userReviews || []), newReview]
            };
          }
          return recipe;
        })
      );

      setSearchResults(prevResults => 
        prevResults.map(recipe => {
          if (recipe.id === recipeId) {
            return {
              ...recipe,
              rating: parseFloat(newRating.toFixed(1)),
              reviews: totalRatings,
              userReviews: [...(recipe.userReviews || []), newReview]
            };
          }
          return recipe;
        })
      );

      return newReview;
    } catch (error) {
      console.error('Error adding review:', error);
      throw error;
    }
  };

  const getUserRecipes = async (userId) => {
    try {
      const recipesRef = collection(db, 'recipes');
      const q = query(
        recipesRef,
        where('authorId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const userRecipes = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return userRecipes;
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      throw error;
    }
  };

  const checkUsernameAvailability = async (username, currentUsername = null) => {
    try {
      // If checking current user's username, return true (available)
      if (username === currentUsername) {
        return true;
      }

      const q = query(
        collection(db, 'users'),
        where('username', '==', username.toLowerCase())
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.empty; // Returns true if username is available
    } catch (error) {
      console.error('Error checking username:', error);
      throw error;
    }
  };

  const updateRecipe = async (recipeId, updatedRecipe) => {
    try {
      // Ensure instructions is an array
      const instructions = Array.isArray(updatedRecipe.instructions)
        ? updatedRecipe.instructions
        : updatedRecipe.instructions.split('\n').filter(line => line.trim());

      const recipeToUpdate = {
        ...updatedRecipe,
        instructions,
        updatedAt: new Date().toISOString()
      };

      await setDoc(doc(db, 'recipes', recipeId), recipeToUpdate);
      
      // Update local state
      setRecipes(prev => prev.map(recipe => 
        recipe.id === recipeId ? { ...recipe, ...recipeToUpdate } : recipe
      ));
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  };

  const getRecipeById = async (recipeId) => {
    try {
      const recipeDoc = await getDoc(doc(db, 'recipes', recipeId));
      if (!recipeDoc.exists()) {
        throw new Error('Recipe not found');
      }
      return {
        id: recipeDoc.id,
        ...recipeDoc.data()
      };
    } catch (error) {
      console.error('Error getting recipe:', error);
      throw error;
    }
  };

  const deleteRecipe = async (recipeId) => {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'recipes', recipeId));
      
      // Update local state
      setRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
      setSearchResults(prevResults => prevResults.filter(recipe => recipe.id !== recipeId));
      
      return true;
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  };

  const value = {
    recipes,
    searchResults,
    setSearchResults,
    addRecipe,
    fetchRecipes,
    addReview,
    getUserRecipes,
    checkUsernameAvailability,
    updateRecipe,
    getRecipeById,
    deleteRecipe
  };

  return (
    <RecipeContext.Provider value={value}>
      {children}
    </RecipeContext.Provider>
  );
}

export function useRecipes() {
  return useContext(RecipeContext);
} 