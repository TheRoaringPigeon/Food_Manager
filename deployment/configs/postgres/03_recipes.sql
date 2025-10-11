\connect fm_db;

CREATE TABLE recipes (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    servings INT DEFAULT 1,
    prep_time_minutes INT,
    cook_time_minutes INT,
    instructions TEXT
);

CREATE INDEX idx_recipes_name ON recipes(name);