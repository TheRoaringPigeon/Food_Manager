\connect fm_db;

CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    unit TEXT NOT NULL, -- e.g., grams, ml, pieces, cups
    category TEXT -- e.g., dairy, produce, meat, spices
);

CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_category ON ingredients(category);