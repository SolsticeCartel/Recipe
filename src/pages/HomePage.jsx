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
      {/* ... rest of the component ... */}
    </div>
  );
}

export default HomePage; 