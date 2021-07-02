import {Injectable} from '@angular/core';
import {DatabaseService} from './database.service';
import {Platform} from '@ionic/angular';
import {SQLitePorter} from '@ionic-native/sqlite-porter/ngx';
import {SQLite} from '@ionic-native/sqlite/ngx';
import {HttpClient} from '@angular/common/http';
import {MeasuredIngredientModel} from '../models/measured-ingredient.model';
import {FoodDiaryModel} from '../models/food-diary.model';

@Injectable({
  providedIn: 'root'
})
export class FoodDiaryService extends DatabaseService {

  constructor(
    protected plt: Platform,
    protected sqlitePorter: SQLitePorter,
    protected sqlite: SQLite,
    protected http: HttpClient
  ) {
    super(plt, sqlitePorter, sqlite, http);
  }

  public getFoodDiaries(): Promise<FoodDiaryModel[]> {
    return new Promise<FoodDiaryModel[]>((resolve => {
      this.database.executeSql(
        'SELECT * FROM food_diary',
        []
      ).then(async data => {
        const foodDiaries: FoodDiaryModel[] = [];
        if (data.rows.length > 0) {
          for (let i = 0; i < data.rows.length; i++) {
            await this.getDiaryEntries(data.rows.item(i).id).then(diaryEntries => {
              foodDiaries.push({
                id: data.rows.item(i).id,
                createdDatetime: data.rows.item(i).created_datetime,
                diaryEntries,
                notes: data.rows.item(i).notes,
              });
            });
          }
        }
        return resolve(foodDiaries);
      });
    }));
  }

  private getDiaryEntries(foodDiaryId: number): Promise<MeasuredIngredientModel[]> {
    return new Promise<MeasuredIngredientModel[]>((resolve => {
      this.database.executeSql(
        'SELECT food_diary_items.ingredient_id, ingredients.name, food_diary_items.amount, food_diary_items.unit FROM food_diary_items JOIN ingredients ON food_diary_items.ingredient_id = ingredients.id WHERE food_diary_items.food_diary_id = ?',
        [foodDiaryId]
      ).then(data => {
        const diaryEntries: MeasuredIngredientModel[] = [];
        if (data.rows.length > 0) {
          for (let i = 0; i < data.rows.length; i++) {
            diaryEntries.push({
              id: data.rows.item(i).ingredient_id,
              name: data.rows.item(i).name,
              amount: data.rows.item(i).amount,
              unit: data.rows.item(i).unit,
            });
          }
        }
        return resolve(diaryEntries);
      });
    }));
  }

  public addFoodDiary(date: Date): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.database.executeSql(
        'INSERT INTO food_diary (created_datetime, notes) VALUES(?, ?)',
        [date, '']
      ).catch(() => {
        reject();
      }).then(() => {
        resolve();
      });
    });
  }

  public addFoodDiaryEntries(foodDiaryId: number, ingredients: MeasuredIngredientModel[]): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.database.transaction(tx => {
        ingredients.forEach(ingredient => {
          tx.executeSql(
            'INSERT INTO food_diary_items (food_diary_id, ingredient_id, amount, unit) VALUES (?,?,?,?)',
            [foodDiaryId, ingredient.id, ingredient.amount, ingredient.unit]
          );
        });
      }).catch(() => {
        reject();
      }).then(() => {
        resolve();
      });
    });
  }

  public updateNote(foodDiaryId: number, notes: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.database.executeSql(
        'UPDATE food_diary SET notes=? WHERE id=?',
        [notes, foodDiaryId]
      ).catch(() => {
        reject();
      }).then(data => {
        resolve();
      });
    });
  }
}
