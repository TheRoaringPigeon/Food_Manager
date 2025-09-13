/**
 * Recipe Routes
 * Defines all recipe-related endpoints and maps them to controller methods
 */

const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");

/**
 * @swagger
 * tags:
 *   name: Recipes
 *   description: Recipe management endpoints
 */

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Get all recipes
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of items per page
 *       - in: query
 *         name: simple
 *         schema:
 *           type: boolean
 *         description: Return simplified recipe info
 *     responses:
 *       200:
 *         description: List of recipes
 */
router.get("/recipes", recipeController.getAllRecipes);

/**
 * @swagger
 * /api/recipes/search:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Search recipes by name or ingredients
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *     responses:
 *       200:
 *         description: Search results
 *       404:
 *         description: Recipe not found
 */
router.get("/recipes/search", recipeController.searchRecipes);

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Get a recipe by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe found
 *       404:
 *         description: Recipe not found
 */
router.get("/recipes/:id", recipeController.getRecipeById);

/**
 * @swagger
 * /api/recipes:
 *   post:
 *     tags:
 *       - Recipes
 *     summary: Create a new recipe
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - cookTime
 *               - servings
 *               - ingredients
 *               - instructions
 *             properties:
 *               name:
 *                 type: string
 *               cookTime:
 *                 type: string
 *               servings:
 *                 type: integer
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *               instructions:
 *                 type: string
 *     responses:
 *       201:
 *         description: Recipe created successfully
 */
router.post("/recipes", recipeController.createRecipe);

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     tags:
 *       - Recipes
 *     summary: Update an existing recipe
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               cookTime:
 *                 type: string
 *               servings:
 *                 type: integer
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: string
 *               instructions:
 *                 type: string
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       404:
 *         description: Recipe not found
 */
router.put("/recipes/:id", recipeController.updateRecipe);

/**
 * @swagger
 * /api/recipes/{id}:
 *   delete:
 *     tags:
 *       - Recipes
 *     summary: Delete a recipe by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *       404:
 *         description: Recipe not found
 */
router.delete("/recipes/:id", recipeController.deleteRecipe);

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Recipe API Documentation",
    version: "1.0.0",
    endpoints: {
      "GET /api/recipes":
        "Get all recipes (supports ?page=1&limit=10&simple=true)",
      "GET /api/recipes/:id": "Get recipe by ID",
      "POST /api/recipes": "Create new recipe",
      "PUT /api/recipes/:id": "Update recipe",
      "DELETE /api/recipes/:id": "Delete recipe",
      "GET /api/recipes/search?q=query": "Search recipes",
    },
    sampleRecipe: {
      name: "Sample Recipe",
      cookTime: "30 minutes",
      servings: 4,
      ingredients: ["ingredient 1", "ingredient 2", "ingredient 3"],
      instructions: "Step 1. Do this. Step 2. Do that.",
    },
  });
});

module.exports = router;
