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
  private defaultImage = 'http://beepeers.com/assets/images/commerces/default-image.jpg';

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
      if (recipe.imageUrl === undefined) {
        this.recipe.imageUrl = this.defaultImage;
      }
      this.loadingRecipe = false;
    }).catch(() => {
      this.toastService.presentToast('Something went wrong when loading the recipe, try again later');
    });
  }

  public navigateBack() {
    this.router.navigate(['/recipes']);
  }

  public editRecipe() {
    console.log('Edit recipe');
  }
}
