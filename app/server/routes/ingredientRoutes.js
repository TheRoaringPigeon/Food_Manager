/**
 * Ingredient Routes
 * Defines all ingredient-related endpoints and maps them to controller methods
 */

const express = require("express");
const router = express.Router();
const ingredientController = require("../controllers/ingredientController");

// API documentation endpoint
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

// Special routes (must come before /:id route to avoid conflicts)
router.get("/ingredients/search", ingredientController.searchIngredients);

// CRUD routes
router.get("/ingredients", ingredientController.getAllIngredients);
router.get("/ingredients/:id", ingredientController.getIngredientById);
router.post("/ingredients", ingredientController.createIngredient);
router.put("/ingredients/:id", ingredientController.updateIngredient);
router.delete("/ingredients/:id", ingredientController.deleteIngredient);

module.exports = router;
