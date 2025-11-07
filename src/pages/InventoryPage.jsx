import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../api/productApi.jsx';
import { getAllIngredients, createIngredient, updateIngredient, deleteIngredient, recordTransaction } from '../api/ingredientApi.jsx';
import { PRODUCT_CATEGORIES } from '../utils/constants.jsx';
import ToastContainer from '../components/common/Toast/ToastContainer.jsx';
import Card from '../components/common/Card/index.jsx';
import Button from '../components/common/Button/index.jsx';
import ProductsTable from '../features/inventory/ProductsTable.jsx';
import IngredientsTable from '../features/inventory/IngredientsTable.jsx';
import ProductFormModal from '../features/inventory/ProductFormModal.jsx';
import IngredientModal from '../components/common/IngredientModal/index.jsx';
import TransactionModal from '../components/common/TransactionModal/index.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog/index.jsx';
import './InventoryPage.css';

const InventoryPage = () => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('products');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, type: null });
  
  // Pagination state
  const [productPage, setProductPage] = useState(0);
  const [ingredientPage, setIngredientPage] = useState(0);
  const pageSize = 10;
  
  // Filter state
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [ingredientSearch, setIngredientSearch] = useState('');

  // Fetch data with pagination
  const { data: productsData, loading: productsLoading, refetch: refetchProducts } = useApiQuery(
    getAllProducts, 
    { page: productPage, size: pageSize }, 
    [productPage]
  );
  const { data: ingredientsData, loading: ingredientsLoading, refetch: refetchIngredients } = useApiQuery(
    getAllIngredients, 
    { page: ingredientPage, size: pageSize }, 
    [ingredientPage]
  );
  
  // Extract content from paginated response
  const allProducts = productsData?.content || productsData || [];
  const allIngredients = ingredientsData?.content || ingredientsData || [];
  const totalProducts = productsData?.totalElements || allProducts.length;
  const totalIngredients = ingredientsData?.totalElements || allIngredients.length;
  
  // Filter products
  const products = allProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  
  // Filter ingredients
  const ingredients = allIngredients.filter(ingredient =>
    ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase())
  );

  // Mutations
  const { mutate: createProductMutation, loading: creating } = useApiMutation(createProduct);
  const { mutate: updateProductMutation, loading: updating } = useApiMutation(updateProduct);
  const { mutate: deleteProductMutation } = useApiMutation(deleteProduct);

  const handleProductSubmit = async (data) => {
    try {
      if (selectedProduct) {
        await updateProductMutation(selectedProduct.id, data);
        toast.success('Product updated successfully!');
      } else {
        await createProductMutation(data);
        toast.success('Product created successfully!');
      }
      setIsProductModalOpen(false);
      setSelectedProduct(null);
      refetchProducts();
    } catch (error) {
      toast.error('Error saving product: ' + error.message);
    }
  };

  const handleIngredientSubmit = async (data) => {
    try {
      if (selectedIngredient) {
        await updateIngredient(selectedIngredient.id, data);
        toast.success('Ingredient updated successfully!');
      } else {
        await createIngredient(data);
        toast.success('Ingredient created successfully!');
      }
      setIsIngredientModalOpen(false);
      setSelectedIngredient(null);
      refetchIngredients();
    } catch (error) {
      toast.error('Error saving ingredient: ' + error.message);
    }
  };

  const handleTransactionSubmit = async (transactions) => {
    try {
      console.log('Submitting transactions:', transactions);
      
      // Record transactions sequentially to better handle errors
      let successCount = 0;
      let errors = [];
      
      for (const transaction of transactions) {
        try {
          await recordTransaction(transaction);
          successCount++;
        } catch (err) {
          console.error('Transaction error:', err);
          errors.push(`${transaction.ingredientId}: ${err.message}`);
        }
      }
      
      if (successCount > 0) {
        toast.success(`${successCount} transaction${successCount > 1 ? 's' : ''} recorded successfully!`);
      }
      
      if (errors.length > 0) {
        toast.error(`Failed to record ${errors.length} transaction(s)`);
        console.error('Transaction errors:', errors);
      }
      
      if (successCount > 0 || errors.length === 0) {
        setIsTransactionModalOpen(false);
      }
      
      refetchIngredients();
    } catch (error) {
      console.error('Transaction submit error:', error);
      toast.error('Error recording transaction: ' + error.message);
    }
  };

  const handleDeleteClick = (id, type) => {
    setConfirmDelete({ isOpen: true, id, type });
  };

  const handleConfirmDelete = async () => {
    try {
      const { id, type } = confirmDelete;
      if (type === 'product') {
        await deleteProductMutation(id);
        toast.success('Product deleted successfully!');
        refetchProducts();
      } else if (type === 'ingredient') {
        await deleteIngredient(id);
        toast.success('Ingredient deleted successfully!');
        refetchIngredients();
      }
      setConfirmDelete({ isOpen: false, id: null, type: null });
    } catch (error) {
      toast.error('Error deleting item: ' + error.message);
    }
  };

  return (
    <div className="inventory-page">
      <div className="page-header">
        <h1>Inventory Management</h1>
        <p>Manage products and ingredients</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'products' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Products
        </button>
        <button 
          className={`tab ${activeTab === 'ingredients' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('ingredients')}
        >
          Ingredients
        </button>
      </div>

      {activeTab === 'products' && (
        <Card
          title="Products"
          subtitle={`${products.length} of ${totalProducts} products`}
          actions={
            <Button onClick={() => {
              setSelectedProduct(null);
              setIsProductModalOpen(true);
            }}>
              + Add Product
            </Button>
          }
        >
          <div className="filters-section">
            <div className="filter-row">
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="🔍 Search products by name..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="filter-input"
                />
              </div>
              <div className="filter-group">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="filter-select"
                >
                  <option value="ALL">All Categories</option>
                  {PRODUCT_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              {(productSearch || categoryFilter !== 'ALL') && (
                <Button 
                  variant="ghost" 
                  size="small"
                  onClick={() => {
                    setProductSearch('');
                    setCategoryFilter('ALL');
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          <ProductsTable
            products={products || []}
            loading={productsLoading}
            onEdit={(product) => {
              setSelectedProduct(product);
              setIsProductModalOpen(true);
            }}
            onDelete={(id) => handleDeleteClick(id, 'product')}
          />
          {totalProducts > pageSize && (
            <div className="pagination-controls">
              <Button 
                variant="secondary" 
                onClick={() => setProductPage(p => Math.max(0, p - 1))}
                disabled={productPage === 0}
              >
                Previous
              </Button>
              <span className="page-info">
                Page {productPage + 1} of {Math.ceil(totalProducts / pageSize)}
              </span>
              <Button 
                variant="secondary" 
                onClick={() => setProductPage(p => p + 1)}
                disabled={(productPage + 1) * pageSize >= totalProducts}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      )}

      {activeTab === 'ingredients' && (
        <Card
          title="Ingredients"
          subtitle={`${ingredients.length} of ${totalIngredients} ingredients`}
          actions={
            <div style={{ display: 'flex', gap: 'var(--spacing-md)' }}>
              <Button onClick={() => setIsTransactionModalOpen(true)} variant="secondary">
                Record Transaction
              </Button>
              <Button onClick={() => {
                setSelectedIngredient(null);
                setIsIngredientModalOpen(true);
              }}>
                + Add Ingredient
              </Button>
            </div>
          }
        >
          <div className="filters-section">
            <div className="filter-row">
              <div className="filter-group">
                <input
                  type="text"
                  placeholder="🔍 Search ingredients by name..."
                  value={ingredientSearch}
                  onChange={(e) => setIngredientSearch(e.target.value)}
                  className="filter-input"
                />
              </div>
              {ingredientSearch && (
                <Button 
                  variant="ghost" 
                  size="small"
                  onClick={() => setIngredientSearch('')}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          <IngredientsTable
            ingredients={ingredients || []}
            loading={ingredientsLoading}
            onEdit={(ingredient) => {
              setSelectedIngredient(ingredient);
              setIsIngredientModalOpen(true);
            }}
            onDelete={(id) => handleDeleteClick(id, 'ingredient')}
          />
          {totalIngredients > pageSize && (
            <div className="pagination-controls">
              <Button 
                variant="secondary" 
                onClick={() => setIngredientPage(p => Math.max(0, p - 1))}
                disabled={ingredientPage === 0}
              >
                Previous
              </Button>
              <span className="page-info">
                Page {ingredientPage + 1} of {Math.ceil(totalIngredients / pageSize)}
              </span>
              <Button 
                variant="secondary" 
                onClick={() => setIngredientPage(p => p + 1)}
                disabled={(ingredientPage + 1) * pageSize >= totalIngredients}
              >
                Next
              </Button>
            </div>
          )}
        </Card>
      )}

      <ProductFormModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        onSubmit={handleProductSubmit}
        product={selectedProduct}
      />

      <IngredientModal
        isOpen={isIngredientModalOpen}
        onClose={() => {
          setIsIngredientModalOpen(false);
          setSelectedIngredient(null);
        }}
        onSubmit={handleIngredientSubmit}
        ingredient={selectedIngredient}
      />

      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => setIsTransactionModalOpen(false)}
        onSubmit={handleTransactionSubmit}
      />

      <ConfirmDialog
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, id: null, type: null })}
        onConfirm={handleConfirmDelete}
        title={`Delete ${confirmDelete.type}?`}
        message={`Are you sure you want to delete this ${confirmDelete.type}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
      
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};

export default InventoryPage;
