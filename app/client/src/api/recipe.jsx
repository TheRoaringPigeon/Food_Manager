import { backendApiClient } from "./client";

export async function getAllRecipes() {
    const response = await backendApiClient().get('/recipes');
    return response.data;
}

export async function getRecipeByID(recipeID) {
    const response = await backendApiClient().get(`/recipes/${recipeID}`);
    return response.data;
}

export async function createRecipe(newRecipe) {
    const response = await backendApiClient().post('/recipes', newRecipe);
    return response.data;
}

export async function updateRecipe(recipeID, newRecipe) {
    const response = await backendApiClient().put(`/recipes/${recipeID}`, newRecipe);
    return response.data;
}

export async function deleteRecipe(recipeID) {
    const response = await backendApiClient().delete(`/recipes/${recipeID}`);
    return response.data;
}

export async function searchRecipes(query) {
    if (!query) {
        throw new Error("Search query is required");
    }

    const response = await backendApiClient().get(`/recipes/search`, {
        params: { q: query }
    });

    return response.data;
}

export async function addIngredientToRecipe(recipeId, ingredientData) {
    const response = await backendApiClient().post(`/recipes/${recipeId}/ingredients`, ingredientData);
    return response.data;
}

export async function removeIngredientFromRecipe(recipeId, ingredientId) {
    const response = await backendApiClient().delete(`/recipes/${recipeId}/ingredients/${ingredientId}`);
    return response.data;
}

export async function getRecipesByServings(minServings, maxServings) {
    const response = await backendApiClient().get('/recipes/by-servings', {
        params: { min: minServings, max: maxServings }
    });
    return response.data;
}

export async function getRecipesByIngredient(ingredientName) {
    const response = await backendApiClient().get('/recipes/by-ingredient', {
        params: { name: ingredientName }
    });
    return response.data;
}

export async function getRecipesByIngredientId(ingredientId) {
    const response = await backendApiClient().get(`/recipes/by-ingredient-id/${ingredientId}`);
    return response.data;
}

export async function getRecipeStats() {
    const response = await backendApiClient().get('/recipes/stats');
    return response.data;
}

export async function getRecipesWithAvailableIngredients(availableIngredientIds) {
    const response = await backendApiClient().post('/recipes/makable', {
        availableIngredientIds
    });
    return response.data;
}

export async function bulkCreateRecipes(recipes) {
    const response = await backendApiClient().post('/recipes/bulk', {
        recipes
    });
    return response.data;
}