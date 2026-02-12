import React, { useState } from 'react';
import SupplierManager from './SupplierManager.jsx';
import './SupplierManagerExample.css';

/**
 * SupplierManagerExample Component
 * Demonstrates the usage of SupplierManager with mock data
 * This is for testing and demonstration purposes
 */
const SupplierManagerExample = () => {
  // Mock ingredients data
  const mockIngredients = [
    { id: '1', name: 'Arabica Coffee Beans' },
    { id: '2', name: 'Robusta Coffee Beans' },
    { id: '3', name: 'Whole Milk' },
    { id: '4', name: 'Almond Milk' },
    { id: '5', name: 'Sugar' },
    { id: '6', name: 'Cocoa Powder' },
    { id: '7', name: 'Green Tea Leaves' },
    { id: '8', name: 'Black Tea Leaves' },
    { id: '9', name: 'Vanilla Syrup' },
    { id: '10', name: 'Caramel Syrup' }
  ];

  // Mock suppliers data
  const [suppliers, setSuppliers] = useState([
    {
      id: '1',
      name: 'Premium Coffee Imports',
      contactPerson: 'John Smith',
      email: 'john@premiumcoffee.com',
      phone: '+84 901 234 567',
      address: '123 Coffee Street, District 1, Ho Chi Minh City',
      providedIngredients: ['1', '2'],
      status: 'Active',
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      name: 'Fresh Dairy Co.',
      contactPerson: 'Sarah Johnson',
      email: 'sarah@freshdairy.com',
      phone: '+84 902 345 678',
      address: '456 Milk Road, District 3, Ho Chi Minh City',
      providedIngredients: ['3', '4'],
      status: 'Active',
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-20')
    },
    {
      id: '3',
      name: 'Sweet Supplies Ltd.',
      contactPerson: 'Michael Brown',
      email: 'michael@sweetsupp.com',
      phone: '+84 903 456 789',
      address: '789 Sugar Lane, District 5, Ho Chi Minh City',
      providedIngredients: ['5', '9', '10'],
      status: 'Active',
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-02-01')
    },
    {
      id: '4',
      name: 'Tea Masters Vietnam',
      contactPerson: 'Emily Chen',
      email: 'emily@teamasters.vn',
      phone: '+84 904 567 890',
      address: '321 Tea Avenue, District 7, Ho Chi Minh City',
      providedIngredients: ['7', '8'],
      status: 'Inactive',
      createdAt: new Date('2023-12-10'),
      updatedAt: new Date('2024-01-05')
    }
  ]);

  const handleCreateSupplier = (supplierData) => {
    const newSupplier = {
      ...supplierData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setSuppliers([...suppliers, newSupplier]);
    console.log('Created supplier:', newSupplier);
    alert('Supplier created successfully!');
  };

  const handleUpdateSupplier = (supplierId, supplierData) => {
    setSuppliers(suppliers.map(supplier => 
      supplier.id === supplierId 
        ? { ...supplier, ...supplierData, updatedAt: new Date() }
        : supplier
    ));
    console.log('Updated supplier:', supplierId, supplierData);
    alert('Supplier updated successfully!');
  };

  const handleDeleteSupplier = (supplierId) => {
    setSuppliers(suppliers.filter(supplier => supplier.id !== supplierId));
    console.log('Deleted supplier:', supplierId);
    alert('Supplier deleted successfully!');
  };

  return (
    <div className="supplier-manager-example">
      <div className="example-header">
        <h1>SupplierManager Component Example</h1>
        <p>This demonstrates the SupplierManager component with mock data</p>
      </div>

      <SupplierManager
        suppliers={suppliers}
        ingredients={mockIngredients}
        onCreateSupplier={handleCreateSupplier}
        onUpdateSupplier={handleUpdateSupplier}
        onDeleteSupplier={handleDeleteSupplier}
      />

      <div className="example-info">
        <h3>Component Features:</h3>
        <ul>
          <li>✅ Table view of all suppliers with search and filter</li>
          <li>✅ Create new suppliers with contact information</li>
          <li>✅ Edit existing supplier details</li>
          <li>✅ View supplier details and history</li>
          <li>✅ Delete suppliers with confirmation</li>
          <li>✅ Associate ingredients with suppliers</li>
          <li>✅ Status management (Active/Inactive)</li>
          <li>✅ Form validation (email, phone, required fields)</li>
          <li>✅ Responsive design for all screen sizes</li>
          <li>✅ Visual Design System integration</li>
          <li>✅ Phosphor Icons for consistent iconography</li>
        </ul>

        <h3>Usage:</h3>
        <pre>{`
import SupplierManager from './features/suppliers/SupplierManager';

<SupplierManager
  suppliers={suppliers}
  ingredients={ingredients}
  onCreateSupplier={handleCreateSupplier}
  onUpdateSupplier={handleUpdateSupplier}
  onDeleteSupplier={handleDeleteSupplier}
/>
        `}</pre>

        <h3>Props:</h3>
        <ul>
          <li><strong>suppliers</strong>: Array of supplier objects</li>
          <li><strong>ingredients</strong>: Array of available ingredients</li>
          <li><strong>onCreateSupplier</strong>: Function called when creating a supplier</li>
          <li><strong>onUpdateSupplier</strong>: Function called when updating a supplier</li>
          <li><strong>onDeleteSupplier</strong>: Function called when deleting a supplier</li>
        </ul>

        <h3>Current State:</h3>
        <pre>{JSON.stringify({ 
          suppliers: suppliers.length, 
          ingredients: mockIngredients.length,
          activeSuppliers: suppliers.filter(s => s.status === 'Active').length,
          inactiveSuppliers: suppliers.filter(s => s.status === 'Inactive').length
        }, null, 2)}</pre>
      </div>
    </div>
  );
};

export default SupplierManagerExample;
