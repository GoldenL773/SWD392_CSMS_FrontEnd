import React, { useState, useMemo, useContext } from 'react';
import PropTypes from 'prop-types';
import { AuthContext } from '../../context/AuthProvider.jsx';
import { useApiQuery } from '../../hooks/useApiQuery.jsx';
import { getAllProducts } from '../../api/productApi.jsx';
import { getAllIngredients } from '../../api/ingredientApi.jsx';
import Modal from '../../components/common/Modal/index.jsx';
import Button from '../../components/common/Button/index.jsx';
import { formatCurrency } from '../../utils/formatters.jsx';
import { 
  Coffee, 
  Wine, 
  Cake, 
  Bread, 
  Hamburger, 
  ForkKnife, 
  Package, 
  Tag,
  Plus,
  Minus,
  Trash,
  CheckCircle,
  Selection,
  Ticket,
  CaretLeft,
  CaretRight
} from '@phosphor-icons/react';
import { getAllCombos } from '../../api/comboApi.jsx';
import { getAllPromotions } from '../../api/promotionApi.jsx';
import './NewOrderModal.css';

const PRODUCTS_PER_PAGE = 12;

/**
 * NewOrderModal Component
 * Modal for creating new orders with product selection, ingredient stock info, and pagination
 */
const NewOrderModal = ({ isOpen, onClose, onSubmit }) => {
  const { data: productsData, loading: productsLoading } = useApiQuery(getAllProducts, { page: 0, size: 10000 }, []);
  const { data: combosData, loading: combosLoading } = useApiQuery(getAllCombos, { page: 0, size: 10000 }, []);
  const { data: promotionsData } = useApiQuery(getAllPromotions, { page: 0, size: 10000 }, []);
  const { data: ingredientsData } = useApiQuery(getAllIngredients, { page: 0, size: 10000 }, []);
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('PRODUCTS');
  const [selectedPromotion, setSelectedPromotion] = useState(null);
  const [activeVariantSelection, setActiveVariantSelection] = useState(null);
  const [productPage, setProductPage] = useState(0);
  const [comboPage, setComboPage] = useState(0);

  const products = productsData?.content || productsData || [];

  // Build ingredient lookup: id -> { name, quantity, unit }
  const ingredientLookup = useMemo(() => {
    const list = ingredientsData?.content || ingredientsData || [];
    const map = new Map();
    list.forEach((ing) => {
      map.set(String(ing.id), { name: ing.name, quantity: Number(ing.quantity ?? 0), unit: ing.unit || '' });
    });
    return map;
  }, [ingredientsData]);

  // Also by name
  const ingredientNameLookup = useMemo(() => {
    const list = ingredientsData?.content || ingredientsData || [];
    const map = new Map();
    list.forEach((ing) => {
      if (ing.name) {
        map.set(ing.name.toLowerCase(), { quantity: Number(ing.quantity ?? 0), unit: ing.unit || '' });
      }
    });
    return map;
  }, [ingredientsData]);

  const availableProducts = useMemo(() => {
    if (!products) return [];
    return products.filter(p => {
      const isAvailable = p.available !== false && p.isAvailable !== false;
      const statusCheck = !p.status || 
                          ['AVAILABLE', 'IN_STOCK', 'ACTIVE'].includes((p.status || '').toUpperCase());
      return isAvailable && statusCheck;
    });
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return availableProducts;
    const search = searchTerm.toLowerCase().trim();
    return availableProducts.filter(product =>
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search) ||
      product.categoryName?.toLowerCase().includes(search)
    );
  }, [availableProducts, searchTerm]);

  // Pagination for products
  const totalProductPages = Math.max(1, Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE));
  const paginatedProducts = useMemo(() => {
    const start = productPage * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredProducts, productPage]);

  // Reset page on search
  React.useEffect(() => { setProductPage(0); }, [searchTerm, activeTab]);

  const combos = combosData || [];
  const filteredCombos = useMemo(() => {
    if (!searchTerm.trim()) return combos;
    const search = searchTerm.toLowerCase().trim();
    return combos.filter(c => c.name?.toLowerCase().includes(search));
  }, [combos, searchTerm]);

  const totalComboPages = Math.max(1, Math.ceil(filteredCombos.length / PRODUCTS_PER_PAGE));
  const paginatedCombos = useMemo(() => {
    const start = comboPage * PRODUCTS_PER_PAGE;
    return filteredCombos.slice(start, start + PRODUCTS_PER_PAGE);
  }, [filteredCombos, comboPage]);

  // Get ingredient stock status for a product
  const getIngredientStatus = (product) => {
    const ings = product.ingredients || product.productIngredients || [];
    if (!ings || ings.length === 0) return [];
    return ings.map(pi => {
      const ingId = String(pi.ingredientId);
      const stock = ingredientLookup.get(ingId);
      const name = stock?.name || pi.ingredientName || `Ing #${pi.ingredientId}`;
      const stockQty = stock?.quantity ?? 0;
      const required = Number(pi.quantity ?? 0);
      const unit = stock?.unit || pi.unit || '';
      let status = 'ok';
      if (stockQty <= 0) status = 'out';
      else if (stockQty < required * 5) status = 'low';
      return { name, stockQty, required, unit, status };
    });
  };

  const addItem = (product) => {
    const existingItem = selectedItems.find(item => item.productId === product.id && !item.variantId);
    if (existingItem) {
      setSelectedItems(selectedItems.map(item =>
        (item.productId === product.id && !item.variantId)
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

  const updateQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      setSelectedItems(selectedItems.filter(item => getItemKey(item) !== itemKey));
    } else {
      setSelectedItems(selectedItems.map(item =>
        getItemKey(item) === itemKey
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const removeItem = (itemKey) => {
    setSelectedItems(selectedItems.filter(item => getItemKey(item) !== itemKey));
  };

  const [sortConfig, setSortConfig] = useState({ key: 'productName', direction: 'asc' });

  const sortedItems = useMemo(() => {
    const sortableItems = [...selectedItems];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [selectedItems, sortConfig]);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getItemKey = (item) => `${item.productId || ''}-${item.variantId || ''}-${item.comboId || ''}`;

  const totalAmount = useMemo(() => {
    return selectedItems.reduce((sum, item) => sum + ((Number(item.price) || 0) * item.quantity), 0);
  }, [selectedItems]);

  const discountValue = Number(selectedPromotion?.discountValue || 0);
  const discountPct = Number(selectedPromotion?.discountPercentage || 0);
  
  const discountAmount = useMemo(() => {
    if (!selectedPromotion) return 0;
    
    const val = Number(selectedPromotion.discountValue);
    const pct = Number(selectedPromotion.discountPercentage);
    
    // Type-specific logic
    if (selectedPromotion.discountType === 'FIXED') {
      return isNaN(val) ? 0 : val;
    }
    
    // Percentage logic - prefer discountPercentage, fallback to discountValue if it looks like a percentage
    let percentage = 0;
    if (!isNaN(pct)) {
      percentage = pct;
    } else if (!isNaN(val) && val <= 100) {
      percentage = val;
    }
    
    return totalAmount * (percentage / 100);
  }, [selectedPromotion, totalAmount]);

  const finalTotal = Math.max(0, totalAmount - (Number(discountAmount) || 0));

  const { user } = useContext(AuthContext);

  const handleSubmit = () => {
    if (selectedItems.length === 0) {
      alert('Please add at least one item to the order');
      return;
    }
    
    const finalItems = selectedItems.map(item => ({
      productId: item.productId,
      variantId: item.variantId,
      comboId: item.comboId,
      quantity: item.quantity,
      price: item.price,
      type: item.comboId ? 'COMBO' : 'PRODUCT'
    }));

    const orderData = {
      orderItems: finalItems,
      promotionId: selectedPromotion?.id,
      totalAmount: finalTotal,
      employeeName: user?.fullName || user?.username || 'System',
      note: ''
    };

    onSubmit(orderData);
    setSelectedItems([]);
    setSearchTerm('');
    setSelectedPromotion(null);
  };

  const handleClose = () => {
    setSelectedItems([]);
    setSearchTerm('');
    setSelectedPromotion(null);
    onClose();
  };

  const iconMap = {
    'Coffee': <Coffee size={24} />,
    'Tea': <Coffee size={24} />,
    'Wine': <Wine size={24} />,
    'Cocktail': <Wine size={24} />,
    'Cake': <Cake size={24} />,
    'Pastry': <Bread size={24} />,
    'Bread': <Bread size={24} />,
    'Burger': <Hamburger size={24} />,
    'Snack': <ForkKnife size={24} />,
    'Food': <ForkKnife size={24} />,
    'Other': <Package size={24} />
  };

  const getIcon = (category) => {
    return iconMap[category] || <Package size={24} />;
  };

  const addCombo = (combo) => {
    const existingItem = selectedItems.find(item => item.comboId === combo.id);
    if (existingItem) {
      setSelectedItems(selectedItems.map(item =>
        item.comboId === combo.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, {
        comboId: combo.id,
        productName: combo.name,
        price: combo.price,
        quantity: 1
      }]);
    }
  };

  const handleProductClick = (product) => {
    if (product.variants && product.variants.length > 0) {
      setActiveVariantSelection(product);
    } else {
      addItem(product);
    }
  };

  const addVariant = (product, variant) => {
    const existingItem = selectedItems.find(item => item.productId === product.id && item.variantId === variant.id);
    if (existingItem) {
      setSelectedItems(selectedItems.map(item =>
        (item.productId === product.id && item.variantId === variant.id)
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setSelectedItems([...selectedItems, {
        productId: product.id,
        variantId: variant.id,
        productName: `${product.name} (${variant.size}${variant.temperature ? ', ' + variant.temperature : ''})`,
        price: variant.price,
        quantity: 1
      }]);
    }
    setActiveVariantSelection(null);
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
          {/* Product/Combo Selection */}
          <div className="selection-area">
            <div className="selection-tabs">
              <button 
                className={`tab-btn ${activeTab === 'PRODUCTS' ? 'active' : ''}`}
                onClick={() => setActiveTab('PRODUCTS')}
              >
                <Package size={20} /> Products
              </button>
              <button 
                className={`tab-btn ${activeTab === 'COMBOS' ? 'active' : ''}`}
                onClick={() => setActiveTab('COMBOS')}
              >
                <Tag size={20} /> Combos
              </button>
            </div>

            <div className="selection-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder={`Search ${activeTab.toLowerCase()}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="grid-container">
              {activeTab === 'PRODUCTS' ? (
                <>
                  <div className="product-grid">
                    {(productsLoading) ? (
                      <div className="loading-state">Loading products...</div>
                    ) : paginatedProducts.length === 0 ? (
                      <div className="no-results">No products found</div>
                    ) : (
                      paginatedProducts.map((product) => {
                        const isOutOfStock = product.availabilityStatus === 'OUT_OF_STOCK';
                        const ingStatus = getIngredientStatus(product);
                        return (
                          <div 
                            key={product.id} 
                            className={`product-card ${isOutOfStock ? 'disabled' : ''}`}
                            onClick={() => !isOutOfStock && handleProductClick(product)}
                          >
                            <div className="product-icon-wrapper">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} style={{width: 40, height: 40, borderRadius: '50%', objectFit: 'cover'}} />
                              ) : getIcon(product.category || product.categoryName)}
                            </div>
                            <div className="product-info">
                              <h4>{product.name}</h4>
                              <span className="product-category">{product.categoryName || product.category || ''}</span>
                              <div className="product-price">{formatCurrency(product.price)}</div>
                              {product.variants?.length > 0 && (
                                <span className="variant-badge">
                                  <Selection size={12} /> {product.variants.length} Variants
                                </span>
                              )}
                            </div>
                            {ingStatus.length > 0 && (
                              <div className="product-ingredients">
                                {ingStatus.slice(0, 3).map((ing, i) => (
                                  <span key={i} className={`ing-${ing.status}`}>
                                    {ing.name}: {ing.stockQty.toFixed(1)} {ing.unit} {ing.status === 'out' ? '⚠' : ''}
                                  </span>
                                ))}
                                {ingStatus.length > 3 && <span>+{ingStatus.length - 3} more</span>}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                  {totalProductPages > 1 && (
                    <div className="grid-pagination">
                      <button disabled={productPage === 0} onClick={() => setProductPage(p => p - 1)}>
                        <CaretLeft size={14} /> Prev
                      </button>
                      <span>{productPage + 1} / {totalProductPages}</span>
                      <button disabled={productPage >= totalProductPages - 1} onClick={() => setProductPage(p => p + 1)}>
                        Next <CaretRight size={14} />
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="combo-grid">
                    {combosLoading ? (
                      <div className="loading-state">Loading combos...</div>
                    ) : paginatedCombos.length === 0 ? (
                      <div className="no-results">No combos found</div>
                    ) : (
                      paginatedCombos.map((combo) => (
                        <div 
                          key={combo.id} 
                          className="product-card"
                          onClick={() => addCombo(combo)}
                        >
                          <div className="product-icon-wrapper combo-icon">
                            {combo.imageUrl ? (
                              <img src={combo.imageUrl} alt={combo.name} style={{width: 40, height: 40, borderRadius: '50%', objectFit: 'cover'}} />
                            ) : <Tag size={24} weight="fill" />}
                          </div>
                          <div className="product-info">
                            <h4>{combo.name}</h4>
                            <span className="combo-desc">{combo.description}</span>
                            <div className="product-price">{formatCurrency(combo.price)}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {totalComboPages > 1 && (
                    <div className="grid-pagination">
                      <button disabled={comboPage === 0} onClick={() => setComboPage(p => p - 1)}>
                        <CaretLeft size={14} /> Prev
                      </button>
                      <span>{comboPage + 1} / {totalComboPages}</span>
                      <button disabled={comboPage >= totalComboPages - 1} onClick={() => setComboPage(p => p + 1)}>
                        Next <CaretRight size={14} />
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary">
            <div className="summary-header">
              <h3>Order Summary</h3>
              <div className="summary-count">{selectedItems.length} items</div>
            </div>

            {selectedItems.length === 0 ? (
              <div className="empty-order">
                <p>No items added yet</p>
                <p className="hint">Click on products or combos to add them</p>
              </div>
            ) : (
              <>
                <div className="order-items-table">
                  <div className="table-header">
                    <div 
                      className={`header-cell sortable ${sortConfig.key === 'productName' ? 'active' : ''}`}
                      onClick={() => requestSort('productName')}
                    >
                      Item {sortConfig.key === 'productName' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                    <div 
                      className={`header-cell sortable ${sortConfig.key === 'quantity' ? 'active' : ''}`}
                      onClick={() => requestSort('quantity')}
                    >
                      Qty {sortConfig.key === 'quantity' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                    <div 
                      className={`header-cell sortable ${sortConfig.key === 'price' ? 'active' : ''}`}
                      onClick={() => requestSort('price')}
                    >
                      Total {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </div>
                    <div className="header-cell action"></div>
                  </div>
                  <div className="order-items">
                    {sortedItems.map((item, index) => {
                      const key = getItemKey(item);
                      const itemTotal = (Number(item.price) || 0) * item.quantity;
                      return (
                        <div key={`${key}-${index}`} className="order-item">
                          <div className="item-info">
                            <h4>{item.productName}</h4>
                            <span className="item-price-unit">{formatCurrency(item.price)}</span>
                          </div>
                          <div className="item-controls">
                            <button
                              className="qty-btn"
                              onClick={(e) => { e.stopPropagation(); updateQuantity(key, item.quantity - 1); }}
                              title="Decrease"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="quantity">{item.quantity}</span>
                            <button
                              className="qty-btn"
                              onClick={(e) => { e.stopPropagation(); updateQuantity(key, item.quantity + 1); }}
                              title="Increase"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <div className="item-subtotal">
                            {formatCurrency(itemTotal)}
                          </div>
                          <button
                            className="remove-btn"
                            onClick={(e) => { e.stopPropagation(); removeItem(key); }}
                            title="Remove item"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="promotion-section">
                   <h4><Ticket size={18} /> Promotions</h4>
                   <select 
                     className="promotion-select"
                     value={selectedPromotion?.id || ''}
                     onChange={(e) => {
                       const promo = (promotionsData || []).find(p => p.id === parseInt(e.target.value));
                       setSelectedPromotion(promo || null);
                     }}
                   >
                     <option value="">No promotion</option>
                      {(promotionsData || []).filter(p => p.status === 'ACTIVE').map(promo => {
                        const val = Number(promo.discountValue || 0);
                        const displayVal = isNaN(val) ? '0' : (promo.discountType === 'PERCENTAGE' ? `${val}%` : formatCurrency(val));
                        return (
                          <option key={promo.id} value={promo.id}>
                            {promo.name} ({displayVal} off)
                          </option>
                        );
                      })}
                   </select>
                </div>

                <div className="order-summary-footer">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(totalAmount)}</span>
                  </div>
                  {selectedPromotion && (
                    <div className="summary-row discount">
                      <span>Discount ({selectedPromotion.discountType === 'PERCENTAGE' ? `${discountPct}%` : 'Fixed'}):</span>
                      <span>-{formatCurrency(discountAmount)}</span>
                    </div>
                  )}
                  <div className="order-total">
                    <span>Total Amount:</span>
                    <span className="total-value">
                      {formatCurrency(finalTotal)}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Variant Selection Modal Overlay */}
        {activeVariantSelection && (
          <div className="variant-selection-overlay" onClick={() => setActiveVariantSelection(null)}>
            <div className="variant-modal" onClick={(e) => e.stopPropagation()}>
              <div className="variant-modal-header">
                <h3>Select Variant for {activeVariantSelection.name}</h3>
                <button className="close-btn" onClick={() => setActiveVariantSelection(null)}>✕</button>
              </div>
              <div className="variant-list">
                {activeVariantSelection.variants.map(variant => (
                  <div 
                    key={variant.id} 
                    className="variant-option"
                    onClick={() => addVariant(activeVariantSelection, variant)}
                  >
                    <div className="variant-name">{variant.size}{variant.temperature ? `, ${variant.temperature}` : ''}</div>
                    <div className="variant-price">{formatCurrency(variant.price)}</div>
                    <CheckCircle size={20} className="check-icon" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

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
