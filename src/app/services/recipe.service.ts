import { Injectable } from '@angular/core';
import {DatabaseService} from './database.service';
import {Platform} from '@ionic/angular';
import {SQLitePorter} from '@ionic-native/sqlite-porter/ngx';
import {SQLite} from '@ionic-native/sqlite/ngx';
import {HttpClient} from '@angular/common/http';
import {RecipeModel} from '../models/recipe.model';
import {MeasuredIngredientModel} from '../models/measured-ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService extends DatabaseService {

  constructor(
    protected plt: Platform,
    protected sqlitePorter: SQLitePorter,
    protected sqlite: SQLite,
    protected http: HttpClient
  ) {
    super(plt, sqlitePorter, sqlite, http);
  }

  public getRecipes(): Promise<RecipeModel[]> {
    return new Promise<RecipeModel[]>((resolve => {
      this.database.executeSql(
        'SELECT * FROM recipes',
        []
      ).then(data => {
        const recipes: RecipeModel[] = [];
        if (data.rows.length > 0) {
          for (let i = 0; i < data.rows.length; i++) {
            this.getRecipeIngredients(data.rows.item(i).id).then(ingredients => {
              recipes.push({
                id: data.rows.item(i).id,
                name: data.rows.item(i).name,
                description: data.rows.item(i).description,
                instructions: data.rows.item(i).instructions,
                imageUrl: data.rows.item(i).image_url,
                servings: data.rows.item(i).servings,
                ingredients,
              });
            });
          }
        }
        return resolve(recipes);
      });
    }));
  }

  public getRecipe(recipeId: number): Promise<RecipeModel> {
    return new Promise<RecipeModel>(((resolve, reject) => {
      this.database.executeSql(
        'SELECT * FROM recipes WHERE id=?',
        [recipeId]
      ).then(data => {
        if (data.rows.length > 0) {
          this.getRecipeIngredients(recipeId).then(ingredients => {
            const recipe = {
              id: data.rows.item(0).id,
              name: data.rows.item(0).name,
              description: data.rows.item(0).description,
              instructions: data.rows.item(0).instructions,
              imageUrl: data.rows.item(0).image_url,
              servings: data.rows.item(0).servings,
              ingredients,
            };
            return resolve(recipe);
          });
        } else {
          return reject();
        }
      });
    }));
  }

  private getRecipeIngredients(recipeId): Promise<MeasuredIngredientModel[]> {
    return new Promise<MeasuredIngredientModel[]>((resolve => {
      this.database.executeSql(
        'SELECT recipe_ingredients.ingredient_id, ingredients.name, recipe_ingredients.amount, recipe_ingredients.unit FROM recipe_ingredients JOIN ingredients ON recipe_ingredients.ingredient_id = ingredients.id WHERE recipe_ingredients.recipe_id = ?',
        [recipeId]
      ).then(data => {
        const recipeIngredients: MeasuredIngredientModel[] = [];
        if (data.rows.length > 0) {
          for (let i = 0; i < data.rows.length; i++) {
            recipeIngredients.push({
              id: data.rows.item(i).ingredient_id,
              name: data.rows.item(i).name,
              amount: data.rows.item(i).amount,
              unit: data.rows.item(i).unit,
            });
          }
        }
        return resolve(recipeIngredients);
      });
    }));
  }

  public addRecipe(recipe: RecipeModel): Promise<boolean> {
    return new Promise<boolean>(((resolve, reject) => {
      this.database.executeSql(
        'INSERT INTO recipes (name, description, instructions, image_url, servings) VALUES(?, ?, ?, ?, ?)',
        [recipe.name, recipe.description, recipe.instructions, recipe.imageUrl, recipe.servings]
      ).catch(() => {
        return reject();
      }).then(data => {
        this.addRecipeIngredients(data.insertId, recipe.ingredients)
          .catch(() => {
            return reject();
          })
          .then(() => {
            return resolve();
          });
      });
    }));
  }

  private addRecipeIngredients(recipeId, ingredients: MeasuredIngredientModel[]): Promise<boolean> {
    return new Promise<boolean>(((resolve, reject) => {
      this.database.transaction(tx => {
        ingredients.forEach(ingredient => {
          tx.executeSql(
            'INSERT INTO recipe_ingredients (recipe_id, ingredient_id, amount, unit) VALUES(?,?,?,?)',
            [recipeId, ingredient.id, ingredient.amount, ingredient.unit]);
        });
      }).catch(() => {
        return reject();
      }).then(() => {
        return resolve();
      });
    }));
  }

  public editRecipe(recipe: RecipeModel): Promise<boolean> {
    return new Promise<boolean>(((resolve, reject) => {
      this.database.executeSql(
        'UPDATE recipes SET name=?, description=?, instructions=?, image_url=?, servings=? WHERE id=?',
        [recipe.name, recipe.description, recipe.instructions, recipe.imageUrl, recipe.servings, recipe.id]
      ).catch(() => {
        return reject();
      }).then(() => {
        this.updateRecipeIngredients(recipe.id, recipe.ingredients)
          .catch(() => {
            return reject();
          })
          .then(() => {
            return resolve();
          });
      });
    }));
  }

  private updateRecipeIngredients(recipeId, ingredients: MeasuredIngredientModel[]): Promise<boolean> {
    return new Promise<boolean>(((resolve, reject) => {
      this.getRecipeIngredients(recipeId)
        .catch(() => {
          return reject();
        })
        .then(recipeIngredients => {
          const changes = this.compareIngredients(recipeIngredients, ingredients);
          Promise.all([
            this.removeRecipeIngredients(recipeId, changes.removedIngredients),
            this.editRecipeIngredients(recipeId, changes.updatedIngredients),
            this.addRecipeIngredients(recipeId, changes.addedIngredients)
          ])
            .catch(() => {
              return reject();
            })
            .then(() => {
              return resolve();
            });
        });
    }));
  }

  private compareIngredients(existingIngredients, newIngredients) {
    const removedIngredients: number[] = [];
    const updatedIngredients: MeasuredIngredientModel[] = [];
    const addedIngredients: MeasuredIngredientModel[] = [];
    existingIngredients.forEach(existingIngredient => {
      if (!newIngredients.map(newIngredient => newIngredient.id).includes(existingIngredient.id)) {
        removedIngredients.push(existingIngredient.id);
      }
      if (newIngredients.map(newIngredient => newIngredient.id).includes(existingIngredient.id)) {
        const newIngredient = newIngredients.find(ingredient => ingredient.id === existingIngredient.id);
        if (newIngredient.amount !== existingIngredient.amount || newIngredient.unit !== existingIngredient.unit) {
          updatedIngredients.push(newIngredient);
        }
      }
    });
    newIngredients.forEach(newIngredient => {
      if (!existingIngredients.map(existingIngredient => existingIngredient.id).includes(newIngredient.id)) {
        addedIngredients.push(newIngredient);
      }
    });
    return {removedIngredients, updatedIngredients, addedIngredients};
  }

  private removeRecipeIngredients(recipeId: number, ingredients: number[]): Promise<boolean> {
    return new Promise<boolean>(((resolve, reject) => {
      if (ingredients.length === 0) {
        return resolve();
      }
      this.database.transaction(tx => {
        ingredients.forEach(ingredientId => {
          tx.executeSql(
            'DELETE FROM recipe_ingredients WHERE recipe_id=? AND ingredient_id=?',
            [recipeId, ingredientId]
          );
        });
      })
        .catch(() => {
          return reject();
        })
        .then(() => {
          return resolve();
        });
    }));
  }

  private editRecipeIngredients(recipeId, ingredients): Promise<boolean> {
    return new Promise<boolean>(((resolve, reject) => {
      if (ingredients.length === 0) {
        return resolve();
      }
      this.database.transaction(tx => {
        ingredients.forEach(ingredient => {
          tx.executeSql(
            'UPDATE recipe_ingredients SET amount=?, unit=? WHERE recipe_id=? AND ingredient_id=?',
            [ingredient.amount, ingredient.unit, recipeId, ingredient.id]
          );
        });
      })
        .catch(() => {
          return reject();
        })
        .then(() => {
          return resolve();
        });
    }));
  }

  public removeRecipe(recipe: RecipeModel): Promise<boolean> {
    return new Promise<boolean>(((resolve, reject) => {
      this.database.executeSql(
        'DELETE FROM recipes WHERE id=?',
        [recipe.id]
      )
        .catch(() => {
          return reject();
        })
        .then(() => {
        this.removeRecipeIngredients(recipe.id, recipe.ingredients.map(ingredient => ingredient.id))
          .catch(() => {
            return reject();
          })
          .then(() => {
            return resolve();
          });
      });
    }));
  }

}
