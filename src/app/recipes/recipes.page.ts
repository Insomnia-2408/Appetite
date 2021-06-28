import {Component, OnInit} from '@angular/core';
import {RecipeModel} from '../models/recipe.model';
import {Router} from '@angular/router';
import {ImageService} from '../services/image.service';
import {RecipeService} from '../services/recipe.service';

@Component({
  selector: 'app-recipes',
  templateUrl: './recipes.page.html',
  styleUrls: ['./recipes.page.scss'],
})
export class RecipesPage implements OnInit {

  public recipes: Array<RecipeModel>;
  public loadingRecipes = true;

  constructor(
    private recipeService: RecipeService,
    private router: Router,
    private imageService: ImageService
  ) {
  }

  ngOnInit() {
    this.loadRecipes();
  }

  public loadRecipes() {
    this.recipeService.getDatabaseState().subscribe(result => {
      if (result) {
        this.recipeService.getRecipes().then(recipes => {
          this.recipes = recipes;
          this.loadingRecipes = false;
        });
      }
    });
  }

  ionViewWillEnter() {
    this.loadRecipes();
  }

  public getImage(recipe: RecipeModel) {
    return recipe.imageUrl ? recipe.imageUrl : this.imageService.getDefaultImage();
  }
}
