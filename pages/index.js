import { MongoClient } from "mongodb";
import { Fragment } from "react";
import Head from "next/head";
import RecipeList from "../components/recipes/RecipeList";

function HomePage(props) {
  return (
    <Fragment>
      <Head>
        <title>Food Manager</title>
        <meta
          name="description"
          content="Browse recipes and maybe other stuff in the future"
        />
      </Head>
      <RecipeList recipes={props.recipes} />
    </Fragment>
  );
}

export async function getStaticProps() {
    const client = await MongoClient.connect(
      "mongodb+srv://DataBaseAdmin:0uZANKDJSNJeBh0t@cluster0.g3ysge4.mongodb.net/FoodOrganizer?retryWrites=true&w=majority"
    );
    const db = client.db();
    const recipeCollection = db.collection("Recipe");
    const recipes = await recipeCollection.find().toArray();
    client.close();
    return {
      props: {
        recipes: recipes.map((recipe) => ({
          id: recipe._id,
          image: recipe.image,
          description: recipe.description
        })),
      },
      revalidate: 1
    };
  }

  export default HomePage;