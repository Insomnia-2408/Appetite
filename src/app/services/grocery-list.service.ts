import {Injectable} from '@angular/core';
import {DatabaseService} from './database.service';
import {Platform} from '@ionic/angular';
import {SQLitePorter} from '@ionic-native/sqlite-porter/ngx';
import {SQLite} from '@ionic-native/sqlite/ngx';
import {HttpClient} from '@angular/common/http';
import {GroceryListModel} from '../models/grocery-list.model';
import {MeasuredIngredientModel} from '../models/measured-ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class GroceryListService extends DatabaseService {

  constructor(
    protected plt: Platform,
    protected sqlitePorter: SQLitePorter,
    protected sqlite: SQLite,
    protected http: HttpClient
  ) {
    super(plt, sqlitePorter, sqlite, http);
  }

  public getGroceryLists(): Promise<GroceryListModel[]> {
    return new Promise<GroceryListModel[]>((resolve => {
      this.database.executeSql(
        'SELECT * FROM grocery_lists',
        []
      ).then(async data => {
        const groceryLists: GroceryListModel[] = [];
        if (data.rows.length > 0) {
          for (let i = 0; i < data.rows.length; i++) {
            await this.getGroceries(data.rows.item(i).id).then(groceries => {
              groceryLists.push({
                id: data.rows.item(i).id,
                name: data.rows.item(i).name,
                createdDatetime: data.rows.item(i).created_datetime,
                groceries,
              });
            });
          }
        }
        return resolve(groceryLists);
      });
    }));
  }

  private getGroceries(groceryListId: number): Promise<MeasuredIngredientModel[]> {
    return new Promise<MeasuredIngredientModel[]>((resolve => {
      this.database.executeSql(
        'SELECT grocery_list_ingredients.ingredient_id, ingredients.name, grocery_list_ingredients.amount, grocery_list_ingredients.unit, grocery_list_ingredients.checked FROM grocery_list_ingredients JOIN ingredients ON grocery_list_ingredients.ingredient_id = ingredients.id WHERE grocery_list_ingredients.grocery_list_id = ?',
        [groceryListId]
      ).then(data => {
        const groceries: MeasuredIngredientModel[] = [];
        if (data.rows.length > 0) {
          for (let i = 0; i < data.rows.length; i++) {
            groceries.push({
              id: data.rows.item(i).ingredient_id,
              name: data.rows.item(i).name,
              amount: data.rows.item(i).amount,
              unit: data.rows.item(i).unit,
              checked: data.rows.item(i).checked,
            });
          }
        }
        return resolve(groceries);
      });
    }));
  }

  public addGroceryList(groceryList: GroceryListModel): Promise<void> {
    return new Promise<void>(((resolve, reject) => {
      this.database.executeSql(
        'INSERT INTO grocery_lists (name, created_datetime) VALUES(?, ?)',
        [groceryList.name, new Date()]
      ).catch(() => {
        return reject();
      }).then(data => {
        this.addGroceries(data.insertId, groceryList.groceries)
          .catch(() => {
            return reject();
          })
          .then(() => {
            return resolve();
          });
      });
    }));
  }

  private addGroceries(groceryListId: number, groceries: Array<MeasuredIngredientModel>): Promise<void> {
    return new Promise<void>(((resolve, reject) => {
      this.database.transaction(tx => {
        groceries.forEach(grocery => {
          tx.executeSql(
            'INSERT INTO grocery_list_ingredients (grocery_list_id, ingredient_id, amount, unit, checked) VALUES(?,?,?,?,?)',
            [groceryListId, grocery.id, grocery.amount, grocery.unit, grocery.checked]);
        });
      }).catch(() => {
        return reject();
      }).then(() => {
        return resolve();
      });
    }));
  }

  public getGroceryList(groceryListId: number): Promise<GroceryListModel> {
    return new Promise<GroceryListModel>(((resolve, reject) => {
      this.database.executeSql(
        'SELECT * FROM grocery_lists WHERE id=?',
        [groceryListId]
      ).then(async data => {
        if (data.rows.length > 0) {
          await this.getGroceries(groceryListId).then(groceries => {
            const groceryList = {
              id: data.rows.item(0).id,
              name: data.rows.item(0).name,
              createdDatetime: data.rows.item(0).created_datetime,
              groceries,
            };
            return resolve(groceryList);
          });
        } else {
          return reject();
        }
      });
    }));
  }

  public editGroceryList(groceryList: GroceryListModel): Promise<void> {
    return new Promise<void>(((resolve, reject) => {
      this.database.executeSql(
        'UPDATE grocery_lists SET name=? WHERE id=?',
        [groceryList.name, groceryList.id]
      ).catch(() => {
        return reject();
      }).then(() => {
        this.updateGroceries(groceryList.id, groceryList.groceries)
          .catch(() => {
            return reject();
          })
          .then(() => {
            return resolve();
          });
      });
    }));
  }

  private updateGroceries(groceryListId: number, groceries: Array<MeasuredIngredientModel>) {
    return new Promise<void>(((resolve, reject) => {
      this.getGroceries(groceryListId)
        .catch(() => {
          return reject();
        })
        .then(groceryListGroceries => {
          const changes = this.compareGroceries(groceryListGroceries, groceries);
          Promise.all([
            this.removeGroceryListGroceries(groceryListId, changes.removedGroceries),
            this.editGroceryListGroceries(groceryListId, changes.updatedGroceries),
            this.addGroceries(groceryListId, changes.addedGroceries)
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

  private compareGroceries(existingGroceries, newGroceries) {
    const removedGroceries: MeasuredIngredientModel[] = [];
    const updatedGroceries: MeasuredIngredientModel[] = [];
    const addedGroceries: MeasuredIngredientModel[] = [];
    existingGroceries.forEach(existingGrocery => {
      if (!newGroceries.map(newGrocery => newGrocery.id).includes(existingGrocery.id)) {
        removedGroceries.push(existingGrocery);
      }
      if (newGroceries.map(newGrocery => newGrocery.id).includes(existingGrocery.id)) {
        const newGrocery = newGroceries.find(ingredient => ingredient.id === existingGrocery.id);
        if (
          newGrocery.amount !== existingGrocery.amount ||
          newGrocery.unit !== existingGrocery.unit ||
          newGrocery.checked !== existingGrocery.checked
        ) {
          updatedGroceries.push(newGrocery);
        }
      }
    });
    newGroceries.forEach(newGrocery => {
      if (!existingGroceries.map(existingGrocery => existingGrocery.id).includes(newGrocery.id)) {
        addedGroceries.push(newGrocery);
      }
    });
    return {removedGroceries, updatedGroceries, addedGroceries};
  }

  private removeGroceryListGroceries(groceryListId: number, groceries: MeasuredIngredientModel[]): Promise<void> {
    return new Promise<void>(((resolve, reject) => {
      if (groceries.length === 0) {
        return resolve();
      }
      this.database.transaction(tx => {
        groceries.forEach(grocery => {
          tx.executeSql(
            'DELETE FROM grocery_list_ingredients WHERE grocery_list_id=? AND ingredient_id=?',
            [groceryListId, grocery.id]
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

  private editGroceryListGroceries(groceryListId: number, groceries: MeasuredIngredientModel[]): Promise<void> {
    return new Promise<void>(((resolve, reject) => {
      if (groceries.length === 0) {
        return resolve();
      }
      this.database.transaction(tx => {
        groceries.forEach(grocery => {
          tx.executeSql(
            'UPDATE grocery_list_ingredients SET amount=?, unit=?, checked=? WHERE grocery_list_id=? AND ingredient_id=?',
            [grocery.amount, grocery.unit, grocery.checked, groceryListId, grocery.id]
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

  public removeGroceryList(groceryList: GroceryListModel): Promise<void> {
    return new Promise<void>(((resolve, reject) => {
      this.database.executeSql(
        'DELETE FROM grocery_lists WHERE id=?',
        [groceryList.id]
      )
        .catch(() => {
          return reject();
        })
        .then(() => {
          this.removeGroceryListGroceries(groceryList.id, groceryList.groceries)
            .catch(() => {
              return reject();
            })
            .then(() => {
              return resolve();
            });
        });
    }));
  }

  public addEmptyGroceryList(groceryListName: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.database.executeSql(
        'INSERT INTO grocery_lists (name, created_datetime) VALUES(?, ?)',
        [groceryListName, new Date()]
      ).catch(() => {
        return reject();
      }).then(() => {
        return resolve();
      });
    });
  }
}
