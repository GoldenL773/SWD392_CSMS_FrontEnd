import React from 'react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getAllProducts } from '../api/productApi.jsx';
import { PRODUCT_CATEGORIES } from '../utils/constants.jsx';
import { formatCurrency } from '../utils/formatters.jsx';
import heroBanner from '../assets/images/hero-banner.png';
import './HomePage.css';

/**
 * HomePage Component
 * Public-facing homepage with cafe information and menu
 * Redesigned following UI-MASTER-PROMPT.md guidelines
 */
const HomePage = () => {
  const { data: products, loading } = useApiQuery(getAllProducts, {}, []);

  // Filter only available products
  const availableProducts = products?.filter(p =>
    p.status && (p.status.toUpperCase() === 'AVAILABLE' || p.status === 'Available')
  ) || [];

  const getProductsByCategory = (category) => {
    return availableProducts.filter(p => p.category === category);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Coffee': '☕',
      'Tea': '🍵',
      'Cake': '🍰',
      'Pastry': '🥐',
      'Sandwich': '🥪',
      'Beverage': '🥤',
      'Other': '🍴'
    };
    return icons[category] || '🍴';
  };

  return (
    <div className="homepage">
      {/* Header */}
      <header className="homepage-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">☕</span>
            <h1 className="logo-text">CSMS</h1>
          </div>
          <nav className="header-nav">
            <a href="#about">About</a>
            <a href="#menu">Menu</a>
            <a href="#contact">Contact</a>
            <a href="/login" className="nav-login">Login</a>
          </nav>
        </div>
      </header>

      {/* Hero Banner with Image */}
      <section className="hero-banner">
        <div className="hero-image-container">
          <img src={heroBanner} alt="CSMS Coffee" className="hero-image" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">Premium Coffee Experience</div>
          <h2 className="hero-title">Welcome to CSMS Coffee</h2>
          <p className="hero-subtitle">Experience the finest coffee in town</p>
          <p className="hero-description">
            Handcrafted beverages, fresh pastries, and a cozy atmosphere
          </p>
          <div className="hero-actions">
            <a href="#menu" className="hero-cta primary">View Our Menu</a>
            <a href="#about" className="hero-cta secondary">Learn More</a>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">About CSMS Coffee</h2>
            <div className="section-divider"></div>
          </div>
          <div className="about-content">
            <div className="about-text">
              <h3 className="about-heading">Our Story</h3>
              <p className="about-paragraph">
                CSMS Coffee was founded with a passion for exceptional coffee and warm hospitality.
                We source the finest beans from around the world and craft each cup with care.
              </p>
              <p className="about-paragraph">
                Our cozy cafe is the perfect place to relax, work, or catch up with friends.
                We pride ourselves on creating a welcoming atmosphere where everyone feels at home.
              </p>
              <div className="about-stats">
                <div className="stat-item">
                  <div className="stat-number">10+</div>
                  <div className="stat-label">Years Experience</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">50+</div>
                  <div className="stat-label">Menu Items</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">1000+</div>
                  <div className="stat-label">Happy Customers</div>
                </div>
              </div>
            </div>
            <div className="about-features">
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">☕</span>
                </div>
                <div className="feature-content">
                  <h4 className="feature-title">Premium Coffee</h4>
                  <p className="feature-description">Sourced from the best farms worldwide</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">🥐</span>
                </div>
                <div className="feature-content">
                  <h4 className="feature-title">Fresh Pastries</h4>
                  <p className="feature-description">Baked daily in-house with love</p>
                </div>
              </div>
              <div className="feature-card">
                <div className="feature-icon-wrapper">
                  <span className="feature-icon">🏠</span>
                </div>
                <div className="feature-content">
                  <h4 className="feature-title">Cozy Atmosphere</h4>
                  <p className="feature-description">Perfect for work or relaxation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu" className="menu-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Our Menu</h2>
            <div className="section-divider"></div>
            <p className="section-subtitle">Discover our delicious offerings</p>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading menu...</p>
            </div>
          ) : (
            <div className="menu-categories">
              {PRODUCT_CATEGORIES.map(category => {
                const categoryProducts = getProductsByCategory(category);
                if (categoryProducts.length === 0) return null;

                return (
                  <div key={category} className="menu-category">
                    <div className="category-header">
                      <span className="category-icon">{getCategoryIcon(category)}</span>
                      <h3 className="category-title">{category}</h3>
                      <div className="category-line"></div>
                    </div>
                    <div className="menu-items">
                      {categoryProducts.map(product => (
                        <div key={product.id} className="menu-item">
                          <div className="menu-item-content">
                            <div className="menu-item-header">
                              <h4 className="menu-item-name">{product.name}</h4>
                              <span className="menu-item-price">{formatCurrency(product.price)}</span>
                            </div>
                            {product.description && (
                              <p className="menu-item-description">{product.description}</p>
                            )}
                          </div>
                          <div className="menu-item-hover-effect"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Visit Us</h2>
            <div className="section-divider"></div>
          </div>
          <div className="contact-content">
            <div className="contact-info">
              <div className="info-item">
                <div className="info-icon-wrapper">
                  <span className="info-icon">📍</span>
                </div>
                <div className="info-details">
                  <h4 className="info-title">Location</h4>
                  <p className="info-text">123 Coffee Street, District 1</p>
                  <p className="info-text">Ho Chi Minh City, Vietnam</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon-wrapper">
                  <span className="info-icon">⏰</span>
                </div>
                <div className="info-details">
                  <h4 className="info-title">Opening Hours</h4>
                  <p className="info-text">Monday - Friday: 7:00 AM - 10:00 PM</p>
                  <p className="info-text">Saturday - Sunday: 8:00 AM - 11:00 PM</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon-wrapper">
                  <span className="info-icon">📞</span>
                </div>
                <div className="info-details">
                  <h4 className="info-title">Contact</h4>
                  <p className="info-text">Phone: (028) 1234 5678</p>
                  <p className="info-text">Email: hello@csmscoffee.com</p>
                </div>
              </div>
            </div>
            <div className="contact-map">
              <div className="map-placeholder">
                <span className="map-icon">🗺️</span>
                <p className="map-text">Map Location</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="homepage-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-section footer-brand">
              <h3 className="footer-logo">CSMS</h3>
              <p className="footer-tagline">Your favorite coffee destination</p>
              <p className="footer-description">
                Crafting exceptional coffee experiences since 2015
              </p>
            </div>
            <div className="footer-section">
              <h4 className="footer-heading">Quick Links</h4>
              <ul className="footer-links">
                <li><a href="#about">About Us</a></li>
                <li><a href="#menu">Menu</a></li>
                <li><a href="#contact">Contact</a></li>
                <li><a href="/login">Staff Login</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4 className="footer-heading">Follow Us</h4>
              <div className="social-links">
                <a href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noopener noreferrer">📘</a>
                <a href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noopener noreferrer">📷</a>
                <a href="https://twitter.com" aria-label="Twitter" target="_blank" rel="noopener noreferrer">🐦</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">&copy; 2025 CSMS Coffee. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
