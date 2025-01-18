import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecipes } from '../context/RecipeContext';
import { useNotification } from '../context/NotificationContext';
import { uploadToPlaybook } from '../config/playbook';

function UploadRecipe() {
  const navigate = useNavigate();
  const { addRecipe } = useRecipes();
  const { showNotification } = useNotification();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    cookingTime: '',
    difficulty: 'Medium',
    image: '',
    ingredients: ['', '', '', '', ''],
    instructions: ['', '', '', '', '']
  });
  const [error, setError] = useState('');

  const validateForm = () => {
    if (formData.title.trim().length < 5) {
      setError('Recipe title must be at least 5 characters long');
      return false;
    }

    const validIngredients = formData.ingredients.filter(item => item.trim() !== '');
    if (validIngredients.length < 5) {
      setError('Please add at least 5 ingredients');
      return false;
    }

    const validInstructions = formData.instructions.filter(item => item.trim() !== '');
    if (validInstructions.length < 5) {
      setError('Please add at least 5 cooking instructions');
      return false;
    }

    if (!formData.cookingTime.trim() || isNaN(formData.cookingTime)) {
      setError('Please enter a valid cooking time in minutes');
      return false;
    }

    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const addIngredient = () => {
    setFormData({ ...formData, ingredients: [...formData.ingredients, ''] });
  };

  const handleInstructionChange = (index, value) => {
    const newInstructions = [...formData.instructions];
    newInstructions[index] = value;
    setFormData({ ...formData, instructions: newInstructions });
  };

  const addInstruction = () => {
    setFormData({ ...formData, instructions: [...formData.instructions, ''] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    try {
      const imageFile = document.querySelector('input[type="file"]').files[0];
      let imageUrl = null;

      if (imageFile) {
        try {
          imageUrl = await uploadToPlaybook(imageFile);
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          setError('Failed to upload image');
          return;
        }
      }

      const cleanedData = {
        ...formData,
        cookingTime: `${formData.cookingTime} min`,
        ingredients: formData.ingredients.filter(item => item.trim() !== ''),
        instructions: formData.instructions.filter(item => item.trim() !== ''),
        image: imageUrl
      };
      
      await addRecipe(cleanedData);
      showNotification("Yumm! Recipe uploaded successfully! 😋");
      navigate('/');
    } catch (err) {
      setError('Failed to upload recipe: ' + err.message);
    }
  };

  return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Upload New Recipe</h1>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter recipe title (min. 5 characters)"
              minLength={5}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cooking Time (minutes) *
            </label>
            <input
              type="number"
              value={formData.cookingTime}
              onChange={(e) => setFormData({ ...formData, cookingTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter cooking time in minutes"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipe Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              <div className="space-y-1 text-center">
                {formData.image ? (
                  <div className="mb-4">
                    <img
                      src={formData.image}
                      alt="Recipe preview"
                      className="mx-auto h-32 w-auto"
                    />
                  </div>
                ) : (
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
                <div className="flex text-sm text-gray-600">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
          </div>

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
                {formData.ingredients.map((ingredient, index) => (
                  <input
                    key={index}
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder={`Ingredient ${index + 1}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required={index < 5}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={addIngredient}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                + Add another ingredient
              </button>
            </div>
          </div>

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
                {formData.instructions.map((instruction, index) => (
                  <input
                    key={index}
                    type="text"
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    placeholder={`Step ${index + 1}`}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                    required={index < 5}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={addInstruction}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                + Add another step
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-1">
              Difficulty
            </label>
            <select
              id="difficulty"
              value={formData.difficulty}
              onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Upload Recipe
          </button>
        </form>
      </div>
  );
}

export default UploadRecipe; 