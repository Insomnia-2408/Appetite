import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {DatabaseService} from '../../services/database.service';
import {IngredientModel} from '../../models/ingredient.model';
import {ModalController, ToastController} from '@ionic/angular';
import {RecipeIngredientModalComponent} from './recipe-ingredient-modal/recipe-ingredient-modal.component';
import {MeasuredIngredientModel} from '../../models/measured-ingredient.model';

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
    private toastController: ToastController,
    private modalController: ModalController
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

  public addIngredientToRecipe(data) {
    const ingredients = this.recipeForm.controls.ingredients as FormArray;
    ingredients.push(new FormGroup({
      id: new FormControl(data.ingredient, Validators.required),
      amount: new FormControl(data.amount, Validators.required),
      unit: new FormControl(data.unit),
    }));
    this.recipeForm.controls.ingredients.setValue(ingredients);
  }

  public async openAddIngredientToRecipe() {
    const modal = await this.modalController.create({
      component: RecipeIngredientModalComponent,
    });
    modal.onDidDismiss().then((result) => {
      if (result.data !== null) {
        this.loadingIngredients = true;
        this.loadIngredients();
        this.addIngredientToRecipe(result.data);
      }
    });
    return await modal.present();
  }

  public getRecipeIngredients(): MeasuredIngredientModel[] {
    return this.recipeForm.controls.ingredients.value;
  }

  public getIngredient(ingredientId: any) {
    return this.ingredients.find(ingredient => ingredient.id === ingredientId).name;
  }

  public saveRecipe() {
    const recipe = this.recipeForm.getRawValue();
    this.databaseService.addRecipe(recipe)
      .catch(() => {
        this.presentToast('Something went wrong while adding the recipe, try again later');
      })
      .then(() => {
        this.presentToast('Recipe added');
        this.navigateBack();
      });
  }

  public async presentToast(message) {
    const toast = await this.toastController.create({
      message,
      duration: 2000
    });
    await toast.present();
  }
}
