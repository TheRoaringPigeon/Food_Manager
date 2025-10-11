\connect fm_db;

CREATE TABLE ingredients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    unit TEXT NOT NULL, -- e.g., grams, ml, pieces, cups
    category TEXT, -- e.g., dairy, produce, meat, spices
    created_at TIMESTAMP DEFAULT NOW(),
    expiration_date TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_ingredients_name ON ingredients(name);
CREATE INDEX idx_ingredients_category ON ingredients(category);