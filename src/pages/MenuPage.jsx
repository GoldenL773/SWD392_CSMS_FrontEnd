import React, { useState } from 'react';
import { BookOpen } from '@phosphor-icons/react';
import { useAuth } from '../hooks/useAuth.jsx';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { useApiMutation } from '../hooks/useApiMutation.jsx';
import { getAllProducts } from '../api/productApi.jsx';
import { getAllCombos, createCombo, updateCombo, deleteCombo } from '../api/comboApi.jsx';
import { getRecipeByProductId } from '../api/recipeApi.jsx';
import { PRODUCT_CATEGORIES } from '../utils/constants.jsx';
import ProductDetailModal from '../components/common/ProductDetailModal/index.jsx';
import ComboManager from '../features/menu/ComboManager.jsx';
import RecipeViewer from '../features/menu/RecipeViewer.jsx';
import Modal from '../components/common/Modal/index.jsx';
import Button from '../components/common/Button/index.jsx';
import './MenuPage.css';

/**
 * MenuPage Component
 * Displays menu products and combos
 * Supports Combo Management for Managers
 * Supports Recipe Viewing for Staff
 */
const MenuPage = () => {
  const { hasAnyRole } = useAuth();
  const isManager = hasAnyRole(['ADMIN', 'MANAGER']);
  const canViewRecipe = hasAnyRole(['ADMIN', 'MANAGER', 'BARISTA', 'STAFF']);

  // Tabs: 'products' | 'combos'
  const [activeTab, setActiveTab] = useState('products');

  // Products Data
  const { data: productsData, loading: productsLoading } = useApiQuery(getAllProducts, { size: 1000 }, []);
  const products = productsData?.content || productsData || [];

  // Combos Data
  const { data: combosData, loading: combosLoading, refetch: refetchCombos } = useApiQuery(getAllCombos, {}, []);
  const combos = combosData?.content || combosData || [];

  // Mutations for Combos
  const { mutate: handleCreateCombo } = useApiMutation(createCombo, {
    successMessage: 'Combo created successfully',
    onSuccess: () => refetchCombos()
  });

  const { mutate: handleUpdateCombo } = useApiMutation(
    ({ id, data }) => updateCombo(id, data),
    {
      successMessage: 'Combo updated successfully',
      onSuccess: () => refetchCombos()
    }
  );

  const { mutate: handleDeleteCombo } = useApiMutation(deleteCombo, {
    successMessage: 'Combo deleted successfully',
    onSuccess: () => refetchCombos()
  });

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Recipe Modal State
  const [recipeModalOpen, setRecipeModalOpen] = useState(false);
  const [recipeProductId, setRecipeProductId] = useState(null);

  const handleProductClick = (productId) => {
    setSelectedProductId(productId);
    setIsDetailModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedProductId(null);
  };
  
  const handleViewRecipe = (e, productId) => {
    e.stopPropagation(); // Prevent opening detail modal
    setRecipeProductId(productId);
    setRecipeModalOpen(true);
  };

  const handleCloseRecipeModal = () => {
    setRecipeModalOpen(false);
    setRecipeProductId(null);
  };

  const filteredProducts = selectedCategory === 'All'
    ? products || []
    : (products || []).filter(p => (p.categoryName || p.category) === selectedCategory);

  const getProductsByCategory = (category) => {
    return (products || []).filter(p => (p.categoryName || p.category) === category);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="menu-page">
      <div className="page-header">
        <div className="page-header-content">
          <BookOpen size={32} weight="thin" className="page-header-icon" />
          <div>
            <h1 className="page-title">Menu Management</h1>
            <p className="page-subtitle">Browse our delicious offerings</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'products' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Menu Items
        </button>
        <button 
          className={`tab ${activeTab === 'combos' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('combos')}
        >
          Combos
        </button>
      </div>

      {activeTab === 'products' && (
        <>
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

          {productsLoading ? (
            <div className="loading-container">
              <div className="loading"></div>
              <p>Loading menu...</p>
            </div>
          ) : (
            <>
              {selectedCategory === 'All' ? (
                <div className="menu-sections">
                  {PRODUCT_CATEGORIES.map(category => {
                    const categoryProducts = getProductsByCategory(category);
                    if (categoryProducts.length === 0) return null;

                    return (
                      <div key={category} className="menu-section">
                        <h2 className="category-title">{category}</h2>
                        <div className="products-grid">
                          {categoryProducts.map(product => (
                            <div 
                              key={product.id} 
                              className="product-card"
                              onClick={() => handleProductClick(product.id)}
                              role="button"
                              tabIndex={0}
                              onKeyPress={(e) => e.key === 'Enter' && handleProductClick(product.id)}
                            >
                              <div className="product-image">
                                <div className="image-placeholder">
                                  {(product.categoryName || product.category) === 'Coffee' && '☕'}
                                  {(product.categoryName || product.category) === 'Tea' && '🍵'}
                                  {(product.categoryName || product.category) === 'Cake' && '🍰'}
                                  {(product.categoryName || product.category) === 'Pastry' && '🥐'}
                                  {(product.categoryName || product.category) === 'Sandwich' && '🥪'}
                                  {(product.categoryName || product.category) === 'Beverage' && '🥤'}
                                  {(product.categoryName || product.category) === 'Other' && '🍴'}
                                </div>
                                {(!product.available && product.status !== 'Available') && (
                                  <div className="unavailable-badge">Out of Stock</div>
                                )}
                                
                                {canViewRecipe && (
                                  <button 
                                    className="btn-recipe-float"
                                    onClick={(e) => handleViewRecipe(e, product.id)}
                                    title="View Recipe"
                                  >
                                    <BookOpen size={20} weight="bold" />
                                  </button>
                                )}
                              </div>
                              <div className="product-info">
                                <h3 className="product-name">{product.name}</h3>
                                <p className="product-price">{formatPrice(product.price)}</p>
                                <span className={`status-badge ${product.available !== false && product.status !== 'Unavailable' ? 'available' : 'unavailable'}`}>
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
                <div className="products-grid">
                  {filteredProducts.length === 0 ? (
                    <div className="empty-state">
                      <p>No products found in this category</p>
                    </div>
                  ) : (
                    filteredProducts.map(product => (
                      <div 
                        key={product.id} 
                        className="product-card"
                        onClick={() => handleProductClick(product.id)}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && handleProductClick(product.id)}
                      >
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
                          
                          {canViewRecipe && (
                            <button 
                              className="btn-recipe-float"
                              onClick={(e) => handleViewRecipe(e, product.id)}
                              title="View Recipe"
                            >
                              <BookOpen size={20} weight="bold" />
                            </button>
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

          <ProductDetailModal
            isOpen={isDetailModalOpen}
            onClose={handleCloseModal}
            productId={selectedProductId}
          />
          
          <RecipeDisplayModal
            isOpen={recipeModalOpen}
            onClose={handleCloseRecipeModal}
            productId={recipeProductId}
          />
        </>
      )}

      {activeTab === 'combos' && (
        <div className="combos-section">
          {combosLoading ? (
             <div className="loading-container">
               <div className="loading"></div>
               <p>Loading combos...</p>
             </div>
          ) : (
            <ComboManager
              combos={combos}
              products={products}
              onCreateCombo={handleCreateCombo}
              onEditCombo={(id, data) => handleUpdateCombo({ id, data })}
              onDeleteCombo={handleDeleteCombo}
              isReadOnly={!isManager}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Internal component for displaying recipe in modal
const RecipeDisplayModal = ({ isOpen, onClose, productId }) => {
  const { data: recipe, loading } = useApiQuery(
    () => productId ? getRecipeByProductId(productId) : Promise.resolve(null),
    {},
    [productId]
  );

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Recipe Details"
      size="medium"
    >
      {loading ? (
        <div className="loading-container">
          <div className="loading"></div>
          <p>Loading recipe...</p>
        </div>
      ) : (
        <>
          <RecipeViewer recipe={recipe} mode="view" />
          <div className="modal-actions" style={{ justifyContent: 'flex-end', marginTop: '1rem' }}>
            <Button variant="secondary" onClick={onClose}>Close</Button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default MenuPage;
