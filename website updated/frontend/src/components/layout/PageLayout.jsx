import React from 'react';
import { Container } from 'react-bootstrap';
import Header from '../common/Header';
import '../../styles/simple-theme.css';

const PageLayout = ({ children, className = '', fullWidth = false }) => {
  return (
    <div className={fullWidth ? "page-container full-width" : "page-container"} style={fullWidth ? { padding: 0, margin: 0 } : {}}>
      <Header />
      <main className={`main-content ${fullWidth ? 'full-width' : ''} ${className}`}>
        {fullWidth ? (
          <div style={{ width: '100%', margin: 0, padding: 0 }}>
            {children}
          </div>
        ) : (
          <Container>
            {children}
          </Container>
        )}
      </main>
    </div>
  );
};

export default PageLayout;