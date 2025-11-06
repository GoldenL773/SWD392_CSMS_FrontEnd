import React, { useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useApiQuery } from '../../hooks/useApiQuery.jsx';
import { getAllProducts } from '../../api/productApi.jsx';
import Modal from '../../components/common/Modal/index.jsx';
import Button from '../../components/common/Button/index.jsx';
import { formatCurrency } from '../../utils/formatters.jsx';
import './NewOrderModal.css';

/**
 * NewOrderModal Component
 * Modal for creating new orders with product selection
 */
const NewOrderModal = ({ isOpen, onClose, onSubmit }) => {
  const { data: productsData, loading } = useApiQuery(getAllProducts, { size: 1000 }, []);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Extract products from paginated response
  const products = productsData?.content || productsData || [];

  // Filter available products (status: Available or AVAILABLE)
  const availableProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => 
      p.status && (p.status.toUpperCase() === 'AVAILABLE' || p.status === 'Available')
    );
  }, [products]);

  // Filter products by search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return availableProducts;
    
    const search = searchTerm.toLowerCase().trim();
    return availableProducts.filter(product =>
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search)
    );
  }, [availableProducts, searchTerm]);

  const addItem = (product) => {
    const existingItem = selectedItems.find(item => item.productId === product.id);
    if (existingItem) {
      setSelectedItems(selectedItems.map(item =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, {
        productId: product.id,
        productName: product.name,
        price: product.price,
        quantity: 1
      }]);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedItems(selectedItems.filter(item => item.productId !== productId));
    } else {
      setSelectedItems(selectedItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeItem = (productId) => {
    setSelectedItems(selectedItems.filter(item => item.productId !== productId));
  };

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }, [selectedItems]);

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }

    const orderData = {
      orderItems: selectedItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      totalAmount,
      status: 'PENDING'
    };

    onSubmit(orderData);
    setSelectedItems([]);
    setSearchTerm('');
  };

  const handleClose = () => {
    setSelectedItems([]);
    setSearchTerm('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Order"
      size="large"
    >
      <div className="new-order-modal">
        <div className="order-content">
          {/* Product Selection */}
          <div className="product-selection">
            <h3>Select Products</h3>
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <div className="product-grid">
              {loading ? (
                <div className="loading-products">Loading products...</div>
              ) : filteredProducts.length === 0 ? (
                <div className="no-products">
                  {searchTerm ? 'No products found matching your search' : 'No available products'}
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="product-card" onClick={() => addItem(product)}>
                    <div className="product-info">
                      <h4>{product.name}</h4>
                      <span className="product-category">{product.category}</span>
                    </div>
                    <div className="product-price">{formatCurrency(product.price)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <h3>Order Summary</h3>
            {selectedItems.length === 0 ? (
              <div className="empty-order">
                <p>No items added yet</p>
                <p className="hint">Click on products to add them</p>
              </div>
            ) : (
              <>
                <div className="order-items">
                  {selectedItems.map((item) => (
                    <div key={item.productId} className="order-item">
                      <div className="item-info">
                        <h4>{item.productName}</h4>
                        <span className="item-price">{formatCurrency(item.price)}</span>
                      </div>
                      <div className="item-controls">
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          −
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </button>
                        <button
                          className="remove-btn"
                          onClick={() => removeItem(item.productId)}
                        >
                          ✕
                        </button>
                      </div>
                      <div className="item-subtotal">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="order-total">
                  <span>Total Amount:</span>
                  <span className="total-value">{formatCurrency(totalAmount)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={selectedItems.length === 0}
          >
            Create Order
          </Button>
        </div>
      </div>
    </Modal>
  );
};

NewOrderModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired
};

export default NewOrderModal;
