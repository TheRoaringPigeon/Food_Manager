/**
 * Recipe Routes
 * Defines all recipe-related endpoints and maps them to controller methods
 * Updated to support ingredient associations
 */

const express = require("express");
const router = express.Router();
const recipeController = require("../controllers/recipeController");

/**
 * @swagger
 * tags:
 *   name: Recipes
 *   description: Recipe management endpoints with ingredient support
 */

/**
 * @swagger
 * /api/recipes:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Get all recipes with ingredients
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of recipes with pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Recipe'
 *                 count:
 *                   type: integer
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 */
router.get("/recipes", recipeController.getAllRecipes);

/**
 * @swagger
 * /api/recipes/search:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Search recipes by name, instructions, or ingredient names
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
 *       400:
 *         description: Search query is required
 */
router.get("/recipes/search", recipeController.searchRecipes);

/**
 * @swagger
 * /api/recipes/stats:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Get recipe statistics
 *     responses:
 *       200:
 *         description: Recipe statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   type: object
 *                   properties:
 *                     totalRecipes:
 *                       type: integer
 *                     averageServings:
 *                       type: number
 *                     minServings:
 *                       type: integer
 *                     maxServings:
 *                       type: integer
 *                     totalUniqueIngredients:
 *                       type: integer
 */
router.get("/recipes/stats", recipeController.getRecipeStats);

/**
 * @swagger
 * /api/recipes/by-servings:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Get recipes by serving range
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Minimum servings
 *       - in: query
 *         name: max
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum servings
 *     responses:
 *       200:
 *         description: Recipes within serving range
 *       400:
 *         description: Invalid serving range
 */
router.get("/recipes/by-servings", recipeController.getRecipesByServings);

/**
 * @swagger
 * /api/recipes/by-ingredient:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Get recipes containing a specific ingredient by name
 *     parameters:
 *       - in: query
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Ingredient name to search for
 *     responses:
 *       200:
 *         description: Recipes containing the ingredient
 *       400:
 *         description: Ingredient name is required
 */
router.get("/recipes/by-ingredient", recipeController.getRecipesByIngredient);

/**
 * @swagger
 * /api/recipes/by-ingredient-id/{ingredientId}:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Get recipes containing a specific ingredient by ID
 *     parameters:
 *       - in: path
 *         name: ingredientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ingredient ID
 *     responses:
 *       200:
 *         description: Recipes containing the ingredient
 *       400:
 *         description: Invalid ingredient ID
 */
router.get("/recipes/by-ingredient-id/:ingredientId", recipeController.getRecipesByIngredientId);

/**
 * @swagger
 * /api/recipes/makable:
 *   post:
 *     tags:
 *       - Recipes
 *     summary: Find recipes that can be made with available ingredients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - availableIngredientIds
 *             properties:
 *               availableIngredientIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of available ingredient IDs
 *     responses:
 *       200:
 *         description: Recipes that can be made with available ingredients
 *       400:
 *         description: Invalid input data
 */
router.post("/recipes/makable", recipeController.getRecipesWithAvailableIngredients);

/**
 * @swagger
 * /api/recipes/bulk:
 *   post:
 *     tags:
 *       - Recipes
 *     summary: Create multiple recipes at once
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recipes
 *             properties:
 *               recipes:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/RecipeInput'
 *     responses:
 *       201:
 *         description: Recipes created successfully
 *       400:
 *         description: Invalid recipe data
 */
router.post("/recipes/bulk", recipeController.bulkCreateRecipes);

/**
 * @swagger
 * /api/recipes/{id}:
 *   get:
 *     tags:
 *       - Recipes
 *     summary: Get a recipe by ID with all ingredients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe found with ingredients
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   $ref: '#/components/schemas/Recipe'
 *       400:
 *         description: Invalid recipe ID
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
 *     summary: Create a new recipe with ingredients
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecipeInput'
 *     responses:
 *       201:
 *         description: Recipe created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 results:
 *                   $ref: '#/components/schemas/Recipe'
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid recipe data
 */
router.post("/recipes", recipeController.createRecipe);

/**
 * @swagger
 * /api/recipes/{id}:
 *   put:
 *     tags:
 *       - Recipes
 *     summary: Update an existing recipe and its ingredients
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecipeInput'
 *     responses:
 *       200:
 *         description: Recipe updated successfully
 *       400:
 *         description: Invalid recipe data
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
 *     summary: Delete a recipe by ID (also removes ingredient associations)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
 *       400:
 *         description: Invalid recipe ID
 *       404:
 *         description: Recipe not found
 */
router.delete("/recipes/:id", recipeController.deleteRecipe);

