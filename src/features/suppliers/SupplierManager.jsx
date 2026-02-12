import React, { useState } from 'react';
import { Truck, Plus, Pencil, Trash, X, Check, Eye, MagnifyingGlass, Funnel } from '@phosphor-icons/react';
import './SupplierManager.css';

/**
 * SupplierManager Component
 * Manages supplier information and relationships
 * Allows creating, editing, viewing, and deleting suppliers
 */
const SupplierManager = ({ 
  suppliers = [], 
  ingredients = [],
  onCreateSupplier, 
  onUpdateSupplier, 
  onDeleteSupplier 
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [viewingSupplier, setViewingSupplier] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    providedIngredients: [],
    status: 'Active'
  });

  const [errors, setErrors] = useState({});

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      email: '',
      phone: '',
      address: '',
      providedIngredients: [],
      status: 'Active'
    });
    setErrors({});
    setEditingSupplier(null);
    setIsFormOpen(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsFormOpen(true);
  };

  const handleOpenEdit = (supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      providedIngredients: supplier.providedIngredients || [],
      status: supplier.status
    });
    setIsFormOpen(true);
  };

  const handleViewDetails = (supplier) => {
    setViewingSupplier(supplier);
  };

  const handleIngredientToggle = (ingredientId) => {
    setFormData(prev => ({
      ...prev,
      providedIngredients: prev.providedIngredients.includes(ingredientId)
        ? prev.providedIngredients.filter(id => id !== ingredientId)
        : [...prev.providedIngredients, ingredientId]
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required';
    }

    if (!formData.contactPerson.trim()) {
      newErrors.contactPerson = 'Contact person is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+\-\s()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const supplierData = {
      name: formData.name,
      contactPerson: formData.contactPerson,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      providedIngredients: formData.providedIngredients,
      status: formData.status
    };

    if (editingSupplier) {
      onUpdateSupplier(editingSupplier.id, supplierData);
    } else {
      onCreateSupplier(supplierData);
    }

    resetForm();
  };

  const handleDelete = (supplierId) => {
    onDeleteSupplier(supplierId);
    setDeleteConfirmId(null);
  };

  const getIngredientName = (ingredientId) => {
    const ingredient = ingredients.find(ing => ing.id === ingredientId);
    return ingredient ? ingredient.name : 'Unknown';
  };

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="supplier-manager">
      <div className="supplier-manager-header">
        <div className="header-content">
          <Truck size={32} weight="thin" />
          <div>
            <h2>Supplier Management</h2>
            <p>Manage supplier information and relationships</p>
          </div>
        </div>
        <button className="btn-primary" onClick={handleOpenCreate}>
          <Plus size={20} weight="bold" />
          Add Supplier
        </button>
      </div>

      {/* Search and Filter */}
      <div className="supplier-controls">
        <div className="search-bar">
          <MagnifyingGlass size={20} weight="thin" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-group">
          <Funnel size={20} weight="thin" />
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Supplier Table */}
      <div className="supplier-table-container">
        {filteredSuppliers.length === 0 ? (
          <div className="empty-state">
            <Truck size={64} weight="thin" />
            <p>No suppliers found</p>
            <button className="btn-secondary" onClick={handleOpenCreate}>
              Add your first supplier
            </button>
          </div>
        ) : (
          <table className="supplier-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map(supplier => (
                <tr key={supplier.id}>
                  <td className="supplier-name">{supplier.name}</td>
                  <td>{supplier.contactPerson}</td>
                  <td>{supplier.phone}</td>
                  <td>{supplier.email}</td>
                  <td>
                    <span className={`status-badge ${supplier.status.toLowerCase()}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-icon" 
                        onClick={() => handleViewDetails(supplier)}
                        title="View details"
                      >
                        <Eye size={20} weight="thin" />
                      </button>
                      <button 
                        className="btn-icon" 
                        onClick={() => handleOpenEdit(supplier)}
                        title="Edit supplier"
                      >
                        <Pencil size={20} weight="thin" />
                      </button>
                      <button 
                        className="btn-icon btn-danger" 
                        onClick={() => setDeleteConfirmId(supplier.id)}
                        title="Delete supplier"
                      >
                        <Trash size={20} weight="thin" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content modal-small" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Confirm Delete</h3>
              <button className="btn-close" onClick={() => setDeleteConfirmId(null)}>
                <X size={24} weight="bold" />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete this supplier? This action cannot be undone.</p>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteConfirmId(null)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={() => handleDelete(deleteConfirmId)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Supplier Form Modal */}
      {isFormOpen && (
        <div className="modal-overlay" onClick={resetForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h3>
              <button className="btn-close" onClick={resetForm}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="supplier-form">
              {/* Basic Information */}
              <div className="form-section">
                <h4>Basic Information</h4>
                
                <div className="form-group">
                  <label htmlFor="supplier-name">
                    Supplier Name <span className="required">*</span>
                  </label>
                  <input
                    id="supplier-name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={errors.name ? 'error' : ''}
                    placeholder="e.g., ABC Coffee Beans Co."
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="contact-person">
                      Contact Person <span className="required">*</span>
                    </label>
                    <input
                      id="contact-person"
                      type="text"
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                      className={errors.contactPerson ? 'error' : ''}
                      placeholder="e.g., John Doe"
                    />
                    {errors.contactPerson && <span className="error-message">{errors.contactPerson}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Status</label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="form-section">
                <h4>Contact Information</h4>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="email">
                      Email <span className="required">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={errors.email ? 'error' : ''}
                      placeholder="supplier@example.com"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">
                      Phone <span className="required">*</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={errors.phone ? 'error' : ''}
                      placeholder="+84 123 456 789"
                    />
                    {errors.phone && <span className="error-message">{errors.phone}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter full address..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Provided Ingredients */}
              <div className="form-section">
                <h4>Provided Ingredients</h4>
                <p className="section-description">Select the ingredients this supplier provides</p>
                
                <div className="ingredients-grid">
                  {ingredients.length === 0 ? (
                    <p className="no-ingredients">No ingredients available</p>
                  ) : (
                    ingredients.map(ingredient => (
                      <label key={ingredient.id} className="ingredient-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.providedIngredients.includes(ingredient.id)}
                          onChange={() => handleIngredientToggle(ingredient.id)}
                        />
                        <span>{ingredient.name}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Form Actions */}
              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingSupplier ? 'Update Supplier' : 'Add Supplier'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {viewingSupplier && (
        <div className="modal-overlay" onClick={() => setViewingSupplier(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Supplier Details</h3>
              <button className="btn-close" onClick={() => setViewingSupplier(null)}>
                <X size={24} weight="bold" />
              </button>
            </div>

            <div className="supplier-details">
              <div className="detail-section">
                <h4>Basic Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Supplier Name</span>
                    <span className="detail-value">{viewingSupplier.name}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Contact Person</span>
                    <span className="detail-value">{viewingSupplier.contactPerson}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Status</span>
                    <span className={`status-badge ${viewingSupplier.status.toLowerCase()}`}>
                      {viewingSupplier.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Contact Information</h4>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">Email</span>
                    <span className="detail-value">{viewingSupplier.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Phone</span>
                    <span className="detail-value">{viewingSupplier.phone}</span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{viewingSupplier.address || 'Not provided'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Provided Ingredients</h4>
                {viewingSupplier.providedIngredients && viewingSupplier.providedIngredients.length > 0 ? (
                  <div className="ingredients-list">
                    {viewingSupplier.providedIngredients.map(ingredientId => (
                      <span key={ingredientId} className="ingredient-tag">
                        {getIngredientName(ingredientId)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="no-data">No ingredients specified</p>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setViewingSupplier(null)}>
                Close
              </button>
              <button 
                className="btn-primary" 
                onClick={() => {
                  setViewingSupplier(null);
                  handleOpenEdit(viewingSupplier);
                }}
              >
                Edit Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManager;
