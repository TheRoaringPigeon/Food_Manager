\connect fm_db;

CREATE TABLE ingredient_inventory (
    id SERIAL PRIMARY KEY,
    ingredient_id INT NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
    quantity NUMERIC NOT NULL,
    purchase_date DATE DEFAULT CURRENT_DATE,
    expiration_date DATE,
    location TEXT, -- fridge, freezer, pantry, etc.
    notes TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inventory_ingredient ON ingredient_inventory(ingredient_id);
CREATE INDEX idx_inventory_expiration ON ingredient_inventory(expiration_date);
CREATE INDEX idx_inventory_location ON ingredient_inventory(location);