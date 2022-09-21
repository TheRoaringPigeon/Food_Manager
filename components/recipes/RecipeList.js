import RecipeItem from "./RecipeItem";
import styles from "./RecipeList.module.css";

function RecipeList(props) {
    
  return (
    <ul className={styles.list}>
      {props.recipes.map((recipe) => (
        <RecipeItem
          key={recipe.id}
          id={recipe.id}
          image={recipe.image}
          description={recipe.description}
        />
      ))}
    </ul>
  );
}

export default RecipeList;
