import React, { useState } from 'react';
import { SupplierManager } from '../features/suppliers/index.js';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getAllSuppliers, createSupplier, updateSupplier, deleteSupplier } from '../api/supplierApi.jsx';
import { getAllIngredients } from '../api/ingredientApi.jsx';
import { useToast } from '../hooks/useToast.jsx';
import ToastContainer from '../components/common/Toast/ToastContainer.jsx';
import './SuppliersPage.css';

/**
 * SuppliersPage Component
 * Page for managing suppliers (Manager only)
 */
const SuppliersPage = () => {
  const toast = useToast();
  // Fetch suppliers and ingredients
  const { data: suppliersData, loading: loadingSuppliers, refetch: refetchSuppliers } = useApiQuery(getAllSuppliers, {}, []);
  const { data: ingredientsData, loading: loadingIngredients } = useApiQuery(getAllIngredients, { size: 1000 }, []);
  
  const suppliers = suppliersData || [];
  const ingredients = ingredientsData?.content || ingredientsData || [];

  const handleCreateSupplier = async (supplierData) => {
    try {
      await createSupplier(supplierData);
      toast.success('Supplier created successfully');
      refetchSuppliers();
    } catch (error) {
      toast.error(error.message || 'Failed to create supplier');
    }
  };

  const handleUpdateSupplier = async (supplierId, supplierData) => {
    try {
      await updateSupplier(supplierId, supplierData);
      toast.success('Supplier updated successfully');
      refetchSuppliers();
    } catch (error) {
      toast.error(error.message || 'Failed to update supplier');
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    try {
      await deleteSupplier(supplierId);
      toast.success('Supplier deleted successfully');
      refetchSuppliers();
    } catch (error) {
      toast.error(error.message || 'Failed to delete supplier');
    }
  };

  if (loadingSuppliers || loadingIngredients) {
    return <div className="loading-container"><div className="loading"></div><p>Loading suppliers...</p></div>;
  }

  return (
    <div className="suppliers-page">
      <SupplierManager
        suppliers={suppliers}
        ingredients={ingredients}
        onCreateSupplier={handleCreateSupplier}
        onUpdateSupplier={handleUpdateSupplier}
        onDeleteSupplier={handleDeleteSupplier}
      />
      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
    </div>
  );
};

export default SuppliersPage;
