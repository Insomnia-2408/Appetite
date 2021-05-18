import { Component, OnInit } from '@angular/core';
import {RecipeModel} from '../../models/recipe.model';
import {ActivatedRoute, Router} from '@angular/router';
import {PopupService} from '../../services/popup.service';
import {RecipeService} from "../../services/recipe.service";
import {ImageService} from "../../services/image.service";

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
  public servingsModifier;

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private recipeService: RecipeService,
    private popupService: PopupService,
    private imageService: ImageService
  ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(params => {
        this.recipeId = params.id;
        this.loadRecipe();
    });
  }

  public loadRecipe() {
    this.recipeService.getRecipe(this.recipeId).then(recipe => {
      this.recipe = recipe;
      this.servingsModifier = recipe.servings;
      this.loadingRecipe = false;
    }).catch(() => {
      this.popupService.presentToast('Something went wrong when loading the recipe, try again later');
    });
  }

  public navigateBack() {
    this.router.navigate(['/recipes']);
  }

  public editRecipe(recipe) {
    if (recipe !== null) {
      this.recipeService.editRecipe(recipe)
        .catch(() => {
          this.popupService.presentToast(`Something went wrong when editing ${recipe.name}, try again later`);
        })
        .then(() => {
          this.popupService.presentToast(`Edited ${recipe.name}`);
          this.editing = false;
          this.loadingRecipe = true;
          this.loadRecipe();
        });
    } else {
      this.editing = false;
    }
  }

  public getModifiedAmount(amount) {
    return Math.round(((amount/this.recipe.servings) * this.servingsModifier) * 100) / 100;
  }

  public getImage() {
    return this.recipe.imageUrl ? this.recipe.imageUrl : this.imageService.getDefaultImage();
  }

  public openRemoveRecipe() {
    this.popupService.showPrompt(
      `Remove ${this.recipe.name}`,
      `Are you certain that you want to remove ${this.recipe.name}?`,
      [],
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Yes I\'m sure',
          handler: () => {
            this.removeRecipe();
          }
        }
      ]
    );
  }

  private removeRecipe() {
    this.recipeService.removeRecipe(this.recipe)
      .catch(() => {
        this.popupService.presentToast('Something went wrong while removing the recipe, try again later');
      })
      .then(() => {
        this.popupService.presentToast(`${this.recipe.name} was removed`);
        this.navigateBack();
      })
  }
}
