import { useRouter } from "next/router";
import { Fragment } from "react";
import Head from "next/head";
import NewRecipeForm from "../../components/recipes/NewRecipeForm";

function newRecipePage() {
  const router = useRouter();
  async function addRecipeHandler(enteredRecipeData) {
    const response = await fetch("/api/new-recipe", {
      method: "POST",
      body: JSON.stringify(enteredRecipeData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    router.push("/");
  }
  return (
    <Fragment>
      <Head>
        <title>Add a new Recipe</title>
        <meta
          name="description"
          content="Add your ingredients and instructions. Once finished, submit them to add the recipe to your favorites!"
        />
      </Head>
      <NewRecipeForm onAddRecipe={addRecipeHandler} />
    </Fragment>
  );
}
export default newRecipePage;