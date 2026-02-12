import React from 'react';
import { SupplierManager } from '../features/suppliers/index.js';
import './SuppliersPage.css';

/**
 * SuppliersPage Component
 * Page for managing suppliers (Manager only)
 */
const SuppliersPage = () => {
  // Mock data - replace with actual API calls
  const suppliers = [];
  const ingredients = [];

  const handleCreateSupplier = (supplierData) => {
    console.log('Create supplier:', supplierData);
    // TODO: Implement API call
  };

  const handleUpdateSupplier = (supplierId, supplierData) => {
    console.log('Update supplier:', supplierId, supplierData);
    // TODO: Implement API call
  };

  const handleDeleteSupplier = (supplierId) => {
    console.log('Delete supplier:', supplierId);
    // TODO: Implement API call
  };

  return (
    <div className="suppliers-page">
      <SupplierManager
        suppliers={suppliers}
        ingredients={ingredients}
        onCreateSupplier={handleCreateSupplier}
        onUpdateSupplier={handleUpdateSupplier}
        onDeleteSupplier={handleDeleteSupplier}
      />
    </div>
  );
};

export default SuppliersPage;
