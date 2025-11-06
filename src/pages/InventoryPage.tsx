import React, { useState } from 'react';
import { useApiQuery, useApiMutation } from '../hooks/useApiQuery.tsx';
import { getAllProducts, createProduct, updateProduct, deleteProduct } from '../api/productApi.tsx';
import { getAllIngredients, createIngredient, updateIngredient, deleteIngredient } from '../api/ingredientApi.tsx';
import Card from '../components/common/Card/index.tsx';
import Modal from '../components/common/Modal/index.tsx';
import Button from '../components/common/Button/index.tsx';
import ProductsTable from '../features/inventory/ProductsTable.tsx';
import IngredientsTable from '../features/inventory/IngredientsTable.tsx';
import ProductForm from '../features/inventory/ProductForm.tsx';
import './InventoryPage.css';

const InventoryPage = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

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

  const handleProductDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProductMutation(id);
        refetchProducts();
      } catch (error) {
        alert('Error deleting product: ' + error.message);
      }
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
              Add Product
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
            onDelete={handleProductDelete}
          />
        </Card>
      )}

      {activeTab === 'ingredients' && (
        <Card
          title="Ingredients"
          subtitle={`${ingredients?.length || 0} ingredients`}
          actions={
            <Button onClick={() => setIsIngredientModalOpen(true)}>
              Add Ingredient
            </Button>
          }
        >
          <IngredientsTable
            ingredients={ingredients || []}
            loading={ingredientsLoading}
            onEdit={(ingredient) => {
              setSelectedIngredient(ingredient);
              setIsIngredientModalOpen(true);
            }}
            onDelete={(id) => alert('Delete ingredient: ' + id)}
          />
        </Card>
      )}

      <Modal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProduct(null);
        }}
        title={selectedProduct ? 'Edit Product' : 'Add New Product'}
      >
        <ProductForm
          product={selectedProduct}
          onSubmit={handleProductSubmit}
          onCancel={() => {
            setIsProductModalOpen(false);
            setSelectedProduct(null);
          }}
          loading={creating || updating}
        />
      </Modal>
    </div>
  );
};

export default InventoryPage;
