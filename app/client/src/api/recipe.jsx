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
