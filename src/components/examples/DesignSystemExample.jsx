/**
 * Design System Example Component
 * 
 * This component demonstrates the usage of the Visual Design System
 * including colors, typography, buttons, cards, and icons.
 * 
 * This is for reference and testing purposes.
 */

import React from 'react';
import {
  HomeIcon,
  CheckCircle,
  WarningCircle,
  XCircle,
  TrendUpIcon,
  CoffeeIcon,
} from '../../utils/icons';

const DesignSystemExample = () => {
  return (
    <div className="page-container">
      <header className="page-header">
        <h1 style={{ color: 'var(--color-creamy-white)', margin: 0 }}>
          Visual Design System Example
        </h1>
      </header>

      <main className="page-content">
        {/* Typography Section */}
        <section style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h4 className="page-title">Typography</h4>
          <h1>Heading 1 - Montserrat Bold</h1>
          <h2>Heading 2 - Montserrat Bold</h2>
          <h3>Heading 3 - Montserrat Bold</h3>
          <h4>Heading 4 - Montserrat Bold (Page Titles)</h4>
          <h5>Heading 5 - Montserrat Bold</h5>
          <h6>Heading 6 - Montserrat Bold</h6>
          <p>
            Body text uses Nunito or Roboto at 14-16px. This is regular weight
            text that is easy to read and provides good contrast against the
            Creamy White background.
          </p>
        </section>

        {/* Colors Section */}
        <section style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h4 className="page-title">Color Palette</h4>
          <div className="grid grid-cols-3">
            <div className="card">
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  backgroundColor: 'var(--color-coffee-brown)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-md)',
                }}
              />
              <h6>Coffee Bean Brown</h6>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                #4B3621 - Primary text, headers
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  backgroundColor: 'var(--color-vibrant-orange)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-md)',
                }}
              />
              <h6>Vibrant Orange</h6>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                #FF9F43 - Primary buttons, CTAs
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  backgroundColor: 'var(--color-peach-gradient)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-md)',
                }}
              />
              <h6>Peach Gradient</h6>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                #FFCBA4 - Hero sections
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  backgroundColor: 'var(--color-natural-green)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-md)',
                }}
              />
              <h6>Natural Green</h6>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                #2ECC71 - Success states
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  backgroundColor: 'var(--color-alert-red)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-md)',
                }}
              />
              <h6>Alert Red</h6>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                #E74C3C - Errors, warnings
              </p>
            </div>

            <div className="card">
              <div
                style={{
                  width: '100%',
                  height: '100px',
                  backgroundColor: 'var(--color-creamy-white)',
                  border: '2px solid var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-md)',
                }}
              />
              <h6>Creamy White</h6>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-secondary)' }}>
                #FDFBF7 - Background
              </p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h4 className="page-title">Buttons</h4>
          <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
            <button className="btn btn-primary">
              <HomeIcon size={20} />
              Primary Button
            </button>
            <button className="btn btn-secondary">Secondary Button</button>
            <button className="btn btn-success">
              <CheckCircle size={20} />
              Success Button
            </button>
            <button className="btn btn-error">
              <XCircle size={20} />
              Error Button
            </button>
            <button className="btn btn-primary" disabled>
              Disabled Button
            </button>
          </div>
        </section>

        {/* Cards Section */}
        <section style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h4 className="page-title">Cards & Metrics</h4>
          <div className="grid grid-cols-4">
            <div className="metric-card success">
              <div className="metric-value">$12,345</div>
              <div className="metric-label">Monthly Revenue</div>
              <div className="metric-trend positive">
                <TrendUpIcon size={16} />
                <span>+12.5%</span>
              </div>
            </div>

            <div className="metric-card primary">
              <div className="metric-value">156</div>
              <div className="metric-label">Today's Orders</div>
              <div className="metric-trend positive">
                <TrendUpIcon size={16} />
                <span>+8.2%</span>
              </div>
            </div>

            <div className="metric-card warning">
              <div className="metric-value">23</div>
              <div className="metric-label">Low Stock Items</div>
            </div>

            <div className="metric-card error">
              <div className="metric-value">5</div>
              <div className="metric-label">Pending Issues</div>
            </div>
          </div>
        </section>

        {/* Badges & Status Labels */}
        <section style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h4 className="page-title">Badges & Status Labels</h4>
          <div className="flex gap-md" style={{ flexWrap: 'wrap', marginBottom: 'var(--spacing-lg)' }}>
            <span className="badge badge-success">Active</span>
            <span className="badge badge-warning">Pending</span>
            <span className="badge badge-error">Inactive</span>
            <span className="badge badge-primary">Featured</span>
            <span className="badge badge-secondary">New</span>
          </div>
          <div className="flex gap-md" style={{ flexWrap: 'wrap' }}>
            <span className="status-label success">In Stock</span>
            <span className="status-label warning">Low Stock</span>
            <span className="status-label error">Out of Stock</span>
          </div>
        </section>

        {/* Alerts Section */}
        <section style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h4 className="page-title">Alerts</h4>
          <div className="alert alert-success">
            <CheckCircle size={24} />
            <div>
              <strong>Success!</strong> Your changes have been saved successfully.
            </div>
          </div>
          <div className="alert alert-warning">
            <WarningCircle size={24} />
            <div>
              <strong>Warning!</strong> Some items are running low on stock.
            </div>
          </div>
          <div className="alert alert-error">
            <XCircle size={24} />
            <div>
              <strong>Error!</strong> Failed to process your request. Please try again.
            </div>
          </div>
        </section>

        {/* Icons Section */}
        <section style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h4 className="page-title">Icons (Phosphor Icons)</h4>
          <p style={{ marginBottom: 'var(--spacing-lg)' }}>
            Thin, rounded icons with regular weight
          </p>
          <div className="flex gap-lg" style={{ flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center' }}>
              <HomeIcon size={32} weight="regular" />
              <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
                Home
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <CoffeeIcon size={32} weight="regular" />
              <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
                Coffee
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <CheckCircle size={32} weight="regular" />
              <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
                Success
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <WarningCircle size={32} weight="regular" />
              <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
                Warning
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <XCircle size={32} weight="regular" />
              <p style={{ fontSize: 'var(--font-size-sm)', marginTop: 'var(--spacing-sm)' }}>
                Error
              </p>
            </div>
          </div>
        </section>

        {/* Hero Section Example */}
        <section style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h4 className="page-title">Hero Section</h4>
          <div className="hero-section">
            <h2>Welcome to CSMS</h2>
            <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-xl)' }}>
              Streamline your coffee shop operations with our comprehensive management system
            </p>
            <button className="btn btn-primary" style={{ fontSize: 'var(--font-size-lg)' }}>
              Get Started
            </button>
          </div>
        </section>

        {/* Form Example */}
        <section style={{ marginBottom: 'var(--spacing-3xl)' }}>
          <h4 className="page-title">Form Elements</h4>
          <div className="card" style={{ maxWidth: '600px' }}>
            <div className="form-group">
              <label className="form-label">Product Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter product name"
              />
              <div className="form-help">This will be displayed to customers</div>
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select className="form-select">
                <option>Select a category</option>
                <option>Beverages</option>
                <option>Food</option>
                <option>Desserts</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                rows="4"
                placeholder="Enter product description"
              />
            </div>

            <div className="flex gap-md">
              <button className="btn btn-primary">Save Product</button>
              <button className="btn btn-secondary">Cancel</button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DesignSystemExample;
