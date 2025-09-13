import { backendApiClient } from "./client";

export async function getAllIngredients() {
    const response = await backendApiClient().get('/ingredients');
    return response.data;
}

export async function getIngredientByID(ingredientID) {
    const response = await backendApiClient().get(`/ingredients/${ingredientID}`);
    return response.data;
}

export async function createIngredient(newIngredient) {
    const response = await backendApiClient().post('/ingredients', newIngredient);
    return response.data;
}

export async function updateIngredient(ingredientID, newIngredient) {
    const response = await backendApiClient().put(`/ingredients/${ingredientID}`, newIngredient);
    return response.data;
}

export async function deleteIngredient(ingredientID) {
    const response = await backendApiClient().delete(`/ingredients/${ingredientID}`);
    return response.data;
}

export async function searchIngredients(query) {
    if (!query) {
        throw new Error("Search query is required");
    }

    const response = await backendApiClient().get(`/ingredients/search`, {
        params: { q: query }
    });

    return response.data;
}
