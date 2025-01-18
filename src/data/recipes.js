export const recipes = [];

export const categories = [
  "All",
  "Breakfast",
  "Lunch",
  "Dinner",
  "Desserts",
  "Vegetarian",
  "Quick Meals"
];

export const getRecipeById = (id) => {
  return recipes.find(recipe => recipe.id === id);
};

export const getRecipesByCategory = (category) => {
  if (category === "All") return recipes;
  return recipes.filter(recipe => recipe.category === category);
}; 