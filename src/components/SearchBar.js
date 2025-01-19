import { useState, useEffect, useRef } from 'react';
import { useRecipes } from '../context/RecipeContext';
import { useNavigate } from 'react-router-dom';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { recipes, setSearchResults } = useRecipes();
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter recipes based on search term
  const getFilteredSuggestions = () => {
    if (!searchTerm) return [];
    
    return recipes.filter(recipe => {
      const searchLower = searchTerm.toLowerCase();
      return recipe.title.toLowerCase().includes(searchLower);
    }).slice(0, 5); // Limit to 5 suggestions
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const filteredRecipes = getFilteredSuggestions();
    setSearchResults(filteredRecipes);
    setIsOpen(false);
    navigate('/');
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(value.length > 0);
    
    // Update search results in real-time
    const filteredRecipes = value ? getFilteredSuggestions() : recipes;
    setSearchResults(filteredRecipes);
  };

  const handleSuggestionClick = (recipe) => {
    navigate(`/recipe/${recipe.id}`);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-xl">
      <form onSubmit={handleSearch} className="relative">
        <div className="relative flex items-center">
          {/* Search Icon on the left */}
          <div className="absolute left-3 text-gray-500">
            <svg 
              className="w-5 h-5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
              />
            </svg>
          </div>

          {/* Search Input with left padding for icon */}
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder="Search recipes..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </form>

      {/* Search Suggestions */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200">
          <ul className="py-2">
            {getFilteredSuggestions().map((recipe) => (
              <li
                key={recipe.id}
                onClick={() => handleSuggestionClick(recipe)}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <div className="flex items-center">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-10 h-10 rounded object-cover mr-3"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-800">
                      {recipe.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {recipe.cookingTime} • {recipe.difficulty}
                    </div>
                  </div>
                </div>
              </li>
            ))}
            {getFilteredSuggestions().length === 0 && (
              <li className="px-4 py-2 text-sm text-gray-500">
                No recipes found
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default SearchBar; 