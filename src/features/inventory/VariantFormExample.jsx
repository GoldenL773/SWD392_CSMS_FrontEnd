import React, { useState } from 'react';
import Button from '../../components/common/Button/index.jsx';
import { PlusIcon } from 'phosphor-react';
import VariantForm from './VariantForm.jsx';
import VariantList from './VariantList.jsx';
import './VariantFormExample.css';

/**
 * VariantFormExample Component
 * Demonstrates how to use VariantForm component with "Add New Variant" button
 * 
 * This example shows:
 * - Product detail view with existing variants
 * - "Add New Variant" button
 * - VariantForm modal integration
 * - Immediate UI update after adding variant
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4
 */
const VariantFormExample = () => {
  const [isVariantFormOpen, setIsVariantFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Example product data
  const [product] = useState({
    id: 1,
    name: 'Tiramisu Coffee',
    category: 'Beverage',
    description: 'Rich coffee with tiramisu flavor',
    imageUrl: 'https://via.placeholder.com/300x200?text=Tiramisu+Coffee'
  });

  // Example variants state
  const [variants, setVariants] = useState([
    {
      id: 1,
      size: 'Small',
      temperature: 'Hot',
      price: 45000,
      sku: 'TIR-SM-HOT',
      available: true
    },
    {
      id: 2,
      size: 'Medium',
      temperature: 'Hot',
      price: 55000,
      sku: 'TIR-MD-HOT',
      available: true
    },
    {
      id: 3,
      size: 'Large',
      temperature: 'Cold',
      price: 65000,
      sku: 'TIR-LG-COLD',
      available: true
    }
  ]);

  const handleOpenVariantForm = () => {
    setIsVariantFormOpen(true);
  };

  const handleCloseVariantForm = () => {
    setIsVariantFormOpen(false);
  };

  const handleAddVariant = (variantData) => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Create new variant with generated ID
      const newVariant = {
        id: variants.length + 1,
        ...variantData,
        available: true
      };
      
      // Add to variants list (immediate UI update)
      setVariants([...variants, newVariant]);
      
      setLoading(false);
      setIsVariantFormOpen(false);
      
      // Show success message (you can use a toast notification here)
      console.log('Variant added successfully:', newVariant);
    }, 1000);
  };

  return (
    <div className="variant-form-example">
      <div className="example-header">
        <h2>VariantForm Component Example</h2>
        <p>This example demonstrates adding new variants to an existing product</p>
      </div>

      {/* Product Detail View */}
      <div className="product-detail-card">
        <div className="product-detail-header">
          {product.imageUrl && (
            <div className="product-detail-image">
              <img src={product.imageUrl} alt={product.name} />
            </div>
          )}
          <div className="product-detail-info">
            <h3 className="product-detail-name">{product.name}</h3>
            <p className="product-detail-category">{product.category}</p>
            <p className="product-detail-description">{product.description}</p>
          </div>
        </div>

        {/* Variants Section with "Add New Variant" Button */}
        <div className="product-variants-section">
          <div className="variants-section-header">
            <h4>Product Variants ({variants.length})</h4>
            <Button
              variant="primary"
              size="small"
              onClick={handleOpenVariantForm}
            >
              <PlusIcon size={16} weight="regular" />
              Add New Variant
            </Button>
          </div>

          {/* Display existing variants */}
          {variants.length > 0 ? (
            <VariantList variants={variants} />
          ) : (
            <div className="no-variants-message">
              <p>No variants available. Click "Add New Variant" to create one.</p>
            </div>
          )}
        </div>
      </div>

      {/* VariantForm Modal */}
      <VariantForm
        isOpen={isVariantFormOpen}
        onClose={handleCloseVariantForm}
        onSubmit={handleAddVariant}
        productId={product.id}
        productName={product.name}
        loading={loading}
      />

      {/* Usage Instructions */}
      <div className="example-instructions">
        <h4>How to Use VariantForm Component:</h4>
        <ol>
          <li>Import the VariantForm component from the inventory features</li>
          <li>Add an "Add New Variant" button to your product detail view</li>
          <li>Manage the modal open/close state with useState</li>
          <li>Pass the required props: isOpen, onClose, onSubmit, productId, productName</li>
          <li>Handle the onSubmit callback to add the new variant to your state/API</li>
          <li>The UI will update immediately after adding the variant</li>
        </ol>

        <h4>Code Example:</h4>
        <pre className="code-example">
{`import VariantForm from './VariantForm.jsx';
import Button from '../../components/common/Button/index.jsx';
import { PlusIcon } from 'phosphor-react';

const [isVariantFormOpen, setIsVariantFormOpen] = useState(false);

const handleAddVariant = (variantData) => {
  // Add variant to your state or call API
  console.log('New variant:', variantData);
};

<Button onClick={() => setIsVariantFormOpen(true)}>
  <PlusIcon size={16} />
  Add New Variant
</Button>

<VariantForm
  isOpen={isVariantFormOpen}
  onClose={() => setIsVariantFormOpen(false)}
  onSubmit={handleAddVariant}
  productId={product.id}
  productName={product.name}
/>`}
        </pre>
      </div>
    </div>
  );
};

export default VariantFormExample;
