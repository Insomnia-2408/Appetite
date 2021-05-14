import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {DatabaseService} from '../../services/database.service';
import {IngredientModel} from '../../models/ingredient.model';
import {ToastService} from '../../services/toast.service';

@Component({
  selector: 'app-add-recipe',
  templateUrl: './add-recipe.component.html',
  styleUrls: ['./add-recipe.component.scss'],
})
export class AddRecipeComponent implements OnInit {

  public recipeForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    instructions: new FormControl('', [Validators.required]),
    imageUrl: new FormControl(''),
    servings: new FormControl(''),
    ingredients: new FormArray([])
  });

  public ingredients: IngredientModel[];
  public loadingIngredients = true;

  constructor(
    private databaseService: DatabaseService,
    private router: Router,
    private toastService: ToastService,
  ) {
  }

  ngOnInit() {
    this.loadIngredients();
  }

  private loadIngredients() {
    this.databaseService.getDatabaseState().subscribe(result => {
      if (result) {
        this.databaseService.getIngredients().then(ingredients => {
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
    this.databaseService.addRecipe(recipe)
      .catch(() => {
        this.toastService.presentToast('Something went wrong while adding the recipe, try again later');
      })
      .then(() => {
        this.toastService.presentToast('Recipe added');
        this.navigateBack();
      });
  }

}
