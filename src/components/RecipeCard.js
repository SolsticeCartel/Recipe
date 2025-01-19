import { Link } from 'react-router-dom';
import cookingIcon from '../assets/cooking-7-128.png';

function RecipeCard({ recipe }) {
  const handleImageError = (e) => {
    e.target.src = cookingIcon;
  };

  return (
    <Link to={`/recipe/${recipe.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="relative">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              onError={handleImageError}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
              <img
                src={cookingIcon}
                alt="Cooking icon"
                className="w-32 h-32 object-contain"
              />
            </div>
          )}
          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-1">{recipe.title}</h3>
            <div className="flex items-center mb-2">
              <img
                src={recipe.author?.avatar || `https://ui-avatars.com/api/?name=${recipe.author?.name}`}
                alt={recipe.author?.name}
                className="w-6 h-6 rounded-full mr-2"
              />
              <span className="text-sm text-gray-600">
                {recipe.author?.name || 'Anonymous'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-yellow-400">★</span>
                <span className="text-gray-600 ml-1">{recipe.rating || '0'}</span>
              </div>
              <span className="text-gray-500 text-sm">{recipe.cookingTime}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard; 