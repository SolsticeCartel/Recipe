import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useRecipes } from '../context/RecipeContext';
import { useNotification } from '../context/NotificationContext';
import { uploadToPlaybook } from '../config/playbook';

function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { updateRecipe, getRecipeById } = useRecipes();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recipe, setRecipe] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    ingredients: '',
    instructions: '',
    difficulty: '',
    cookingTime: ''
  });

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const recipeData = await getRecipeById(id);
        
        if (recipeData.authorId !== currentUser?.uid) {
          navigate('/');
          showNotification('You can only edit your own recipes');
          return;
        }

        setRecipe(recipeData);
        setFormData({
          title: recipeData.title,
          ingredients: recipeData.ingredients.join('\n'),
          instructions: Array.isArray(recipeData.instructions) 
            ? recipeData.instructions.join('\n')
            : recipeData.instructions,
          difficulty: recipeData.difficulty,
          cookingTime: recipeData.cookingTime
        });
        setImagePreview(recipeData.image);
      } catch (err) {
        setError('Failed to load recipe');
        console.error('Error fetching recipe:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, currentUser, navigate, showNotification, getRecipeById]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = recipe.image;

      if (imageFile) {
        try {
          imageUrl = await uploadToPlaybook(imageFile);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          showNotification('Failed to upload image');
          return;
        }
      }

      const updatedRecipe = {
        ...recipe,
        title: formData.title,
        ingredients: formData.ingredients.split('\n').filter(i => i.trim()),
        instructions: formData.instructions.split('\n').filter(i => i.trim()),
        difficulty: formData.difficulty,
        cookingTime: formData.cookingTime,
        image: imageUrl,
        updatedAt: new Date().toISOString()
      };

      await updateRecipe(id, updatedRecipe);
      showNotification('Recipe updated successfully! 🎉');
      navigate(`/recipe/${id}`);
    } catch (error) {
      console.error('Error updating recipe:', error);
      showNotification('Failed to update recipe');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded-lg mb-4"></div>
            <div className="h-10 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded mb-4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Recipe</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Image
              </label>
              <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 transition-colors">
                {imagePreview ? (
                  <div className="relative w-full h-64 mb-4">
                    <img
                      src={imagePreview}
                      alt="Recipe preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('');
                        setImageFile(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <p className="mt-1 text-sm text-gray-500">Click to upload or drag and drop</p>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageChange}
                  id="recipe-image"
                />
                <label
                  htmlFor="recipe-image"
                  className="mt-4 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
                >
                  Select Image
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipe Title
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Cooking Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cooking Time
              </label>
              <input
                type="text"
                value={formData.cookingTime}
                onChange={(e) => setFormData(prev => ({ ...prev, cookingTime: e.target.value }))}
                placeholder="e.g., 30 minutes"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select difficulty</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ingredients
              </label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Add at least 5 ingredients</p>
                  <p className="text-xs text-gray-500">Format: quantity + ingredient (e.g., "1 cup flour")</p>
                </div>
                <div className="space-y-2">
                  {formData.ingredients.split('\n').map((ingredient, index) => (
                    <input
                      key={index}
                      type="text"
                      value={ingredient}
                      onChange={(e) => {
                        const newIngredients = formData.ingredients.split('\n');
                        newIngredients[index] = e.target.value;
                        setFormData(prev => ({ ...prev, ingredients: newIngredients.join('\n') }));
                      }}
                      placeholder={`Ingredient ${index + 1}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                      required={index < 5}
                    />
                  ))}
                  {formData.ingredients.split('\n').length < 5 && [...Array(5 - formData.ingredients.split('\n').length)].map((_, i) => (
                    <input
                      key={`empty-${i}`}
                      type="text"
                      placeholder={`Ingredient ${formData.ingredients.split('\n').length + i + 1}`}
                      onChange={(e) => {
                        const newIngredients = formData.ingredients.split('\n');
                        newIngredients.push(e.target.value);
                        setFormData(prev => ({ ...prev, ingredients: newIngredients.join('\n') }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                      required
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ 
                      ...prev, 
                      ingredients: prev.ingredients + '\n' 
                    }));
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add another ingredient
                </button>
              </div>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instructions
              </label>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="mb-2">
                  <p className="text-sm text-gray-600">Add at least 5 steps</p>
                  <p className="text-xs text-gray-500">Be clear and specific with each instruction</p>
                </div>
                <div className="space-y-2">
                  {formData.instructions.split('\n').map((instruction, index) => (
                    <input
                      key={index}
                      type="text"
                      value={instruction}
                      onChange={(e) => {
                        const newInstructions = formData.instructions.split('\n');
                        newInstructions[index] = e.target.value;
                        setFormData(prev => ({ ...prev, instructions: newInstructions.join('\n') }));
                      }}
                      placeholder={`Step ${index + 1}`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                      required={index < 5}
                    />
                  ))}
                  {formData.instructions.split('\n').length < 5 && [...Array(5 - formData.instructions.split('\n').length)].map((_, i) => (
                    <input
                      key={`empty-${i}`}
                      type="text"
                      placeholder={`Step ${formData.instructions.split('\n').length + i + 1}`}
                      onChange={(e) => {
                        const newInstructions = formData.instructions.split('\n');
                        newInstructions.push(e.target.value);
                        setFormData(prev => ({ ...prev, instructions: newInstructions.join('\n') }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                      required
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ 
                      ...prev, 
                      instructions: prev.instructions + '\n' 
                    }));
                  }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  + Add another step
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => navigate(`/recipe/${id}`)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditRecipe; 