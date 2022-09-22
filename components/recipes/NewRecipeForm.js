import { Fragment, useRef, useState } from "react";
import Card from "../ui/Card";
import styles from "./NewRecipeForm.module.css";
import Modal from "../ui/Modal";

function NewRecipeForm(props) {
  const titleInputRef = useRef();
  const imageInputRef = useRef();
  const descriptionInputRef = useRef();
  const instructionsInputRef = useRef();
  const [ingredientFields, setIngredientFields] = useState([
    { Ingredient: "", Amount: "", Measurement: "cups" },
  ]);
  const [error, setError] = useState();
  const [missingIngredient, setMissingIngredient] = useState(true);
  const [getConfirmation, setGetConfirmation] = useState();
  const [recipeData, setRecipeData] = useState();
  function handleFormChange(event, index) {
    let data = [...ingredientFields];
    data[index][event.target.name] = event.target.value;
    setIngredientFields(data);
    for (let i = 0; i < data.length; i++) {
      if (
        data[i].Amount.trim().length === 0 ||
        data[i].Measurement.trim().length === 0 ||
        data[i].Ingredient.trim().length === 0
      ) {
        setMissingIngredient(true);
        return;
      }
    }
    setMissingIngredient(false);
  }
  function clearModal() {
    setError();
    setGetConfirmation();
  }
  function confirmationHandler() {
    props.onAddRecipe(recipeData);
  }
  function addFieldHandler() {
    let object = {
      Ingredient: "",
      Amount: "",
      Measurement: "cups",
    };
    setIngredientFields([...ingredientFields, object]);
    setMissingIngredient(true);
  }
  function removeFieldHandler(index) {
    let data = [...ingredientFields];
    data.splice(index, 1);
    setIngredientFields(data);
  }
  function submitHandler(event) {
    event.preventDefault();
    const enteredTitle = titleInputRef.current.value;
    const enteredImage = imageInputRef.current.value;
    const enteredDescription = descriptionInputRef.current.value;
    const enteredInstructions = instructionsInputRef.current.value;

    if (
      enteredTitle.trim().length === 0 ||
      enteredImage.trim().length === 0 ||
      enteredDescription.trim().length === 0 ||
      enteredInstructions.trim().length === 0
    ) {
      setError({
        title: "Missing Input",
        message: "Please make sure all fields have input.",
      });
      return;
    }
    if (missingIngredient) {
      setError({
        title: "Missing Ingredient Field",
        message: "Please make sure all ingridients have input.",
      });
      return;
    }
    setRecipeData({
        _id: enteredTitle,
        image: enteredImage,
        ingredients: ingredientFields,
        description: enteredDescription,
        instructions: enteredInstructions,
      })
    setGetConfirmation({
        title: "Recipe Confirmation",
        message: "Are you ready to add this recipe?",
      });
  }

  return (
    <Fragment>
      {error && (
        <Modal
          onClick={clearModal}
          title={error.title}
          message={error.message}
          modalType="errorModal"
        />
      )}
      {getConfirmation && (
        <Modal
          onCancel={clearModal}
          onClick={confirmationHandler}
          title={getConfirmation.title}
          message={getConfirmation.message}
          modalType="recipeConfirmationModal"
        />
      )}
      <Card>
        <form className={styles.form} /*onSubmit={submitHandler}*/>
          <div className={styles.control}>
            <label htmlFor="title">Recipe Name</label>
            <input type="text" required id="title" ref={titleInputRef} />
          </div>
          <div className={styles.control}>
            <label htmlFor="image">Recipe Image</label>
            <input type="url" required id="image" ref={imageInputRef} />
          </div>
          <div className={styles.control}>
            <label htmlFor="description">Short Description</label>
            <input
              type="text"
              required
              id="description"
              ref={descriptionInputRef}
            />
          </div>
          <div className={styles.control}>
            <label htmlFor="instructions">Cooking Instructions</label>
            <input
              type="text"
              required
              id="instructions"
              ref={instructionsInputRef}
            />
          </div>
          <div className={styles.control}>
            <label htmlFor="_id">Recipe Ingredients</label>
            {ingredientFields.map((form, index) => {
              return (
                <div key={index} className={styles.ingredientContainer}>
                  <input
                    name="Ingredient"
                    placeholder="Name (Ground Beef)"
                    onChange={(event) => handleFormChange(event, index)}
                    value={form.Ingredient}
                  />
                  <input
                    name="Amount"
                    placeholder="Amount (1 lbs)"
                    onChange={(event) => handleFormChange(event, index)}
                    value={form.Amount}
                    type="number"
                  />
                  <select
                    name="Measurement"
                    value={form.Measurement}
                    onChange={(event) => handleFormChange(event, index)}
                  >
                    <option value="cups">Cups</option>
                    <option value="lbs">Lbs</option>
                    <option value="oz">oz</option>
                    <option value="tbsp">Tbsp</option>
                    <option value="tsp">Tsp</option>
                  </select>
                  <button onClick={() => removeFieldHandler(index)}>
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </form>
        <div className={styles.actions}>
          <button onClick={addFieldHandler}>Add Ingredient</button>
          <button onClick={submitHandler}>Add Recipe</button>
        </div>
      </Card>
    </Fragment>
  );
}
export default NewRecipeForm;
