import { Fragment } from "react";
import styles from "./RecipeDetail.module.css";
import Ingredient from "./Ingredient";

function RecipeDetail(props) {
  function setValid(name, amount) {
    let ingredient = props.ownedIngredients.filter(item => item._id === name);
    return ingredient[0].MeasureAmount >= amount;
  }

  return (
    <Fragment>
      <section className={styles.detail}>
        <img src={props.image} alt={props.title} />
      </section>
      <div className={styles.content}>
        <h1>{props.id}</h1>
        <div className={styles.ingredients}>
            <ul className={styles.list}>
                {props.ingredients.map((ingredient) => 
                    <Ingredient key={ingredient.Ingredient} 
                        name={ingredient.Ingredient}
                        amount={ingredient.Amount}
                        measurement={ingredient.Measurement}
                        isValid={setValid(ingredient.Ingredient, ingredient.Amount, ingredient.Measurement)}
                    />
                )}
            </ul>
        </div>
        <div className={styles.instructions}>
            {props.instructions}
        </div>
      </div>
    </Fragment>
  );
}

export default RecipeDetail;
