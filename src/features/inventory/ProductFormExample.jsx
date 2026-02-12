import React, { useState } from 'react';
import ProductForm from './ProductForm.jsx';
import './ProductFormExample.css';

/**
 * ProductFormExample Component
 * Demonstrates the usage of ProductForm with variant management
 * 
 * This example shows:
 * - Creating a new product with variants
 * - Editing an existing product with variants
 * - Form validation
 * - Submission handling
 */
const ProductFormExample = () => {
  const [mode, setMode] = useState('create'); // 'create' or 'edit'
  const [loading, setLoading] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Example product for edit mode
  const existingProduct = {
    id: 1,
    name: 'Tiramisu',
    category: 'Cake',
    description: 'Classic Italian dessert with coffee-soaked ladyfingers',
    imageUrl: 'https://via.placeholder.com/200',
    status: 'Available',
    variants: [
      {
        id: 1,
        size: 'Small',
        temperature: '',
        price: 45000,
        sku: 'TIR-SM-001'
      },
      {
        id: 2,
        size: 'Large',
        temperature: '',
        price: 65000,
        sku: 'TIR-LG-001'
      }
    ]
  };

  const handleSubmit = (data) => {
    console.log('Form submitted:', data);
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmittedData(data);
      alert(`Product ${mode === 'create' ? 'created' : 'updated'} successfully!`);
    }, 1500);
  };

  const handleCancel = () => {
    console.log('Form cancelled');
    alert('Form cancelled');
  };

  return (
    <div className="product-form-example">
      <div className="example-header">
        <h2>ProductForm Component Example</h2>
        <div className="mode-toggle">
          <button
            className={mode === 'create' ? 'active' : ''}
            onClick={() => setMode('create')}
          >
            Create Mode
          </button>
          <button
            className={mode === 'edit' ? 'active' : ''}
            onClick={() => setMode('edit')}
          >
            Edit Mode
          </button>
        </div>
      </div>

      <div className="example-content">
        <div className="form-container">
          <h3>{mode === 'create' ? 'Create New Product' : 'Edit Product'}</h3>
          <ProductForm
            product={mode === 'edit' ? existingProduct : null}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </div>

        {submittedData && (
          <div className="submitted-data">
            <h3>Submitted Data</h3>
            <pre>{JSON.stringify(submittedData, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="example-notes">
        <h3>Features Demonstrated</h3>
        <ul>
          <li>✓ General product information section (name, category, description, image)</li>
          <li>✓ Variants table with add/delete functionality</li>
          <li>✓ Variant fields: size, temperature, price, SKU</li>
          <li>✓ Form validation (product name required, at least one variant)</li>
          <li>✓ Image preview for product images</li>
          <li>✓ Submit product and variants together</li>
          <li>✓ Edit mode with pre-populated data</li>
        </ul>

        <h3>Validation Rules</h3>
        <ul>
          <li>Product name is required</li>
          <li>At least one variant must be added</li>
          <li>Each variant must have a size</li>
          <li>Each variant must have a valid price (greater than 0)</li>
          <li>Cannot delete the last variant</li>
        </ul>

        <h3>Requirements Validated</h3>
        <ul>
          <li>5.1 - General product information section</li>
          <li>5.2 - Variants section below product information</li>
          <li>5.4 - Submit product and variants together</li>
          <li>5.5 - Validate at least one variant</li>
        </ul>
      </div>
    </div>
  );
};

export default ProductFormExample;
