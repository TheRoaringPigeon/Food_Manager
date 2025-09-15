// components/Card.js
import React from 'react';
import './card.css';

const Card = ({ 
  className = '', 
  onClick, 
  children, 
  isHighlighted = false,
  highlightType = 'warning' // 'warning', 'error', 'success', etc.
}) => {
  const cardClasses = `
    card 
    ${className} 
    ${isHighlighted ? `card--${highlightType}` : ''}
    ${onClick ? 'card--clickable' : ''}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {children}
    </div>
  );
};

// Card sub-components for common patterns
Card.Header = ({ children, className = '' }) => (
  <div className={`card__header ${className}`}>
    {children}
  </div>
);

Card.Title = ({ children, className = '' }) => (
  <h3 className={`card__title ${className}`}>
    {children}
  </h3>
);

Card.Badge = ({ children, className = '', variant = 'default' }) => (
  <span className={`card__badge card__badge--${variant} ${className}`}>
    {children}
  </span>
);

Card.Content = ({ children, className = '' }) => (
  <div className={`card__content ${className}`}>
    {children}
  </div>
);

Card.Meta = ({ children, className = '' }) => (
  <div className={`card__meta ${className}`}>
    {children}
  </div>
);

Card.MetaItem = ({ icon, children, className = '', isWarning = false }) => (
  <div className={`card__meta-item ${isWarning ? 'card__meta-item--warning' : ''} ${className}`}>
    {icon && <span className="card__meta-icon">{icon}</span>}
    <span className="card__meta-text">{children}</span>
  </div>
);

export default Card;