/**
 * Ingredient Routes
 * Defines all ingredient-related endpoints and maps them to controller methods
 */

const express = require("express");
const router = express.Router();
const ingredientController = require("../controllers/ingredientController");

/**
 * @swagger
 * tags:
 *   name: Ingredients
 *   description: Ingredient management endpoints
 */

/**
 * @swagger
 * /api/ingredients:
 *   get:
 *     tags:
 *       - Ingredients
 *     summary: Get all ingredients
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
 *         description: Return simplified ingredient info
 *     responses:
 *       200:
 *         description: List of ingredients
 */
router.get("/ingredients", ingredientController.getAllIngredients);

/**
 * @swagger
 * /api/ingredients/search:
 *   get:
 *     tags:
 *       - Ingredients
 *     summary: Search ingredients by name or category
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
 *         description: Ingredient not found
 */
router.get("/ingredients/search", ingredientController.searchIngredients);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   get:
 *     tags:
 *       - Ingredients
 *     summary: Get an ingredient by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ingredient found
 *       404:
 *         description: Ingredient not found
 */
router.get("/ingredients/:id", ingredientController.getIngredientById);

/**
 * @swagger
 * /api/ingredients:
 *   post:
 *     tags:
 *       - Ingredients
 *     summary: Create a new ingredient
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - quantity
 *               - unit
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Ingredient created successfully
 */
router.post("/ingredients", ingredientController.createIngredient);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   put:
 *     tags:
 *       - Ingredients
 *     summary: Update an existing ingredient
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
 *               category:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unit:
 *                 type: string
 *               expiryDate:
 *                 type: string
 *                 format: date
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ingredient updated successfully
 *       404:
 *         description: Ingredient not found
 */
router.put("/ingredients/:id", ingredientController.updateIngredient);

/**
 * @swagger
 * /api/ingredients/{id}:
 *   delete:
 *     tags:
 *       - Ingredients
 *     summary: Delete an ingredient by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Ingredient deleted successfully
 *       404:
 *         description: Ingredient not found
 */
router.delete("/ingredients/:id", ingredientController.deleteIngredient);

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Ingredient API Documentation",
    version: "1.0.0",
    endpoints: {
      "GET /api/ingredients":
      "Get all ingredients (supports ?page=1&limit=10&simple=true)",
      "GET /api/ingredients/:id": "Get ingredient by ID",
      "POST /api/ingredients": "Create new ingredient",
      "PUT /api/ingredients/:id": "Update ingredient",
      "DELETE /api/ingredients/:id": "Delete ingredient",
      "GET /api/ingredients/search?q=query": "Search ingredients",
    },
    sampleIngredient: {
      id: 1,
      name: "Chicken Breast",
      category: "Protein",
      quantity: 2,
      unit: "lbs",
      expiryDate: "2024-09-15",
      location: "Refrigerator",
    },
  });
});

module.exports = router;
