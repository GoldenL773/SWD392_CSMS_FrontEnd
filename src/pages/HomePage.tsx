import React from 'react';
import { 
  Coffee, 
  Cake, 
  Bread, 
  Hamburger, 
  Wine, 
  ForkKnife,
  MapPin,
  Clock,
  Phone,
  FacebookLogo,
  InstagramLogo,
  TwitterLogo
} from '@phosphor-icons/react';
import { useApiQuery } from '../hooks/useApiQuery.jsx';
import { getAllProducts } from '../api/productApi.jsx';
import { getAllCombos } from '../api/comboApi.jsx';
import { PRODUCT_CATEGORIES } from '../utils/constants.jsx';
import { formatCurrency } from '../utils/formatters.jsx';
import heroBanner from '../assets/images/hero-banner.png';
import './HomePage.css';

/**
 * HomePage Component
 * Public-facing homepage with cafe information and menu
 */
const HomePage = () => {
  const { data: productsData, loading: productsLoading } = useApiQuery(getAllProducts, { size: 1000 }, []);
  const { data: combosData, loading: combosLoading } = useApiQuery(getAllCombos, { size: 100 }, []);

  // Extract products and combos
  const products = productsData?.content || productsData || [];
  const combos = combosData?.content || combosData || [];
  
  // Filter only available products
  const availableProducts = products.filter((p: any) =>
    p.status && (p.status.toUpperCase() === 'AVAILABLE' || p.status === 'Available')
  );

  const getProductsByCategory = (category: string) => {
    return availableProducts.filter((p: any) => (p.categoryName || p.category) === category);
  };

  const getCategoryIcon = (category: string) => {
    const iconProps = { size: 32, weight: "thin" as const };
    const icons: Record<string, JSX.Element> = {
      'Coffee': <Coffee {...iconProps} />,
      'Tea': <Wine {...iconProps} />,
      'Cake': <Cake {...iconProps} />,
      'Pastry': <Bread {...iconProps} />,
      'Sandwich': <Hamburger {...iconProps} />,
      'Beverage': <Wine {...iconProps} />,
      'Other': <ForkKnife {...iconProps} />
    };
    return icons[category] || <ForkKnife {...iconProps} />;
  };

  return (
    <div className="homepage">
      {/* Header */}
      <header className="homepage-header">
        <div className="header-content">
          <div className="logo">
            <Coffee size={32} weight="thin" className="logo-icon" />
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

      {/* Hero Banner */}
      <section className="hero-banner">
        <div className="hero-decorative-blur hero-decorative-blur-1"></div>
        <div className="hero-decorative-blur hero-decorative-blur-2"></div>
        <div className="hero-image-container">
          <img src={heroBanner} alt="CSMS Coffee" className="hero-image" />
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <div className="hero-badge">
            <div className="hero-badge-stars">
              <Coffee size={14} weight="fill" />
              <Coffee size={14} weight="fill" />
              <Coffee size={14} weight="fill" />
              <Coffee size={14} weight="fill" />
              <Coffee size={14} weight="fill" />
            </div>
            <span className="hero-badge-text">Premium Coffee Experience</span>
          </div>
          <h2 className="hero-title">
            Welcome to <br />
            <span className="hero-title-highlight">
              CSMS Coffee
              <svg className="hero-title-underline" preserveAspectRatio="none" viewBox="0 0 100 10">
                <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="8"></path>
              </svg>
            </span>
          </h2>
          <p className="hero-subtitle">Experience the finest coffee in town</p>
          <p className="hero-description">
            Handcrafted beverages, fresh pastries, and a cozy atmosphere. Join us for the perfect coffee experience.
          </p>
          <div className="hero-actions">
            <a href="#menu" className="hero-cta primary">
              View Our Menu
            </a>
            <a href="#about" className="hero-cta secondary">
              Learn More
            </a>
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

          {productsLoading || combosLoading ? (
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
                      {categoryProducts.map((product: any) => (
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
              
              {/* Dynamic Combos Section */}
              {combos.length > 0 && (
                <div className="menu-category">
                  <div className="category-header">
                    <span className="category-icon"><ForkKnife size={32} weight="thin" /></span>
                    <h3 className="category-title">Special Combos</h3>
                    <div className="category-line"></div>
                  </div>
                  <div className="menu-items">
                    {combos.map((combo: any) => (
                      <div key={combo.id} className="menu-item">
                        <div className="menu-item-content">
                          <div className="menu-item-header">
                            <h4 className="menu-item-name">{combo.name}</h4>
                            <span className="menu-item-price">{formatCurrency(combo.price)}</span>
                          </div>
                          <p className="menu-item-description">{combo.description}</p>
                        </div>
                        <div className="menu-item-hover-effect"></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                  <MapPin size={32} weight="thin" className="info-icon" />
                </div>
                <div className="info-details">
                  <h4 className="info-title">Location</h4>
                  <p className="info-text">123 Coffee Street, District 1</p>
                  <p className="info-text">Ho Chi Minh City, Vietnam</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon-wrapper">
                  <Clock size={32} weight="thin" className="info-icon" />
                </div>
                <div className="info-details">
                  <h4 className="info-title">Opening Hours</h4>
                  <p className="info-text">Monday - Friday: 7:00 AM - 10:00 PM</p>
                  <p className="info-text">Saturday - Sunday: 8:00 AM - 11:00 PM</p>
                </div>
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
