/**
 * Recipe Model
 * Handles data structure and basic validation for recipes
 */

class Recipe {
    constructor(id, name, instructions) {
        this.id = id;
        this.name = name;
        this.instructions = instructions;
        this.createdAt = new Date();
        this.updatedAt = new Date();
    }

    // Validate recipe data
    static validate(data) {
        const errors = [];
        
        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            errors.push('Name is required and must be a non-empty string');
        }
        
        if (!data.instructions || typeof data.instructions !== 'string' || data.instructions.trim() === '') {
            errors.push('Instructions are required and must be a non-empty string');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }

    // Create a new recipe instance from raw data
    static create(id, data) {
        return new Recipe(id, data.name.trim(), data.instructions.trim());
    }

    // Update recipe instance
    update(data) {
        if (data.name) this.name = data.name.trim();
        if (data.instructions) this.instructions = data.instructions.trim();
        this.updatedAt = new Date();
    }

    // Convert to plain object (for JSON responses)
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            instructions: this.instructions,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Recipe;