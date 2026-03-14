import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { X, Printer, QrCode, Receipt, CurrencyDollar, DownloadSimple } from '@phosphor-icons/react';
import { formatCurrency } from '../../utils/formatters.jsx';
import './OrderReceiptModal.css';

const BANK_INFO = {
  bankName: 'Vietcombank',
  accountNumber: '1234567890',
  accountName: 'COFFEE SHOP MANAGEMENT SYSTEM',
  bankCode: 'VCB',
};

const QR_BACKGROUND_COLOR = '00b4d8';
const QR_COLOR = 'ffffff';

const generateQRUrl = (amount, content) => {
  // VietQR deeplink format for banking QR
  const { accountNumber, bankCode, accountName } = BANK_INFO;
  return `https://img.vietqr.io/image/${bankCode}-${accountNumber}-compact2.png?amount=${amount}&addInfo=${encodeURIComponent(content)}&accountName=${encodeURIComponent(accountName)}`;
};

const TABS = [
  { id: 'customer', label: 'Customer Display', icon: CurrencyDollar },
  { id: 'receipt', label: 'Receipt Mode', icon: Receipt },
  { id: 'qr', label: 'Static QR', icon: QrCode },
];

const OrderReceiptModal = ({ isOpen, onClose, order, cashierName }) => {
  const [activeTab, setActiveTab] = useState('customer');
  const printRef = useRef(null);

  if (!isOpen || !order) return null;

  const items = order.items || order.orderItems || [];
  const total = order.totalAmount || order.total || 0;
  const orderId = order.id || order.orderId || '—';
  const orderDate = order.orderDate
    ? new Date(order.orderDate).toLocaleString('vi-VN')
    : new Date().toLocaleString('vi-VN');
  const transferContent = `CSMS Order #${orderId}`;
  const qrUrl = generateQRUrl(total, transferContent);

  const handlePrint = () => {
    const printContent = printRef.current?.innerHTML;
    if (!printContent) return;
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - Order #${orderId}</title>
          <style>
            body { font-family: 'Courier New', monospace; font-size: 13px; margin: 20px; color: #000; }
            h2 { text-align: center; font-size: 18px; margin-bottom: 4px; }
            p { margin: 2px 0; }
            .center { text-align: center; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            table { width: 100%; border-collapse: collapse; }
            td { padding: 2px 4px; }
            td:last-child { text-align: right; }
            .total { font-weight: bold; font-size: 15px; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
  };

  return (
    <div className="receipt-overlay" onClick={onClose}>
      <div className="receipt-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="receipt-modal-header">
          <h2 className="receipt-modal-title">Order Receipt #{orderId}</h2>
          <button className="receipt-close-btn" onClick={onClose}>
            <X size={22} weight="bold" />
          </button>
        </div>

        {/* Tabs */}
        <div className="receipt-tabs">
          {TABS.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                className={`receipt-tab ${activeTab === tab.id ? 'receipt-tab--active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon size={18} weight="regular" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="receipt-content">
          {/* Customer Display */}
          {activeTab === 'customer' && (
            <div className="tab-customer">
              <div className="customer-order-info">
                <h3 className="shop-name">☕ Coffee Shop</h3>
                <p className="order-ref">Order #{orderId}</p>
                <p className="order-time">{orderDate}</p>
              </div>
              <div className="customer-items">
                {items.map((item, idx) => (
                  <div key={idx} className="customer-item">
                    <span className="item-name">{item.productName || item.name}</span>
                    <span className="item-qty">x{item.quantity}</span>
                    <span className="item-price">{formatCurrency(item.subtotal || (item.price * item.quantity) || 0)}</span>
                  </div>
                ))}
              </div>
              <div className="customer-total">
                <span>Total</span>
                <span className="total-amount">{formatCurrency(total)}</span>
              </div>
              <div className="customer-qr">
                <p className="qr-label">Scan to Pay</p>
                <img src={qrUrl} alt="Payment QR" className="qr-image" />
                <p className="qr-info">{BANK_INFO.bankName} · {BANK_INFO.accountNumber}</p>
                <p className="qr-content">Content: {transferContent}</p>
              </div>
            </div>
          )}

          {/* Receipt Mode */}
          {activeTab === 'receipt' && (
            <div className="tab-receipt" ref={printRef}>
              <h2 className="center">☕ Coffee Shop</h2>
              <p className="center">Coffee Shop Management System</p>
              <div className="divider" />
              <p>Order #: {orderId}</p>
              <p>Date: {orderDate}</p>
              {cashierName && <p>Cashier: {cashierName}</p>}
              <div className="divider" />
              <table>
                <thead><tr><td><b>Item</b></td><td><b>Qty</b></td><td><b>Amount</b></td></tr></thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.productName || item.name}</td>
                      <td>{item.quantity}</td>
                      <td>{formatCurrency(item.subtotal || (item.price * item.quantity) || 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="divider" />
              <p className="total"><b>TOTAL: {formatCurrency(total)}</b></p>
              <div className="divider" />
              <p className="center">Thank you for your order!</p>
            </div>
          )}

          {/* Static QR */}
          {activeTab === 'qr' && (
            <div className="tab-qr">
              <h3 className="qr-title">Bank Transfer QR Code</h3>
              <img src={qrUrl} alt="Static QR" className="qr-image-large" />
              <div className="bank-info">
                <div className="bank-info-row"><span>Bank</span><span>{BANK_INFO.bankName}</span></div>
                <div className="bank-info-row"><span>Account</span><span>{BANK_INFO.accountNumber}</span></div>
                <div className="bank-info-row"><span>Name</span><span>{BANK_INFO.accountName}</span></div>
                <div className="bank-info-row"><span>Amount</span><span>{formatCurrency(total)}</span></div>
                <div className="bank-info-row"><span>Content</span><span>{transferContent}</span></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="receipt-modal-footer">
          {activeTab === 'receipt' && (
            <button className="receipt-action-btn receipt-action-btn--print" onClick={handlePrint}>
              <Printer size={18} weight="regular" />
              Print / Download PDF
            </button>
          )}
          <button className="receipt-action-btn receipt-action-btn--secondary" onClick={onClose}>
            <DownloadSimple size={18} weight="regular" />
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

OrderReceiptModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  order: PropTypes.object,
  cashierName: PropTypes.string
};

export default OrderReceiptModal;
