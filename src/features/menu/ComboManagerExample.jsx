import React, { useState } from 'react';
import ComboManager from './ComboManager.jsx';
import './ComboManagerExample.css';

/**
 * ComboManagerExample Component
 * Demonstrates the usage of ComboManager with mock data
 * This is for testing and demonstration purposes
 */
const ComboManagerExample = () => {
  // Mock products data
  const mockProducts = [
    { id: '1', name: 'Espresso', category: 'Coffee', price: 35000 },
    { id: '2', name: 'Cappuccino', category: 'Coffee', price: 45000 },
    { id: '3', name: 'Latte', category: 'Coffee', price: 45000 },
    { id: '4', name: 'Croissant', category: 'Pastry', price: 25000 },
    { id: '5', name: 'Chocolate Cake', category: 'Cake', price: 40000 },
    { id: '6', name: 'Green Tea', category: 'Tea', price: 30000 },
    { id: '7', name: 'Sandwich', category: 'Sandwich', price: 50000 }
  ];

  // Mock combos data
  const [combos, setCombos] = useState([
    {
      id: '1',
      name: 'Morning Breakfast Combo',
      description: 'Perfect start to your day with coffee and pastry',
      price: 65000,
      imageUrl: '',
      products: [
        { productId: '1', variantId: '', quantity: 1 },
        { productId: '4', variantId: '', quantity: 1 }
      ],
      available: true
    },
    {
      id: '2',
      name: 'Afternoon Tea Set',
      description: 'Relax with tea and cake',
      price: 60000,
      imageUrl: '',
      products: [
        { productId: '6', variantId: '', quantity: 1 },
        { productId: '5', variantId: '', quantity: 1 }
      ],
      available: true
    },
    {
      id: '3',
      name: 'Coffee Lovers Bundle',
      description: 'Two premium coffees for coffee enthusiasts',
      price: 80000,
      imageUrl: '',
      products: [
        { productId: '2', variantId: '', quantity: 1 },
        { productId: '3', variantId: '', quantity: 1 }
      ],
      available: true
    }
  ]);

  const handleCreateCombo = (comboData) => {
    const newCombo = {
      ...comboData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setCombos([...combos, newCombo]);
    console.log('Created combo:', newCombo);
    alert('Combo created successfully!');
  };

  const handleEditCombo = (comboId, comboData) => {
    setCombos(combos.map(combo => 
      combo.id === comboId 
        ? { ...combo, ...comboData, updatedAt: new Date() }
        : combo
    ));
    console.log('Updated combo:', comboId, comboData);
    alert('Combo updated successfully!');
  };

  const handleDeleteCombo = (comboId) => {
    setCombos(combos.filter(combo => combo.id !== comboId));
    console.log('Deleted combo:', comboId);
    alert('Combo deleted successfully!');
  };

  return (
    <div className="combo-manager-example">
      <div className="example-header">
        <h1>ComboManager Component Example</h1>
        <p>This demonstrates the ComboManager component with mock data</p>
      </div>

      <ComboManager
        combos={combos}
        products={mockProducts}
        onCreateCombo={handleCreateCombo}
        onEditCombo={handleEditCombo}
        onDeleteCombo={handleDeleteCombo}
      />

      <div className="example-info">
        <h3>Component Features:</h3>
        <ul>
          <li>✅ List view of all combos with search functionality</li>
          <li>✅ Create new combos with multiple products</li>
          <li>✅ Edit existing combos</li>
          <li>✅ Delete combos with confirmation</li>
          <li>✅ Form validation (name, price, products required)</li>
          <li>✅ Responsive design for all screen sizes</li>
          <li>✅ Visual Design System integration</li>
          <li>✅ Phosphor Icons for consistent iconography</li>
        </ul>

        <h3>Usage:</h3>
        <pre>{`
import ComboManager from './features/menu/ComboManager';

<ComboManager
  combos={combos}
  products={products}
  onCreateCombo={handleCreateCombo}
  onEditCombo={handleEditCombo}
  onDeleteCombo={handleDeleteCombo}
/>
        `}</pre>

        <h3>Props:</h3>
        <ul>
          <li><strong>combos</strong>: Array of combo objects</li>
          <li><strong>products</strong>: Array of available products</li>
          <li><strong>onCreateCombo</strong>: Function called when creating a combo</li>
          <li><strong>onEditCombo</strong>: Function called when editing a combo</li>
          <li><strong>onDeleteCombo</strong>: Function called when deleting a combo</li>
        </ul>

        <h3>Current State:</h3>
        <pre>{JSON.stringify({ combos, products: mockProducts }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default ComboManagerExample;
