// components/RecipeCard.js
import React from 'react';
import Card from './card';

const RecipeCard = ({ recipe, onClick }) => {
  return (
    <Card
      className="recipe-card"
      onClick={onClick}
    >
      <Card.Header>
        <Card.Title>{recipe.name}</Card.Title>
      </Card.Header>
      
      <Card.Content>
        <Card.Meta>
          <Card.MetaItem icon="🕒">
            {recipe.cookTime}
          </Card.MetaItem>
          
          <Card.MetaItem icon="👥">
            {recipe.servings} servings
          </Card.MetaItem>
        </Card.Meta>
      </Card.Content>
    </Card>
  );
};

export default RecipeCard;