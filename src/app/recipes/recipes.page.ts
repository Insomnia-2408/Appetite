import {Component, OnInit} from '@angular/core';
import {DatabaseService} from '../services/database.service';
import {RecipeModel} from '../models/recipe.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.page.html',
  styleUrls: ['./recipes.page.scss'],
})
export class RecipesPage implements OnInit {

  public recipes: Array<RecipeModel>;
  public loadingRecipes = true;

  constructor(private databaseService: DatabaseService, private router: Router) {
  }

  ngOnInit() {
    this.loadRecipes();
  }

  public loadRecipes() {
    this.databaseService.getDatabaseState().subscribe(result => {
      if (result) {
        this.databaseService.getRecipes().then(recipes => {
          this.recipes = recipes;
          this.loadingRecipes = false;
        });
      }
    });
  }

  ionViewWillEnter() {
    this.loadRecipes();
  }

  public navigateToDetail(id: number) {
    this.router.navigate([`/recipes/${id}`]);
  }
}
