import React, { useState } from 'react';
import RecipeViewer from './RecipeViewer.jsx';
import './RecipeViewerExample.css';

/**
 * RecipeViewerExample Component
 * Demonstrates the RecipeViewer component with sample data
 * This file can be used for manual testing and demonstration
 */
const RecipeViewerExample = () => {
  const [mode, setMode] = useState('view');

  // Sample recipe data
  const sampleRecipe = {
    id: '1',
    productId: '101',
    productName: 'Caramel Macchiato',
    ingredients: [
      {
        ingredientId: '1',
        ingredientName: 'Espresso',
        quantity: 2,
        unit: 'shots'
      },
      {
        ingredientId: '2',
        ingredientName: 'Steamed Milk',
        quantity: 240,
        unit: 'ml'
      },
      {
        ingredientId: '3',
        ingredientName: 'Vanilla Syrup',
        quantity: 15,
        unit: 'ml'
      },
      {
        ingredientId: '4',
        ingredientName: 'Caramel Sauce',
        quantity: 10,
        unit: 'ml'
      },
      {
        ingredientId: '5',
        ingredientName: 'Milk Foam',
        quantity: 30,
        unit: 'ml'
      }
    ],
    instructions: 'Step 1: Pull 2 shots of espresso into a cup.\nStep 2: Add vanilla syrup to the espresso and stir.\nStep 3: Steam milk to 65°C (150°F).\nStep 4: Pour steamed milk over the espresso mixture.\nStep 5: Top with milk foam.\nStep 6: Drizzle caramel sauce in a crosshatch pattern over the foam.\nStep 7: Serve immediately.',
    prepTime: 5
  };

  const emptyRecipe = {
    productName: 'Simple Product',
    ingredients: [],
    instructions: '',
    prepTime: null
  };

  const [currentRecipe, setCurrentRecipe] = useState(sampleRecipe);

  return (
    <div className="recipe-viewer-example">
      <div className="example-header">
        <h1>RecipeViewer Component Example</h1>
        <p>Demonstrates recipe display for baristas</p>
      </div>

      <div className="example-controls">
        <div className="control-group">
          <label>Display Mode:</label>
          <div className="button-group">
            <button
              className={mode === 'view' ? 'active' : ''}
              onClick={() => setMode('view')}
            >
              View Mode (Full)
            </button>
            <button
              className={mode === 'compact' ? 'active' : ''}
              onClick={() => setMode('compact')}
            >
              Compact Mode
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>Sample Data:</label>
          <div className="button-group">
            <button
              className={currentRecipe === sampleRecipe ? 'active' : ''}
              onClick={() => setCurrentRecipe(sampleRecipe)}
            >
              Full Recipe
            </button>
            <button
              className={currentRecipe === emptyRecipe ? 'active' : ''}
              onClick={() => setCurrentRecipe(emptyRecipe)}
            >
              Empty Recipe
            </button>
            <button
              className={currentRecipe === null ? 'active' : ''}
              onClick={() => setCurrentRecipe(null)}
            >
              No Recipe
            </button>
          </div>
        </div>
      </div>

      <div className="example-preview">
        <h2>Preview</h2>
        <div className="preview-container">
          <RecipeViewer recipe={currentRecipe} mode={mode} />
        </div>
      </div>

      <div className="example-info">
        <h2>Component Features</h2>
        <ul>
          <li>✅ Displays ingredients list with quantities</li>
          <li>✅ Shows preparation instructions (in view mode)</li>
          <li>✅ Displays preparation time</li>
          <li>✅ Supports both view and compact modes</li>
          <li>✅ Formatted for easy reading during preparation</li>
          <li>✅ Responsive design for different screen sizes</li>
          <li>✅ Print-friendly styles</li>
          <li>✅ Follows Visual Design System</li>
        </ul>
      </div>
    </div>
  );
};

export default RecipeViewerExample;
