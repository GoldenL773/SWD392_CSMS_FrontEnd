import React, { useState } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getAllProducts } from '../api/productApi.jsx';
import { PRODUCT_CATEGORIES } from '../utils/constants.jsx';
import './MenuPage.css';

/**
 * MenuPage Component
 * Staff-facing read-only menu view
 * Displays products grouped by category for quick reference
 */
const MenuPage = () => {
  const { data: products, loading } = useApiQuery(getAllProducts, {}, []);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = selectedCategory === 'All'
    ? products || []
    : (products || []).filter(p => p.category === selectedCategory);

  const getProductsByCategory = (category) => {
    return (products || []).filter(p => p.category === category);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1>☕ Menu</h1>
        <p>Browse our delicious offerings</p>
      </div>

      {/* Category Filter */}
      <div className="category-filter">
        <button
          className={`category-btn ${selectedCategory === 'All' ? 'active' : ''}`}
          onClick={() => setSelectedCategory('All')}
        >
          All Items
        </button>
        {PRODUCT_CATEGORIES.map(category => (
          <button
            key={category}
            className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading menu...</p>
        </div>
      ) : (
        <>
          {selectedCategory === 'All' ? (
            // Show all categories with headers
            <div className="menu-sections">
              {PRODUCT_CATEGORIES.map(category => {
                const categoryProducts = getProductsByCategory(category);
                if (categoryProducts.length === 0) return null;

                return (
                  <div key={category} className="menu-section">
                    <h2 className="category-title">{category}</h2>
                    <div className="products-grid">
                      {categoryProducts.map(product => (
                        <div key={product.id} className="product-card">
                          <div className="product-image">
                            <div className="image-placeholder">
                              {product.category === 'Coffee' && '☕'}
                              {product.category === 'Tea' && '🍵'}
                              {product.category === 'Cake' && '🍰'}
                              {product.category === 'Pastry' && '🥐'}
                              {product.category === 'Sandwich' && '🥪'}
                              {product.category === 'Beverage' && '🥤'}
                              {product.category === 'Other' && '🍴'}
                            </div>
                            {product.status === 'Unavailable' && (
                              <div className="unavailable-badge">Out of Stock</div>
                            )}
                          </div>
                          <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-price">{formatPrice(product.price)}</p>
                            <span className={`status-badge ${product.status === 'Available' ? 'available' : 'unavailable'}`}>
                              {product.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // Show filtered category
            <div className="products-grid">
              {filteredProducts.length === 0 ? (
                <div className="empty-state">
                  <p>No products found in this category</p>
                </div>
              ) : (
                filteredProducts.map(product => (
                  <div key={product.id} className="product-card">
                    <div className="product-image">
                      <div className="image-placeholder">
                        {product.category === 'Coffee' && '☕'}
                        {product.category === 'Tea' && '🍵'}
                        {product.category === 'Cake' && '🍰'}
                        {product.category === 'Pastry' && '🥐'}
                        {product.category === 'Sandwich' && '🥪'}
                        {product.category === 'Beverage' && '🥤'}
                        {product.category === 'Other' && '🍴'}
                      </div>
                      {product.status === 'Unavailable' && (
                        <div className="unavailable-badge">Out of Stock</div>
                      )}
                    </div>
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-price">{formatPrice(product.price)}</p>
                      <span className={`status-badge ${product.status === 'Available' ? 'available' : 'unavailable'}`}>
                        {product.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MenuPage;
