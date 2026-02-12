import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode, 
  CreditCard, 
  CheckCircle, 
  XCircle,
  Clock,
  Bank,
  Copy,
  Check
} from '@phosphor-icons/react';
import './PaymentDisplay.css';

/**
 * PaymentDisplay Component
 * Displays payment information with QR code for bank transfer
 * 
 * Modes:
 * - customer: Large QR display for customer-facing screen
 * - receipt: Receipt mode with embedded QR
 * - static: Static QR with manual confirmation
 */
const PaymentDisplay = ({
  mode = 'customer',
  orderData = {},
  bankingInfo = {},
  onPaymentConfirm,
  onPaymentCancel,
  paymentStatus = 'pending'
}) => {
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  // Generate QR content for bank transfer
  const generateQRContent = () => {
    const { accountNumber, bankCode, amount, transferContent } = bankingInfo;
    
    // VNPAY QR format
    return `2|99|${accountNumber}|${bankCode}|${amount}|${transferContent}|0|0|${amount}`;
  };

  // Copy to clipboard
  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Countdown timer
  useEffect(() => {
    if (paymentStatus === 'pending' && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown, paymentStatus]);

  // Format countdown
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Render status badge
  const renderStatusBadge = () => {
    const statusConfig = {
      pending: { icon: Clock, text: 'Waiting for Payment', color: 'warning' },
      processing: { icon: Clock, text: 'Processing...', color: 'info' },
      completed: { icon: CheckCircle, text: 'Payment Successful', color: 'success' },
      failed: { icon: XCircle, text: 'Payment Failed', color: 'error' }
    };

    const config = statusConfig[paymentStatus] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div className={`payment-status payment-status--${config.color}`}>
        <Icon size={24} weight="fill" />
        <span>{config.text}</span>
      </div>
    );
  };

  // Customer-facing display mode
  if (mode === 'customer') {
    return (
      <div className="payment-display payment-display--customer">
        <div className="payment-display__header">
          <h2>Scan QR Code to Pay</h2>
          {renderStatusBadge()}
        </div>

        <div className="payment-display__content">
          <div className="payment-qr-section">
            <div className="payment-qr-wrapper">
              <QRCodeSVG
                value={generateQRContent()}
                size={280}
                level="H"
                includeMargin={true}
                className="payment-qr-code"
              />
            </div>
            
            {paymentStatus === 'pending' && (
              <div className="payment-timer">
                <Clock size={20} weight="bold" />
                <span>Time remaining: {formatTime(countdown)}</span>
              </div>
            )}
          </div>

          <div className="payment-details-section">
            <div className="payment-order-info">
              <h3>Order Details</h3>
              <div className="payment-info-row">
                <span className="label">Order Number:</span>
                <span className="value">#{orderData.orderNumber}</span>
              </div>
              <div className="payment-info-row">
                <span className="label">Amount:</span>
                <span className="value amount">{orderData.amount?.toLocaleString('vi-VN')} VND</span>
              </div>
              <div className="payment-info-row">
                <span className="label">Date:</span>
                <span className="value">{new Date().toLocaleString('vi-VN')}</span>
              </div>
            </div>

            <div className="payment-bank-info">
              <h3>Banking Information</h3>
              <div className="payment-info-row">
                <span className="label">Bank:</span>
                <span className="value">{bankingInfo.bankName}</span>
              </div>
              <div className="payment-info-row">
                <span className="label">Account Number:</span>
                <div className="value-with-copy">
                  <span className="value">{bankingInfo.accountNumber}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(bankingInfo.accountNumber)}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <div className="payment-info-row">
                <span className="label">Account Name:</span>
                <span className="value">{bankingInfo.accountName}</span>
              </div>
              <div className="payment-info-row">
                <span className="label">Transfer Content:</span>
                <div className="value-with-copy">
                  <span className="value highlight">{bankingInfo.transferContent}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(bankingInfo.transferContent)}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {paymentStatus === 'pending' && onPaymentConfirm && (
          <div className="payment-display__footer">
            <button 
              className="payment-btn payment-btn--secondary"
              onClick={onPaymentCancel}
            >
              Cancel
            </button>
            <button 
              className="payment-btn payment-btn--primary"
              onClick={onPaymentConfirm}
            >
              <CheckCircle size={20} weight="fill" />
              Confirm Payment Received
            </button>
          </div>
        )}
      </div>
    );
  }

  // Receipt mode
  if (mode === 'receipt') {
    return (
      <div className="payment-display payment-display--receipt">
        <div className="receipt-header">
          <h2>Payment Receipt</h2>
          <p className="receipt-subtitle">Provisional Invoice</p>
        </div>

        <div className="receipt-content">
          <div className="receipt-section">
            <h3>Order Information</h3>
            <div className="receipt-row">
              <span>Order Number:</span>
              <span>#{orderData.orderNumber}</span>
            </div>
            <div className="receipt-row">
              <span>Date:</span>
              <span>{new Date().toLocaleString('vi-VN')}</span>
            </div>
            <div className="receipt-row">
              <span>Cashier:</span>
              <span>{orderData.cashier || 'N/A'}</span>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Items</h3>
            {orderData.items?.map((item, index) => (
              <div key={index} className="receipt-item">
                <div className="receipt-item-info">
                  <span className="item-name">{item.name}</span>
                  <span className="item-qty">x{item.quantity}</span>
                </div>
                <span className="item-price">{item.price?.toLocaleString('vi-VN')} VND</span>
              </div>
            ))}
          </div>

          <div className="receipt-section receipt-total">
            <div className="receipt-row total-row">
              <span>Total Amount:</span>
              <span className="total-amount">{orderData.amount?.toLocaleString('vi-VN')} VND</span>
            </div>
          </div>

          <div className="receipt-qr-section">
            <p className="qr-instruction">Scan to pay via bank transfer</p>
            <div className="receipt-qr-wrapper">
              <QRCodeSVG
                value={generateQRContent()}
                size={180}
                level="H"
                includeMargin={true}
              />
            </div>
            <div className="receipt-bank-info">
              <p><strong>Bank:</strong> {bankingInfo.bankName}</p>
              <p><strong>Account:</strong> {bankingInfo.accountNumber}</p>
              <p><strong>Content:</strong> {bankingInfo.transferContent}</p>
            </div>
          </div>
        </div>

        {renderStatusBadge()}
      </div>
    );
  }

  // Static QR mode
  if (mode === 'static') {
    return (
      <div className="payment-display payment-display--static">
        <div className="static-header">
          <Bank size={48} weight="duotone" />
          <h2>Bank Transfer Payment</h2>
          <p>Scan QR code or transfer manually</p>
        </div>

        <div className="static-content">
          <div className="static-qr-section">
            <div className="static-qr-wrapper">
              <QRCodeSVG
                value={generateQRContent()}
                size={240}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>

          <div className="static-info-section">
            <div className="static-amount">
              <span className="amount-label">Amount to Pay</span>
              <span className="amount-value">{orderData.amount?.toLocaleString('vi-VN')} VND</span>
            </div>

            <div className="static-bank-details">
              <div className="bank-detail-item">
                <span className="detail-label">Bank Name</span>
                <span className="detail-value">{bankingInfo.bankName}</span>
              </div>
              <div className="bank-detail-item">
                <span className="detail-label">Account Number</span>
                <div className="detail-value-with-copy">
                  <span className="detail-value">{bankingInfo.accountNumber}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(bankingInfo.accountNumber)}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
              <div className="bank-detail-item">
                <span className="detail-label">Account Name</span>
                <span className="detail-value">{bankingInfo.accountName}</span>
              </div>
              <div className="bank-detail-item highlight-item">
                <span className="detail-label">Transfer Content</span>
                <div className="detail-value-with-copy">
                  <span className="detail-value">{bankingInfo.transferContent}</span>
                  <button 
                    className="copy-btn"
                    onClick={() => handleCopy(bankingInfo.transferContent)}
                  >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {onPaymentConfirm && (
              <button 
                className="static-confirm-btn"
                onClick={onPaymentConfirm}
              >
                <CheckCircle size={20} weight="fill" />
                Confirm Payment Received
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

PaymentDisplay.propTypes = {
  mode: PropTypes.oneOf(['customer', 'receipt', 'static']),
  orderData: PropTypes.shape({
    orderNumber: PropTypes.string,
    amount: PropTypes.number,
    cashier: PropTypes.string,
    items: PropTypes.arrayOf(PropTypes.shape({
      name: PropTypes.string,
      quantity: PropTypes.number,
      price: PropTypes.number
    }))
  }),
  bankingInfo: PropTypes.shape({
    bankName: PropTypes.string,
    accountNumber: PropTypes.string,
    accountName: PropTypes.string,
    bankCode: PropTypes.string,
    transferContent: PropTypes.string
  }),
  onPaymentConfirm: PropTypes.func,
  onPaymentCancel: PropTypes.func,
  paymentStatus: PropTypes.oneOf(['pending', 'processing', 'completed', 'failed'])
};

export default PaymentDisplay;
