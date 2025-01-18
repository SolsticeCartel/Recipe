import RecipeCard from '../components/RecipeCard';
import { recipes, categories } from '../data/recipes';
import { useState } from 'react';

function HomePage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filteredRecipes, setFilteredRecipes] = useState(recipes);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setFilteredRecipes(getRecipesByCategory(category));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Discover Delicious Recipes
        </h1>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Explore our collection of mouth-watering recipes shared by home chefs from around the world
        </p>
      </div>

      {/* Featured Categories */}
      <div className="flex overflow-x-auto gap-4 mb-8 pb-4">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => handleCategoryChange(category)}
            className={`px-6 py-2 rounded-full shadow-sm whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Recipe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-600">No recipes found in this category.</p>
          </div>
        )}
      </div>

      {/* Load More Button */}
      <div className="text-center mt-12">
        <button className="bg-blue-600 text-white px-8 py-3 rounded-md hover:bg-blue-700 transition-colors duration-200">
          Load More Recipes
        </button>
      </div>
    </div>
  );
}

export default HomePage; 