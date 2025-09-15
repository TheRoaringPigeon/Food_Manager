// components/IngredientCard.js
import React from 'react';
import Card from './card';

const IngredientCard = ({ ingredient, onClick }) => {
  const isExpiringSoon = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  };

  const expiringSoon = isExpiringSoon(ingredient.expiryDate);

  return (
    <Card
      className="ingredient-card"
      onClick={onClick}
      isHighlighted={expiringSoon}
      highlightType="warning"
    >
      <Card.Header>
        <Card.Title>{ingredient.name}</Card.Title>
        <Card.Badge variant="primary">{ingredient.category}</Card.Badge>
      </Card.Header>
      
      <Card.Content>
        <Card.Meta>
          <Card.MetaItem>
            <strong>{ingredient.quantity} {ingredient.unit}</strong>
          </Card.MetaItem>
          
          <Card.MetaItem icon="📍">
            {ingredient.location}
          </Card.MetaItem>
          
          <Card.MetaItem 
            icon="📅" 
            isWarning={expiringSoon}
          >
            Expires: {new Date(ingredient.expiryDate).toLocaleDateString()}
            {expiringSoon && ' ⚠️ Expiring Soon!'}
          </Card.MetaItem>
        </Card.Meta>
      </Card.Content>
    </Card>
  );
};

export default IngredientCard;