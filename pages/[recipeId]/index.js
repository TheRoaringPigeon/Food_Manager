import RecipeDetail from "../../components/recipes/RecipeDetail";
import { MongoClient } from "mongodb";
import Head from "next/head";
import { Fragment } from "react";
function RecipeDetails(props) {
  return (
    <Fragment>
      <Head>
        <title>{`FM : ${props.recipeData.id}`}</title>
        <meta name="description" content={props.recipeData.description} />
      </Head>
      <RecipeDetail 
        image={props.recipeData.image}
        id={props.recipeData.id}
        ingredients={props.recipeData.ingredients}
        instructions={props.recipeData.instructions}
      />
    </Fragment>
  );
}

export async function getStaticPaths() {
  const client = await MongoClient.connect(
    "mongodb+srv://DataBaseAdmin:0uZANKDJSNJeBh0t@cluster0.g3ysge4.mongodb.net/FoodPlanner?retryWrites=true&w=majority"
  );
  const db = client.db();
  const recipeCollection = db.collection("Recipe");
  const recipes = await recipeCollection.find({}, { _id: 1 }).toArray();
  client.close();
  return {
    fallback: "blocking",
    paths: recipes.map((recipe) => ({
      params: { recipeId: recipe._id },
    })),
  };
}

export async function getStaticProps(context) {
  const recipeId = context.params.recipeId;
  const client = await MongoClient.connect(
    "mongodb+srv://DataBaseAdmin:0uZANKDJSNJeBh0t@cluster0.g3ysge4.mongodb.net/FoodOrganizer?retryWrites=true&w=majority"
  );
  const db = client.db();
  const recipeCollection = db.collection("Recipe");
  const selectedRecipe = await recipeCollection.findOne({
    _id: recipeId,
  });
  client.close();

  return {
    props: {
      recipeData: {
        id: recipeId,
        image: selectedRecipe.image,
        ingredients: selectedRecipe.ingredients,
        description: selectedRecipe.description,
        instructions: selectedRecipe.instructions
      },
    },
  };
}
export default RecipeDetails;