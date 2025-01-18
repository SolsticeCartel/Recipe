import { useParams, Link } from 'react-router-dom';
import { useRecipes } from '../context/RecipeContext';
import { useState, useEffect } from 'react';
import { db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import ReviewForm from '../components/ReviewForm';
import cookingIcon from '../assets/cooking-7-128.png';

function RecipeDetails() {
  const { id } = useParams();
  const { recipes, addReview } = useRecipes();
  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewError, setReviewError] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        // First check if recipe exists in context
        const existingRecipe = recipes.find(r => r.id === id);
        if (existingRecipe) {
          setRecipe(existingRecipe);
          setIsLoading(false);
          return;
        }

        // If not in context, fetch from Firestore
        const recipeRef = doc(db, 'recipes', id);
        const recipeDoc = await getDoc(recipeRef);

        if (recipeDoc.exists()) {
          setRecipe({
            id: recipeDoc.id,
            ...recipeDoc.data()
          });
        } else {
          setError('Recipe not found');
        }
      } catch (err) {
        setError('Error loading recipe: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipe();
  }, [id, recipes]);

  const handleReviewSubmit = async (review) => {
    try {
      setReviewError('');
      await addReview(id, review);
      
      // Refresh the recipe data after adding review
      const recipeRef = doc(db, 'recipes', id);
      const recipeDoc = await getDoc(recipeRef);
      if (recipeDoc.exists()) {
        setRecipe({
          id: recipeDoc.id,
          ...recipeDoc.data()
        });
      }
    } catch (err) {
      setReviewError(err.message);
    }
  };

  const parseInstructions = (instructions) => {
    if (Array.isArray(instructions)) {
      return instructions;
    }
    if (typeof instructions === 'string') {
      return instructions.split('\n').filter(line => line.trim());
    }
    return [];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="animate-pulse">
          <div className="h-[400px] bg-gray-200 rounded-xl mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="bg-white rounded-xl p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-16 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">
            {error || 'Recipe not found'}
          </h2>
          <Link to="/" className="mt-4 inline-block text-blue-600 hover:text-blue-700">
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Recipe Header */}
      <div className="mb-8">
        <div className="relative h-[400px] rounded-xl overflow-hidden mb-6">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <img 
                src={cookingIcon}
                alt="Cooking icon"
                className="w-64 h-64 object-contain"
              />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{recipe.title}</h1>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center">
                <img
                  src={recipe.author.avatar}
                  alt={recipe.author.name}
                  className="w-8 h-8 rounded-full mr-2"
                />
                <span>by {recipe.author.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, index) => (
                    <svg
                      key={index}
                      className={`w-5 h-5 ${
                        index < recipe.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span>({recipe.reviews} reviews)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recipe Meta Info */}
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center px-4 py-2 bg-white rounded-lg shadow-sm">
            <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-gray-700">{recipe.cookingTime}</span>
          </div>
          <div className={`px-4 py-2 rounded-lg shadow-sm ${
            recipe.difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
            recipe.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {recipe.difficulty}
          </div>
        </div>
      </div>

      {/* Recipe Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Ingredients */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ingredients</h2>
            <ul className="space-y-3">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg 
                    className="w-5 h-5 mt-1 flex-shrink-0 text-green-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth="2" 
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span className="text-gray-700">{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Instructions */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Instructions</h2>
            <ol className="space-y-6">
              {parseInstructions(recipe.instructions).map((instruction, index) => (
                <li key={index} className="flex">
                  <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 text-blue-800 font-bold mr-4">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 mt-1">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Reviews</h2>
        
        {reviewError && (
          <div className="mb-4 text-sm text-red-600 bg-red-100 p-3 rounded">
            {reviewError}
          </div>
        )}

        {/* Add Review Form */}
        <div className="mb-8">
          <ReviewForm onSubmit={handleReviewSubmit} />
        </div>

        {/* Existing Reviews */}
        <div className="space-y-6">
          {recipe.userReviews?.map((review) => (
            <div key={review.id} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <img
                    src={review.avatar}
                    alt={review.user}
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-800">{review.user}</h3>
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, index) => (
                        <svg
                          key={index}
                          className={`w-4 h-4 ${
                            index < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-gray-500 text-sm">{review.date}</span>
              </div>
              <p className="text-gray-700">{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RecipeDetails; 