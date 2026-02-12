import React from 'react';
import ProductList from './ProductList.jsx';

/**
 * ProductListExample Component
 * Demonstrates usage of ProductList with sample data
 * 
 * This example shows:
 * - Products with multiple variants (expandable)
 * - Products with no variants (non-expandable)
 * - Different variant attributes (size, temperature, price)
 */
const ProductListExample = () => {
  // Sample product data with variants
  const sampleProducts = [
    {
      id: 1,
      name: 'Tiramisu',
      category: 'Dessert',
      description: 'Classic Italian coffee-flavored dessert',
      imageUrl: 'https://via.placeholder.com/150/FFCBA4/4B3621?text=Tiramisu',
      variants: [
        {
          id: 'v1',
          size: 'Small',
          temperature: 'Cold',
          price: 5.00,
          sku: 'TIR-SM-COLD',
          available: true
        },
        {
          id: 'v2',
          size: 'Medium',
          temperature: 'Cold',
          price: 7.00,
          sku: 'TIR-MD-COLD',
          available: true
        },
        {
          id: 'v3',
          size: 'Large',
          temperature: 'Cold',
          price: 9.00,
          sku: 'TIR-LG-COLD',
          available: false
        }
      ]
    },
    {
      id: 2,
      name: 'Lemon Tea',
      category: 'Beverage',
      description: 'Refreshing lemon-infused tea',
      imageUrl: 'https://via.placeholder.com/150/FFCBA4/4B3621?text=Lemon+Tea',
      variants: [
        {
          id: 'v4',
          size: 'Small',
          temperature: 'Hot',
          price: 3.50,
          sku: 'LEM-SM-HOT',
          available: true
        },
        {
          id: 'v5',
          size: 'Small',
          temperature: 'Cold',
          price: 3.50,
          sku: 'LEM-SM-COLD',
          available: true
        },
        {
          id: 'v6',
          size: 'Medium',
          temperature: 'Hot',
          price: 4.50,
          sku: 'LEM-MD-HOT',
          available: true
        },
        {
          id: 'v7',
          size: 'Medium',
          temperature: 'Cold',
          price: 4.50,
          sku: 'LEM-MD-COLD',
          available: true
        },
        {
          id: 'v8',
          size: 'Large',
          temperature: 'Hot',
          price: 5.50,
          sku: 'LEM-LG-HOT',
          available: true
        },
        {
          id: 'v9',
          size: 'Large',
          temperature: 'Cold',
          price: 5.50,
          sku: 'LEM-LG-COLD',
          available: true
        }
      ]
    },
    {
      id: 3,
      name: 'Espresso',
      category: 'Beverage',
      description: 'Strong Italian coffee',
      imageUrl: 'https://via.placeholder.com/150/FFCBA4/4B3621?text=Espresso',
      variants: [
        {
          id: 'v10',
          size: 'Single Shot',
          temperature: 'Hot',
          price: 2.50,
          sku: 'ESP-SGL-HOT',
          available: true
        },
        {
          id: 'v11',
          size: 'Double Shot',
          temperature: 'Hot',
          price: 3.50,
          sku: 'ESP-DBL-HOT',
          available: true
        }
      ]
    },
    {
      id: 4,
      name: 'Croissant',
      category: 'Pastry',
      description: 'Buttery French pastry',
      imageUrl: 'https://via.placeholder.com/150/FFCBA4/4B3621?text=Croissant',
      price: 3.00,
      variants: [] // No variants - should not show expand icon
    }
  ];

  const handleProductClick = (product) => {
    console.log('Product clicked:', product);
  };

  const handleVariantClick = (variant) => {
    console.log('Variant clicked:', variant);
  };

  return (
    <div style={{ padding: 'var(--spacing-xl)', backgroundColor: 'var(--color-creamy-white)' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ 
          fontFamily: 'var(--font-family-heading)', 
          fontSize: 'var(--font-size-2xl)',
          color: 'var(--color-coffee-brown)',
          marginBottom: 'var(--spacing-lg)'
        }}>
          Product List with Variants
        </h1>
        
        <p style={{ 
          color: 'var(--color-text-secondary)', 
          marginBottom: 'var(--spacing-xl)',
          fontSize: 'var(--font-size-base)'
        }}>
          Click on products with variants to expand and view available options. 
          Products without variants (like Croissant) do not expand.
        </p>

        <ProductList
          products={sampleProducts}
          onProductClick={handleProductClick}
          onVariantClick={handleVariantClick}
        />
      </div>
    </div>
  );
};

export default ProductListExample;
