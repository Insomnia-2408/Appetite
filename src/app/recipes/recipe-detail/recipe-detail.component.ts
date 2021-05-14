import { Component, OnInit } from '@angular/core';
import {RecipeModel} from '../../models/recipe.model';
import {ActivatedRoute, Router} from '@angular/router';
import {DatabaseService} from '../../services/database.service';
import {ToastService} from '../../services/toast.service';

@Component({
  selector: 'app-recipe-detail',
  templateUrl: './recipe-detail.component.html',
  styleUrls: ['./recipe-detail.component.scss'],
})
export class RecipeDetailComponent implements OnInit {
  public recipe: RecipeModel;
  public recipeId: number;
  public loadingRecipe = true;
  public editing = false;
  private defaultImage = 'https://i.stack.imgur.com/y9DpT.jpg';

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private databaseService: DatabaseService,
    private toastService: ToastService,
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
        this.recipeId = params.id;
        this.loadRecipe();
    });
  }

  public loadRecipe() {
    this.databaseService.getRecipe(this.recipeId).then(recipe => {
      this.recipe = recipe;
      // if (recipe.imageUrl.trim() === '') {
      //   this.recipe.imageUrl = this.defaultImage;
      // }
      this.loadingRecipe = false;
    }).catch(() => {
      this.toastService.presentToast('Something went wrong when loading the recipe, try again later');
    });
  }

  public navigateBack() {
    this.router.navigate(['/recipes']);
  }

  public editRecipe(recipe) {
    this.databaseService.editRecipe(recipe)
      .catch(() => {
        this.toastService.presentToast(`Something went wrong when editing ${recipe.name}, try again later`);
      })
      .then(() => {
        this.toastService.presentToast(`Edited ${recipe.name}`);
        this.editing = false;
        this.loadingRecipe = true;
        this.loadRecipe();
    });
  }

  public getImage() {
    return this.recipe.imageUrl ? this.recipe.imageUrl : this.defaultImage;
  }
}
