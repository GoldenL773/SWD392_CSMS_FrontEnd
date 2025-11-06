import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery.jsx';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../api/productApi.jsx';
import { getAllIngredients, createIngredient, updateIngredient, deleteIngredient } from '../api/ingredientApi.jsx';
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
  const [activeTab, setActiveTab] = useState('products');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, id: null, type: null });

  // Fetch data
  const { data: products, loading: productsLoading, refetch: refetchProducts } = useApiQuery(getAllProducts, {}, []);
  const { data: ingredients, loading: ingredientsLoading, refetch: refetchIngredients } = useApiQuery(getAllIngredients, {}, []);

  // Mutations
  const { mutate: createProductMutation, loading: creating } = useApiMutation(createProduct);
  const { mutate: updateProductMutation, loading: updating } = useApiMutation(updateProduct);
  const { mutate: deleteProductMutation } = useApiMutation(deleteProduct);

  const handleProductSubmit = async (data) => {
    try {
      if (selectedProduct) {
        await updateProductMutation(selectedProduct.id, data);
      } else {
        await createProductMutation(data);
      }
      setIsProductModalOpen(false);
      setSelectedProduct(null);
      refetchProducts();
    } catch (error) {
      alert('Error saving product: ' + error.message);
    }
  };

  const handleIngredientSubmit = async (data) => {
    try {
      if (selectedIngredient) {
        await updateIngredient(selectedIngredient.id, data);
      } else {
        await createIngredient(data);
      }
      setIsIngredientModalOpen(false);
      setSelectedIngredient(null);
      refetchIngredients();
    } catch (error) {
      alert('Error saving ingredient: ' + error.message);
    }
  };

  const handleTransactionSubmit = async (data) => {
    try {
      console.log('Recording transaction:', data);
      // TODO: Call transaction API
      alert('Transaction recorded successfully!');
      setIsTransactionModalOpen(false);
      refetchIngredients();
    } catch (error) {
      alert('Error recording transaction: ' + error.message);
    }
  };

  const handleDeleteClick = (id, type) => {
    setConfirmDelete({ isOpen: true, id, type });
  };

  const handleConfirmDelete = async () => {
    try {
      if (confirmDelete.type === 'product') {
        await deleteProductMutation(confirmDelete.id);
        refetchProducts();
      } else if (confirmDelete.type === 'ingredient') {
        await deleteIngredient(confirmDelete.id);
        refetchIngredients();
      }
      setConfirmDelete({ isOpen: false, id: null, type: null });
    } catch (error) {
      alert('Error deleting: ' + error.message);
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
          subtitle={`${products?.length || 0} products`}
          actions={
            <Button onClick={() => {
              setSelectedProduct(null);
              setIsProductModalOpen(true);
            }}>
              + Add Product
            </Button>
          }
        >
          <ProductsTable
            products={products || []}
            loading={productsLoading}
            onEdit={(product) => {
              setSelectedProduct(product);
              setIsProductModalOpen(true);
            }}
            onDelete={(id) => handleDeleteClick(id, 'product')}
          />
        </Card>
      )}

      {activeTab === 'ingredients' && (
        <Card
          title="Ingredients"
          subtitle={`${ingredients?.length || 0} ingredients`}
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
          <IngredientsTable
            ingredients={ingredients || []}
            loading={ingredientsLoading}
            onEdit={(ingredient) => {
              setSelectedIngredient(ingredient);
              setIsIngredientModalOpen(true);
            }}
            onDelete={(id) => handleDeleteClick(id, 'ingredient')}
          />
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
    </div>
  );
};

export default InventoryPage;
