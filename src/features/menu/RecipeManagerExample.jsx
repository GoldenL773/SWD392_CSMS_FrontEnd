import React, { useState } from 'react';
import RecipeManager from './RecipeManager.jsx';
import './RecipeManagerExample.css';

/**
 * RecipeManagerExample Component
 * Demonstrates the usage of RecipeManager component with mock data
 * 
 * This example shows:
 * - Recipe list with search and filter
 * - Create new recipe
 * - Edit existing recipe
 * - Delete recipe with confirmation
 * - Ingredient management
 * - Instructions and prep time
 */
const RecipeManagerExample = () => {
  // Mock data for products
  const mockProducts = [
    { id: 1, name: 'Espresso', category: 'Coffee' },
    { id: 2, name: 'Cappuccino', category: 'Coffee' },
    { id: 3, name: 'Latte', category: 'Coffee' },
    { id: 4, name: 'Green Tea', category: 'Tea' },
    { id: 5, name: 'Tiramisu', category: 'Cake' },
    { id: 6, name: 'Croissant', category: 'Pastry' },
    { id: 7, name: 'Iced Americano', category: 'Coffee' },
    { id: 8, name: 'Matcha Latte', category: 'Tea' }
  ];

  // Mock data for ingredients
  const mockIngredients = [
    { id: 1, name: 'Coffee Beans' },
    { id: 2, name: 'Milk' },
    { id: 3, name: 'Sugar' },
    { id: 4, name: 'Water' },
    { id: 5, name: 'Espresso Shot' },
    { id: 6, name: 'Vanilla Syrup' },
    { id: 7, name: 'Cocoa Powder' },
    { id: 8, name: 'Whipped Cream' },
    { id: 9, name: 'Green Tea Leaves' },
    { id: 10, name: 'Matcha Powder' },
    { id: 11, name: 'Mascarpone Cheese' },
    { id: 12, name: 'Ladyfinger Biscuits' },
    { id: 13, name: 'Butter' },
    { id: 14, name: 'Flour' },
    { id: 15, name: 'Ice' }
  ];

  // Mock recipes state
  const [recipes, setRecipes] = useState([
    {
      id: 1,
      productId: 1,
      productName: 'Espresso',
      category: 'Coffee',
      ingredients: [
        { id: 1, ingredientId: 1, ingredientName: 'Coffee Beans', quantity: 18, unit: 'grams' },
        { id: 2, ingredientId: 4, ingredientName: 'Water', quantity: 30, unit: 'ml' }
      ],
      instructions: '1. Grind 18g of coffee beans to fine consistency\n2. Tamp the grounds evenly in the portafilter\n3. Extract for 25-30 seconds\n4. Serve immediately in a preheated cup',
      prepTime: 3
    },
    {
      id: 2,
      productId: 2,
      productName: 'Cappuccino',
      category: 'Coffee',
      ingredients: [
        { id: 3, ingredientId: 5, ingredientName: 'Espresso Shot', quantity: 1, unit: 'shot' },
        { id: 4, ingredientId: 2, ingredientName: 'Milk', quantity: 150, unit: 'ml' },
        { id: 5, ingredientId: 7, ingredientName: 'Cocoa Powder', quantity: 1, unit: 'grams' }
      ],
      instructions: '1. Prepare one shot of espresso\n2. Steam milk to 65°C with microfoam\n3. Pour steamed milk over espresso\n4. Dust with cocoa powder',
      prepTime: 5
    },
    {
      id: 3,
      productId: 3,
      productName: 'Latte',
      category: 'Coffee',
      ingredients: [
        { id: 6, ingredientId: 5, ingredientName: 'Espresso Shot', quantity: 2, unit: 'shots' },
        { id: 7, ingredientId: 2, ingredientName: 'Milk', quantity: 250, unit: 'ml' },
        { id: 8, ingredientId: 6, ingredientName: 'Vanilla Syrup', quantity: 15, unit: 'ml' }
      ],
      instructions: '1. Prepare two shots of espresso\n2. Add vanilla syrup to the cup\n3. Steam milk to 65°C\n4. Pour milk over espresso creating latte art',
      prepTime: 5
    },
    {
      id: 4,
      productId: 5,
      productName: 'Tiramisu',
      category: 'Cake',
      ingredients: [
        { id: 9, ingredientId: 11, ingredientName: 'Mascarpone Cheese', quantity: 250, unit: 'grams' },
        { id: 10, ingredientId: 12, ingredientName: 'Ladyfinger Biscuits', quantity: 200, unit: 'grams' },
        { id: 11, ingredientId: 5, ingredientName: 'Espresso Shot', quantity: 4, unit: 'shots' },
        { id: 12, ingredientId: 7, ingredientName: 'Cocoa Powder', quantity: 10, unit: 'grams' },
        { id: 13, ingredientId: 3, ingredientName: 'Sugar', quantity: 50, unit: 'grams' }
      ],
      instructions: '1. Prepare espresso and let it cool\n2. Mix mascarpone with sugar\n3. Dip ladyfingers in espresso\n4. Layer biscuits and mascarpone mixture\n5. Refrigerate for 4 hours\n6. Dust with cocoa powder before serving',
      prepTime: 20
    },
    {
      id: 5,
      productId: 7,
      productName: 'Iced Americano',
      category: 'Coffee',
      ingredients: [
        { id: 14, ingredientId: 5, ingredientName: 'Espresso Shot', quantity: 2, unit: 'shots' },
        { id: 15, ingredientId: 4, ingredientName: 'Water', quantity: 200, unit: 'ml' },
        { id: 16, ingredientId: 15, ingredientName: 'Ice', quantity: 150, unit: 'grams' }
      ],
      instructions: '1. Fill glass with ice\n2. Prepare two shots of espresso\n3. Pour espresso over ice\n4. Add cold water\n5. Stir gently and serve',
      prepTime: 4
    }
  ]);

  const [loading, setLoading] = useState(false);

  // Handler for creating a new recipe
  const handleCreateRecipe = (recipeData) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const selectedProduct = mockProducts.find(p => p.id === recipeData.productId);
      
      const newRecipe = {
        id: recipes.length + 1,
        ...recipeData,
        productName: selectedProduct?.name || 'Unknown Product',
        category: selectedProduct?.category || 'Other',
        ingredients: recipeData.ingredients.map((ing, index) => {
          const ingredient = mockIngredients.find(i => i.id === ing.ingredientId);
          return {
            id: recipes.length * 10 + index + 1,
            ...ing,
            ingredientName: ingredient?.name || 'Unknown Ingredient'
          };
        })
      };

      setRecipes([...recipes, newRecipe]);
      setLoading(false);
      
      console.log('Recipe created:', newRecipe);
      alert(`Recipe for "${newRecipe.productName}" created successfully!`);
    }, 1000);
  };

  // Handler for updating an existing recipe
  const handleUpdateRecipe = (recipeId, recipeData) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const updatedRecipes = recipes.map(recipe => {
        if (recipe.id === recipeId) {
          return {
            ...recipe,
            ...recipeData,
            ingredients: recipeData.ingredients.map((ing, index) => {
              const ingredient = mockIngredients.find(i => i.id === ing.ingredientId);
              return {
                id: recipe.id * 10 + index + 1,
                ...ing,
                ingredientName: ingredient?.name || 'Unknown Ingredient'
              };
            })
          };
        }
        return recipe;
      });

      setRecipes(updatedRecipes);
      setLoading(false);
      
      const updatedRecipe = updatedRecipes.find(r => r.id === recipeId);
      console.log('Recipe updated:', updatedRecipe);
      alert(`Recipe for "${updatedRecipe.productName}" updated successfully!`);
    }, 1000);
  };

  // Handler for deleting a recipe
  const handleDeleteRecipe = (recipeId) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const recipeToDelete = recipes.find(r => r.id === recipeId);
      const filteredRecipes = recipes.filter(recipe => recipe.id !== recipeId);
      
      setRecipes(filteredRecipes);
      setLoading(false);
      
      console.log('Recipe deleted:', recipeToDelete);
      alert(`Recipe for "${recipeToDelete.productName}" deleted successfully!`);
    }, 1000);
  };

  return (
    <div className="recipe-manager-example">
      <div className="example-header">
        <h1>Recipe Manager Example</h1>
        <p className="example-description">
          This example demonstrates the RecipeManager component with full CRUD functionality.
          Try creating, editing, and deleting recipes!
        </p>
      </div>

      <div className="example-stats">
        <div className="stat-card">
          <div className="stat-value">{recipes.length}</div>
          <div className="stat-label">Total Recipes</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{mockProducts.length}</div>
          <div className="stat-label">Available Products</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{mockIngredients.length}</div>
          <div className="stat-label">Available Ingredients</div>
        </div>
      </div>

      <RecipeManager
        recipes={recipes}
        ingredients={mockIngredients}
        products={mockProducts}
        onCreateRecipe={handleCreateRecipe}
        onUpdateRecipe={handleUpdateRecipe}
        onDeleteRecipe={handleDeleteRecipe}
        loading={loading}
      />

      <div className="example-footer">
        <h3>Features Demonstrated:</h3>
        <ul>
          <li>✓ Recipe list with search functionality</li>
          <li>✓ Filter recipes by category</li>
          <li>✓ Create new recipes with product selector</li>
          <li>✓ Add multiple ingredients with quantities and units</li>
          <li>✓ Edit existing recipes</li>
          <li>✓ Delete recipes with confirmation</li>
          <li>✓ Preparation instructions editor</li>
          <li>✓ Preparation time input</li>
          <li>✓ Responsive design for mobile devices</li>
          <li>✓ Form validation</li>
        </ul>
      </div>
    </div>
  );
};

export default RecipeManagerExample;
