\connect fm_db;

CREATE TABLE prepared_food (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    recipe_id INT REFERENCES recipes(id) ON DELETE SET NULL, -- NULL if not from a recipe
    quantity NUMERIC NOT NULL, -- servings or portions
    unit TEXT DEFAULT 'servings',
    prepared_date TIMESTAMP DEFAULT NOW(),
    expiration_date DATE,
    location TEXT, -- fridge, freezer, counter
    status TEXT DEFAULT 'fresh', -- fresh, opened, consumed, expired
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_prepared_food_name ON prepared_food(name);
CREATE INDEX idx_prepared_food_recipe ON prepared_food(recipe_id);
CREATE INDEX idx_prepared_food_expiration ON prepared_food(expiration_date);
CREATE INDEX idx_prepared_food_status ON prepared_food(status);