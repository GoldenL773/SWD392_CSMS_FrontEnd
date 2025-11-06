import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants.jsx';

const NotFoundPage = () => {
  return (
    <div className="page" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
      <h1 style={{ fontSize: '6rem', margin: 0 }}>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist.</p>
      <Link to={ROUTES.DASHBOARD} style={{ 
        display: 'inline-block',
        marginTop: '2rem',
        padding: '0.75rem 2rem',
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-black)',
        borderRadius: 'var(--radius-md)',
        fontWeight: 'var(--font-weight-semibold)'
      }}>
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFoundPage;
