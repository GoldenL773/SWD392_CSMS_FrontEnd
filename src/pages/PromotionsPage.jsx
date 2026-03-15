import React, { useState, useEffect } from 'react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { useToast } from '../hooks/useToast.jsx';
import { getAllPromotions, createPromotion, updatePromotion, deletePromotion } from '../api/promotionApi.jsx';
import { getAllProducts } from '../api/productApi.jsx';
import { getAllCombos } from '../api/comboApi.jsx';
import { formatCurrency } from '../utils/formatters.jsx';
import ToastContainer from '../components/common/Toast/ToastContainer.jsx';
import { Tag, Plus, PencilSimple, Trash, CheckCircle, XCircle, Warning } from '@phosphor-icons/react';
import './PromotionsPage.css';

const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED'];
const APPLY_TO_TYPES = ['PRODUCT', 'COMBO', 'CATEGORY'];
const STATUS_OPTIONS = ['ACTIVE', 'INACTIVE'];

const emptyForm = {
  name: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  applyTo: 'PRODUCT',
  targetId: '',
  startDate: '',
  endDate: '',
  status: 'ACTIVE',
};

const PromotionsPage = () => {
  const toast = useToast();

  const { data: rawPromotions, loading, refetch } = useApiQuery(getAllPromotions, {}, []);
  const { data: productsData } = useApiQuery(getAllProducts, { size: 1000 }, []);
  const { data: combosData } = useApiQuery(getAllCombos, {}, []);
  const [categoriesData, setCategoriesData] = useState([]);
  
  useEffect(() => {
    const fetchCats = async () => {
      try {
        const cats = await getAllCategories();
        setCategoriesData(cats);
      } catch (e) {
        console.error("Failed to fetch categories", e);
      }
    };
    fetchCats();
  }, []);

  const promotions = Array.isArray(rawPromotions) ? rawPromotions : rawPromotions?.content || [];
  const products = productsData?.content || productsData || [];
  const combos = combosData?.content || combosData || [];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('ALL');

  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [detailPromotion, setDetailPromotion] = useState(null);

  const openCreate = () => {
    setEditingPromotion(null);
    setFormData(emptyForm);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const openEdit = (promo) => {
    setEditingPromotion(promo);
    setFormData({
      name: promo.name || '',
      discountType: promo.discountType || 'PERCENTAGE',
      discountValue: promo.discountValue?.toString() || '',
      applyTo: promo.applyTo || 'PRODUCT',
      targetId: promo.targetId?.toString() || promo.productId?.toString() || promo.comboId?.toString() || '',
      startDate: promo.startDate ? promo.startDate.split('T')[0] : '',
      endDate: promo.endDate ? promo.endDate.split('T')[0] : '',
      status: promo.status || 'ACTIVE',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Promotion name is required';

    const value = parseFloat(formData.discountValue);
    if (!formData.discountValue || value <= 0) {
      errs.discountValue = 'Discount value must be greater than 0';
    }
    if (formData.discountType === 'PERCENTAGE' && value > 100) {
      errs.discountValue = 'Percentage discount cannot exceed 100%';
    }
    if (!formData.targetId) errs.targetId = 'Please select an item to apply the promotion to';
    if (!formData.startDate) errs.startDate = 'Start date is required';
    if (!formData.endDate) errs.endDate = 'End date is required';
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      errs.endDate = 'End date must be after start date';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      name: formData.name.trim(),
      discountType: formData.discountType,
      discountValue: parseFloat(formData.discountValue),
      applyTo: formData.applyTo,
      ...(formData.applyTo === 'PRODUCT'
        ? { productId: parseInt(formData.targetId) }
        : formData.applyTo === 'COMBO'
          ? { comboId: parseInt(formData.targetId) }
          : { categoryId: parseInt(formData.targetId) }),
      targetId: parseInt(formData.targetId),
      startDate: formData.startDate ? formData.startDate + 'T00:00:00' : null,
      endDate: formData.endDate ? formData.endDate + 'T23:59:59' : null,
      status: formData.status,
    };

    try {
      if (editingPromotion) {
        await updatePromotion(editingPromotion.id, payload);
        toast.success('Promotion updated successfully!');
      } else {
        await createPromotion(payload);
        toast.success('Promotion created successfully!');
      }
      setIsModalOpen(false);
      refetch();
    } catch (err) {
      const msg = err.message || 'Operation failed';
      if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('already')) {
        setFormErrors(prev => ({ ...prev, name: 'Promotion name already exists' }));
      } else {
        toast.error(msg);
      }
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePromotion(id);
      toast.success('Promotion deleted');
      setDeleteConfirmId(null);
      refetch();
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    }
  };

  const getStatusBadge = (status) => {
    if (status === 'ACTIVE') return <span className="promo-badge promo-badge--active"><CheckCircle size={14} />Active</span>;
    return <span className="promo-badge promo-badge--inactive"><XCircle size={14} />Inactive</span>;
  };

  const isExpired = (endDate) => endDate && new Date(endDate) < new Date();

  const filtered = filterStatus === 'ALL' ? promotions : promotions.filter(p => p.status === filterStatus);
  
  const categories = categoriesData;

  const targetOptions = formData.applyTo === 'PRODUCT' ? products : (formData.applyTo === 'COMBO' ? combos : categories);

  // Helper: get target name for a promotion
  const getTargetName = (promo) => {
    if (promo.productName) return promo.productName;
    if (promo.comboName) return promo.comboName;
    if (promo.targetName) return promo.targetName;
    const id = promo.targetId || promo.productId || promo.comboId;
    if (!id) return '—';
    if (promo.applyTo === 'COMBO') {
      const c = combos.find(x => String(x.id) === String(id));
      return c ? c.name : `Combo #${id}`;
    }
    if (promo.applyTo === 'CATEGORY') {
      const cat = categories.find(x => String(x.id) === String(id));
      return cat ? cat.name : `Category #${id}`;
    }
    const p = products.find(x => String(x.id) === String(id));
    return p ? p.name : `Product #${id}`;
  };

  const getDiscountDisplay = (promo) => {
    const val = Number(promo.discountValue);
    if (isNaN(val)) return '—';
    if (promo.discountType === 'PERCENTAGE') return `${val}%`;
    return formatCurrency(val);
  };

  return (
    <div className="promotions-page">
      <div className="page-header">
        <div className="page-header-content">
          <Tag size={32} weight="thin" className="page-header-icon" />
          <div>
            <h1 className="page-title">Promotions</h1>
            <p className="page-subtitle">Manage discount programs and offers</p>
          </div>
        </div>
        <button className="btn-primary" onClick={openCreate} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Plus size={20} weight="bold" /> Add Promotion
        </button>
      </div>

      {/* Status Filter */}
      <div className="promo-filters">
        {['ALL', 'ACTIVE', 'INACTIVE'].map(s => (
          <button
            key={s}
            className={`promo-filter-btn ${filterStatus === s ? 'promo-filter-btn--active' : ''}`}
            onClick={() => setFilterStatus(s)}
          >
            {s === 'ALL' ? 'All' : s === 'ACTIVE' ? 'Active' : 'Inactive'}
          </button>
        ))}
      </div>

      {/* Promotions Table */}
      {loading ? (
        <div className="loading-container"><div className="loading" /><p>Loading promotions...</p></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><p>No promotions found. Create your first promotion!</p></div>
      ) : (
        <div className="promo-table-wrapper">
          <table className="promo-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Discount</th>
                <th>Apply To</th>
                <th>Period</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(promo => (
                <tr key={promo.id} className={isExpired(promo.endDate) ? 'promo-row--expired' : ''} onClick={() => setDetailPromotion(promo)} style={{cursor:'pointer'}}>
                  <td>
                    <div className="promo-name">{promo.name}</div>
                    {isExpired(promo.endDate) && (
                      <span className="promo-expired-tag"><Warning size={12} /> Expired</span>
                    )}
                  </td>
                  <td>
                    {getDiscountDisplay(promo)}
                    <span className="promo-type-badge">{promo.discountType === 'PERCENTAGE' ? '%' : 'Fixed'}</span>
                  </td>
                  <td>
                    <span className="promo-apply-badge">{promo.applyTo}</span>
                    <div className="promo-target-name">{getTargetName(promo)}</div>
                  </td>
                  <td className="promo-period">
                    <div>{promo.startDate ? new Date(promo.startDate).toLocaleDateString('vi-VN') : '—'}</div>
                    <div className="period-to">→ {promo.endDate ? new Date(promo.endDate).toLocaleDateString('vi-VN') : '—'}</div>
                  </td>
                  <td>{getStatusBadge(promo.status)}</td>
                  <td>
                    <div className="promo-actions">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(promo); }} className="btn-icon" title="Edit"><PencilSimple size={18} /></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(promo.id); }} className="btn-icon btn-icon--danger" title="Delete"><Trash size={18} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
            <div className="modal-header">
              <h3>{editingPromotion ? 'Edit Promotion' : 'Create Promotion'}</h3>
              <button className="btn-close" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>

              {/* Name */}
              <div className="promo-form-group">
                <label>Promotion Name *</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Unique promotion name"
                  className={formErrors.name ? 'input-error' : ''}
                />
                {formErrors.name && <span className="err">{formErrors.name}</span>}
              </div>

              {/* Discount Type & Value */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="promo-form-group">
                  <label>Discount Type *</label>
                  <select value={formData.discountType} onChange={e => setFormData({ ...formData, discountType: e.target.value, discountValue: '' })}>
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FIXED">Fixed Price (VND)</option>
                  </select>
                </div>
                <div className="promo-form-group">
                  <label>Discount Value * {formData.discountType === 'PERCENTAGE' ? '(%)' : '(VND)'}</label>
                  <input
                    type="number"
                    value={formData.discountValue}
                    onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                    min="0.01"
                    step={formData.discountType === 'PERCENTAGE' ? '0.1' : '1000'}
                    max={formData.discountType === 'PERCENTAGE' ? '100' : undefined}
                    placeholder={formData.discountType === 'PERCENTAGE' ? '10' : '50000'}
                    className={formErrors.discountValue ? 'input-error' : ''}
                  />
                  {formErrors.discountValue && <span className="err">{formErrors.discountValue}</span>}
                </div>
              </div>

              {/* Apply To */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="promo-form-group">
                  <label>Apply To *</label>
                  <select value={formData.applyTo} onChange={e => setFormData({ ...formData, applyTo: e.target.value, targetId: '' })}>
                    <option value="PRODUCT">Product</option>
                    <option value="COMBO">Combo</option>
                    <option value="CATEGORY">Category</option>
                  </select>
                </div>
                <div className="promo-form-group">
                  <label>Select {formData.applyTo === 'PRODUCT' ? 'Product' : (formData.applyTo === 'COMBO' ? 'Combo' : 'Category')} *</label>
                  <select
                    value={formData.targetId}
                    onChange={e => setFormData({ ...formData, targetId: e.target.value })}
                    className={formErrors.targetId ? 'input-error' : ''}
                  >
                    <option value="">-- Select --</option>
                    {targetOptions.map(item => (
                      <option key={item.id} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                  {formErrors.targetId && <span className="err">{formErrors.targetId}</span>}
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="promo-form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    className={formErrors.startDate ? 'input-error' : ''}
                  />
                  {formErrors.startDate && <span className="err">{formErrors.startDate}</span>}
                </div>
                <div className="promo-form-group">
                  <label>End Date *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate}
                    className={formErrors.endDate ? 'input-error' : ''}
                  />
                  {formErrors.endDate && <span className="err">{formErrors.endDate}</span>}
                </div>
              </div>

              {/* Status */}
              <div className="promo-form-group">
                <label>Status *</label>
                <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '4px' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid var(--border-color)', cursor: 'pointer', background: 'transparent' }}>Cancel</button>
                <button type="submit" style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--color-accent)', color: '#fff', fontWeight: 600 }}>
                  {editingPromotion ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirmId && (
        <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-content modal-small" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h3>Delete Promotion</h3><button className="btn-close" onClick={() => setDeleteConfirmId(null)}>✕</button></div>
            <div style={{ padding: '16px' }}>
              <p>Are you sure you want to delete this promotion? This action cannot be undone.</p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '16px' }}>
                <button onClick={() => setDeleteConfirmId(null)} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--border-color)', cursor: 'pointer', background: 'transparent' }}>Cancel</button>
                <button onClick={() => handleDelete(deleteConfirmId)} style={{ padding: '8px 16px', borderRadius: '6px', border: 'none', cursor: 'pointer', background: '#ef4444', color: '#fff' }}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />

      {/* Detail Modal */}
      {detailPromotion && (
        <div className="modal-overlay" onClick={() => setDetailPromotion(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
            <div className="modal-header">
              <h3>Promotion Details</h3>
              <button className="btn-close" onClick={() => setDetailPromotion(null)}>✕</button>
            </div>
            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div><strong>Name:</strong> {detailPromotion.name}</div>
              <div><strong>Discount:</strong> {getDiscountDisplay(detailPromotion)} <span className="promo-type-badge">{detailPromotion.discountType === 'PERCENTAGE' ? 'Percentage' : 'Fixed'}</span></div>
              <div><strong>Apply To:</strong> <span className="promo-apply-badge">{detailPromotion.applyTo}</span> — {getTargetName(detailPromotion)}</div>
              <div><strong>Period:</strong> {detailPromotion.startDate ? new Date(detailPromotion.startDate).toLocaleDateString('vi-VN') : '—'} → {detailPromotion.endDate ? new Date(detailPromotion.endDate).toLocaleDateString('vi-VN') : '—'}</div>
              <div><strong>Status:</strong> {getStatusBadge(detailPromotion.status)} {isExpired(detailPromotion.endDate) ? '⚠ Expired' : ''}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 20px', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => setDetailPromotion(null)} style={{ padding: '9px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'var(--color-accent)', color: '#fff', fontWeight: 600 }}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionsPage;
