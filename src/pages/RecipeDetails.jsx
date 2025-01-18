import { useParams, Link } from 'react-router-dom';
import { getRecipeById } from '../data/recipes';
import { useEffect, useState } from 'react';

function RecipeDetails() {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const recipe = getRecipeById(id);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading recipe...</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Recipe not found</h2>
          <p className="text-gray-600 mt-2">The recipe you're looking for doesn't exist.</p>
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
          <img
            src={recipe.image}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
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
                <span className="flex items-center">
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
                </span>
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
          <div className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg shadow-sm">
            {recipe.category}
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
                <li key={index} className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 mr-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                  {ingredient}
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
              {recipe.instructions.map((instruction, index) => (
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
        <div className="space-y-6">
          {recipe.userReviews.map((review) => (
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