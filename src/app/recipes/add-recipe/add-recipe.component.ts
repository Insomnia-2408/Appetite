import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {IngredientModel} from '../../models/ingredient.model';
import {PopupService} from '../../services/popup.service';
import {RecipeService} from "../../services/recipe.service";

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.scss'],
})
export class AddRecipeComponent implements OnInit {

  public ingredients: IngredientModel[];
  public loadingIngredients = true;

  constructor(
    private recipeService: RecipeService,
    private router: Router,
    private toastService: PopupService,
  ) {
  }

  ngOnInit() {
    this.loadIngredients();
  }

  private loadIngredients() {
    this.recipeService.getDatabaseState().subscribe(result => {
      if (result) {
        this.recipeService.getIngredients().then(ingredients => {
          this.ingredients = ingredients;
          this.loadingIngredients = false;
        });
      }
    });
  }

  public navigateBack() {
    this.router.navigate(['/recipes']);
  }

  public saveRecipe(recipe) {
    this.recipeService.addRecipe(recipe)
      .catch(() => {
        this.toastService.presentToast('Something went wrong while adding the recipe, try again later');
      })
      .then(() => {
        this.toastService.presentToast('Recipe added');
        this.navigateBack();
      });
  }

}
