import {Injectable} from '@angular/core';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite/ngx';
import {BehaviorSubject} from 'rxjs';
import {Platform} from '@ionic/angular';
import {SQLitePorter} from '@ionic-native/sqlite-porter/ngx';
import {HttpClient} from '@angular/common/http';
import {RecipeModel} from '../models/recipe.model';
import {MeasuredIngredientModel} from '../models/measured-ingredient.model';
import {IngredientModel} from '../models/ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    private plt: Platform,
    private sqlitePorter: SQLitePorter,
    private sqlite: SQLite,
    private http: HttpClient
  ) {
    this.plt.ready().then(() => {
      this.sqlite.create({
        name: 'appetite.db',
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          this.database = db;
          this.seedDatabase();
        });
    });
  }

  private seedDatabase() {
    this.http.get('assets/seed.sql', {responseType: 'text'})
      .subscribe(sql => {
        this.sqlitePorter.importSqlToDb(this.database, sql)
          .then(_ => {
            this.dbReady.next(true);
          })
          .catch(e => console.error(e));
      });
  }

  public getDatabaseState() {
    return this.dbReady.asObservable();
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
        resolve(recipes);
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
            resolve(recipe);
          });
        } else {
          reject();
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
        resolve(recipeIngredients);
      });
    }));
  }

  public addRecipe(recipe: RecipeModel): Promise<boolean> {
    return new Promise<boolean>(((resolve, reject) => {
      this.database.executeSql(
        'INSERT INTO recipes (name, description, instructions, image_url, servings) VALUES(?, ?, ?, ?, ?)',
        [recipe.name, recipe.description, recipe.instructions, recipe.imageUrl, recipe.servings]
      ).catch(() => {
        reject();
      }).then(data => {
        this.addRecipeIngredients(data.insertId, recipe.ingredients)
          .catch(() => {
            reject();
          })
          .then(() => {
            resolve();
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
        reject();
      }).then(() => {
        resolve();
      });
    }));
  }

  public getIngredients(): Promise<IngredientModel[]> {
    return new Promise<IngredientModel[]>((resolve => {
      this.database.executeSql(
        'SELECT * FROM ingredients',
        []
      ).then(data => {
          const ingredients: IngredientModel[] = [];
          if (data.rows.length > 0) {
            for (let i = 0; i < data.rows.length; i++) {
              ingredients.push({
                id: data.rows.item(i).id,
                name: data.rows.item(i).name,
              });
            }
          }
          resolve(ingredients);
        }
      );
    }));
  }

  public addIngredient(ingredient): Promise<boolean> {
    return new Promise<boolean>(((resolve, reject) => {
      this.database.executeSql(
        'INSERT INTO ingredients (name) VALUES (?)',
        [ingredient]
      ).catch(() => {
        reject();
      }).then(() => {
        resolve();
      });
    }));
  }

}
