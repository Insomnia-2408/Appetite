import {Injectable} from '@angular/core';
import {SQLite, SQLiteObject} from '@ionic-native/sqlite/ngx';
import {BehaviorSubject} from 'rxjs';
import {Platform} from '@ionic/angular';
import {SQLitePorter} from '@ionic-native/sqlite-porter/ngx';
import {HttpClient} from '@angular/common/http';
import {IngredientModel} from '../models/ingredient.model';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  protected database: SQLiteObject;
  protected dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  constructor(
    protected plt: Platform,
    protected sqlitePorter: SQLitePorter,
    protected sqlite: SQLite,
    protected http: HttpClient
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
          return resolve(ingredients);
        }
      );
    }));
  }

  public addIngredient(ingredient): Promise<void> {
    return new Promise<void>(((resolve, reject) => {
      this.database.executeSql(
        'INSERT INTO ingredients (name) VALUES (?)',
        [ingredient]
      ).catch(() => {
        return reject();
      }).then(data => {
        return resolve(data.insertId);
      });
    }));
  }
}
