import { MongoClient } from "mongodb";

async function handler(req, res) {
  if (req.method === "POST") {
    const data = req.body;
    const client = await MongoClient.connect(
      "mongodb+srv://DataBaseAdmin:0uZANKDJSNJeBh0t@cluster0.g3ysge4.mongodb.net/FoodOrganizer?retryWrites=true&w=majority"
    );
    const db = client.db();
    const recipeCollection = db.collection("Recipe");

    const result = await recipeCollection.insertOne(data);
    const ingredientCollection = db.collection("Ingredient");
    const ingredientsInCollection = await ingredientCollection.find().toArray();
    const missingIngredients = data.ingredients.filter(
      (ingredient) => !ingredientsInCollection.includes(ingredient.Ingredient)
    );
    if (missingIngredients.length > 0) {
      let ingredientsToAdd = missingIngredients.map((ingredient) => ({
        _id: ingredient.Ingredient,
        MeasureType: ingredient.Measurement,
        MeasureAmount: 0,
      }));
      let temp = await ingredientCollection.insertMany(ingredientsToAdd);
      console.log(temp);
    }
    client.close();
    res.status(201).json({ message: "Recipe added to DB." });
  }
}
export default handler;
