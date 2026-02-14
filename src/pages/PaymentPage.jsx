import React, { useState } from 'react';
import { PaymentDisplay } from '../features/payment/index.js';
import { CreditCard } from '@phosphor-icons/react';
import './PaymentPage.css';

/**
 * PaymentPage Component
 * Page for payment display and management
 */
const PaymentPage = () => {
  const [mode, setMode] = useState('customer');
  const [paymentStatus, setPaymentStatus] = useState('pending');

  // Mock order data
  const orderData = {
    orderNumber: 'ORD-2024-001',
    amount: 125000,
    cashier: 'John Doe',
    items: [
      { name: 'Cappuccino', quantity: 2, price: 45000 },
      { name: 'Croissant', quantity: 1, price: 35000 },
      { name: 'Latte', quantity: 1, price: 45000 }
    ]
  };

  // Mock banking info
  const bankingInfo = {
    bankName: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'COFFEE SHOP MANAGEMENT SYSTEM',
    bankCode: 'VCB',
    transferContent: `CSMS ${orderData.orderNumber}`
  };

  const handlePaymentConfirm = () => {
    setPaymentStatus('completed');
    setTimeout(() => {
      alert('Payment confirmed successfully!');
    }, 500);
  };

  const handlePaymentCancel = () => {
    if (window.confirm('Are you sure you want to cancel this payment?')) {
      setPaymentStatus('failed');
    }
  };

  return (
    <div className="payment-page">
      <div className="page-header">
        <div className="page-header-content">
          <CreditCard size={32} weight="thin" className="page-header-icon" />
          <div>
            <h1 className="page-title">Payment Management</h1>
            <p className="page-subtitle">Manage payment QR codes and banking information</p>
          </div>
        </div>
      </div>

      <div className="payment-mode-selector">
        <button 
          className={`mode-btn ${mode === 'customer' ? 'active' : ''}`}
          onClick={() => setMode('customer')}
        >
          Customer Display
        </button>
        <button 
          className={`mode-btn ${mode === 'receipt' ? 'active' : ''}`}
          onClick={() => setMode('receipt')}
        >
          Receipt Mode
        </button>
        <button 
          className={`mode-btn ${mode === 'static' ? 'active' : ''}`}
          onClick={() => setMode('static')}
        >
          Static QR
        </button>
      </div>

      <div className="payment-display-container">
        <PaymentDisplay
          mode={mode}
          orderData={orderData}
          bankingInfo={bankingInfo}
          onPaymentConfirm={handlePaymentConfirm}
          onPaymentCancel={handlePaymentCancel}
          paymentStatus={paymentStatus}
        />
      </div>

      {paymentStatus === 'completed' && (
        <div className="payment-reset">
          <button 
            className="reset-btn"
            onClick={() => setPaymentStatus('pending')}
          >
            Reset Payment Status
          </button>
        </div>
      )}
    </div>
  );
};

export default PaymentPage;
