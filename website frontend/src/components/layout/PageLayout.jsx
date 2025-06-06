import React from 'react';
import { Container } from 'react-bootstrap';
import Header from '../common/Header';
import '../../styles/theme.css';

const PageLayout = ({ children, className = '' }) => {
  return (
    <div className="page-container">
      <Header />
      <main className={`main-content ${className}`}>
        <Container>
          {children}
        </Container>
      </main>
    </div>
  );
};

export default PageLayout; 