import React from 'react';
import { Link } from 'react-router-dom';

function RecipeCard({ recipe }) {
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/400x300?text=Recipe+Image';
  };

  return (
    <Link to={`/recipe/${recipe.id}`} className="block">
      <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer">
        <div className="relative">
          <img 
            src={recipe.image} 
            alt={recipe.title}
            onError={handleImageError}
            className="w-full h-48 object-cover"
          />
          {/* ... rest of the component */}
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard; 