/**
 * @swagger
 * /api/recipes/{id}/ingredients:
 *   post:
 *     tags:
 *       - Recipes
 *     summary: Add an ingredient to an existing recipe
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - ingredientId
 *               - recipeQuantity
 *             properties:
 *               ingredientId:
 *                 type: integer
 *                 description: ID of the ingredient to add
 *               recipeQuantity:
 *                 type: string
 *                 description: Quantity needed for this recipe
 *               recipeUnit:
 *                 type: string
 *                 description: Unit for this recipe (optional)
 *               isOptional:
 *                 type: boolean
 *                 default: false
 *                 description: Whether ingredient is optional
 *               notes:
 *                 type: string
 *                 description: Recipe-specific notes (e.g., "diced", "room temperature")
 *     responses:
 *       200:
 *         description: Ingredient added to recipe successfully
 *       400:
 *         description: Invalid input data
 *       404:
 *         description: Recipe or ingredient not found
 */
router.post("/recipes/:id/ingredients", recipeController.addIngredientToRecipe);

/**
 * @swagger
 * /api/recipes/{id}/ingredients/{ingredientId}:
 *   delete:
 *     tags:
 *       - Recipes
 *     summary: Remove an ingredient from a recipe
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipe ID
 *       - in: path
 *         name: ingredientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Ingredient ID to remove
 *     responses:
 *       200:
 *         description: Ingredient removed from recipe successfully
 *       400:
 *         description: Invalid recipe ID or ingredient ID
 *       404:
 *         description: Recipe or ingredient association not found
 */
router.delete("/recipes/:id/ingredients/:ingredientId", recipeController.removeIngredientFromRecipe);

// API documentation endpoint
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Recipe API Documentation",
    version: "2.0.0",
    description: "Recipe management API with ingredient associations",
    endpoints: {
      "GET /api/recipes": "Get all recipes with pagination (?page=1&limit=10)",
      "GET /api/recipes/:id": "Get recipe by ID with ingredients",
      "POST /api/recipes": "Create new recipe with ingredients",
      "PUT /api/recipes/:id": "Update recipe and ingredients",
      "DELETE /api/recipes/:id": "Delete recipe",
      "GET /api/recipes/search?q=query": "Search recipes and ingredients",
      "GET /api/recipes/stats": "Get recipe statistics",
      "GET /api/recipes/by-servings?min=1&max=10": "Get recipes by serving range",
      "GET /api/recipes/by-ingredient?name=chicken": "Get recipes by ingredient name",
      "GET /api/recipes/by-ingredient-id/:ingredientId": "Get recipes by ingredient ID",
      "POST /api/recipes/makable": "Find makable recipes with available ingredients",
      "POST /api/recipes/bulk": "Create multiple recipes at once",
      "POST /api/recipes/:id/ingredients": "Add ingredient to recipe",
      "DELETE /api/recipes/:id/ingredients/:ingredientId": "Remove ingredient from recipe"
    },
    sampleRecipeInput: {
      name: "Chicken Stir Fry",
      cookTime: "15 minutes",
      servings: 4,
      instructions: "1. Cut chicken into strips. 2. Heat oil in wok. 3. Cook chicken until done. 4. Add vegetables and stir fry. 5. Add sauce and serve.",
      ingredients: [
        {
          ingredientId: 1,
          recipeQuantity: "1 lb",
          recipeUnit: "lb",
          isOptional: false,
          notes: "cut into strips"
        },
        {
          ingredientId: 2,
          recipeQuantity: "2 cups",
          recipeUnit: "cups",
          isOptional: false,
          notes: "cut into florets"
        }
      ]
    },
    sampleMakableRequest: {
      availableIngredientIds: [1, 2, 3, 5, 8]
    },
    sampleAddIngredient: {
      ingredientId: 5,
      recipeQuantity: "2 tbsp",
      recipeUnit: "tbsp",
      isOptional: true,
      notes: "for extra flavor"
    }
  });
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Recipe:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         cookTime:
 *           type: string
 *         servings:
 *           type: integer
 *         instructions:
 *           type: string
 *         Ingredients:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               RecipeIngredient:
 *                 type: object
 *                 properties:
 *                   recipeQuantity:
 *                     type: string
 *                   recipeUnit:
 *                     type: string
 *                   isOptional:
 *                     type: boolean
 *                   notes:
 *                     type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *     
 *     RecipeInput:
 *       type: object
 *       required:
 *         - name
 *         - cookTime
 *         - servings
 *         - instructions
 *       properties:
 *         name:
 *           type: string
 *           maxLength: 255
 *         cookTime:
 *           type: string
 *           maxLength: 100
 *         servings:
 *           type: integer
 *           minimum: 1
 *         instructions:
 *           type: string
 *         ingredients:
 *           type: array
 *           items:
 *             type: object
 *             required:
 *               - ingredientId
 *               - recipeQuantity
 *             properties:
 *               ingredientId:
 *                 type: integer
 *               recipeQuantity:
 *                 type: string
 *               recipeUnit:
 *                 type: string
 *               isOptional:
 *                 type: boolean
 *                 default: false
 *               notes:
 *                 type: string
 *     
 *     Pagination:
 *       type: object
 *       properties:
 *         totalCount:
 *           type: integer
 *         currentPage:
 *           type: integer
 *         totalPages:
 *           type: integer
 *         hasNext:
 *           type: boolean
 *         hasPrev:
 *           type: boolean
 */

module.exports = router;