CREATE TABLE IF NOT EXISTS recipes(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  description TEXT,
  instructions TEXT,
  image_url TEXT
);

CREATE TABLE IF NOT EXISTS ingredients(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ingredient TEXT
);

CREATE TABLE IF NOT EXISTS recipe_ingredients(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  recipe_id INTEGER,
  ingredient_id INTEGER,
  amount INTEGER,
  unit TEXT,
  FOREIGN KEY(recipe_id) REFERENCES recipes(id),
  FOREIGN KEY(ingredient_id) REFERENCES ingredients(id)
);

CREATE TABLE IF NOT EXISTS grocery_lists(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  created_datetime TEXT,
);

CREATE TABLE IF NOT EXISTS grocery_list_ingredients(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  grocery_list_id INTEGER,
  ingredient_id INTEGER,
  amount INTEGER,
  unit TEXT,
  FOREIGN KEY(grocery_list_id) REFERENCES grocery_lists(id),
  FOREIGN KEY(ingredient_id) REFERENCES ingredients(id)
);
