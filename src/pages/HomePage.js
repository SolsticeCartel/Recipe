import { useEffect } from 'react';
import { useRecipes } from '../context/RecipeContext';
import RecipeCard from '../components/RecipeCard';

function HomePage() {
  const { recipes, fetchRecipes, searchResults } = useRecipes();

  // Load recipes when component mounts
  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return (
    <div>
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">
            Discover & Share Amazing Recipes
          </h1>
          <p className="text-xl">
            Join our community of food lovers and share your favorite recipes
          </p>
        </div>
      </div>

      {/* Recipes Grid */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="inline-block text-2xl font-bold text-gray-800 mb-8 pb-1 border-b-2 border-blue-600">Latest Recipes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>

        {searchResults.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-600">No recipes found</h3>
            <p className="mt-2 text-gray-500">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage; 