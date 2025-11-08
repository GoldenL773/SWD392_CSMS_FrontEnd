import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Header from '../Header/index.jsx';
import Sidebar from '../Sidebar/index.jsx';
import BottomNav from '../BottomNav/index.jsx';
import './AppLayout.css';

/**
 * AppLayout Component
 * Main application layout with header, sidebar, and bottom navigation
 */
const AppLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="app-layout">
      <Header onMenuClick={toggleSidebar} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <main className="app-layout__main">
        <div className="app-layout__content">
          {children}
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

AppLayout.propTypes = {
  children: PropTypes.node.isRequired
};

export default AppLayout;
