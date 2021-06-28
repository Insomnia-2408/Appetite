import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {RecipeIngredientModalComponent} from './recipe-ingredient-modal/recipe-ingredient-modal.component';
import {ModalController} from '@ionic/angular';
import {IngredientModel} from '../../models/ingredient.model';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {MeasuredIngredientModel} from '../../models/measured-ingredient.model';
import {RecipeModel} from '../../models/recipe.model';
import {ImageService} from '../../services/image.service';
import {RecipeService} from '../../services/recipe.service';

@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.scss'],
})
export class RecipeFormComponent implements OnInit {

  public recipeForm = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
    instructions: new FormControl('', [Validators.required]),
    imageUrl: new FormControl(''),
    servings: new FormControl(''),
    ingredients: new FormArray([])
  });

  @Input() recipeIn: RecipeModel;
  @Output() recipeOut: EventEmitter<RecipeModel> = new EventEmitter();

  public ingredients: IngredientModel[];
  public loadingIngredients = true;

  constructor(
    private modalController: ModalController,
    private recipeService: RecipeService,
    private imageService: ImageService
  ) {
  }

  ngOnInit() {
    this.loadIngredients();
    if (this.recipeIn) {
      this.recipeForm.patchValue(this.recipeIn);
      this.recipeIn.ingredients.forEach(ingredient => {
        this.addIngredientToRecipe(ingredient);
      });
    }
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

  public addIngredientToRecipe(data) {
    (this.recipeForm.controls.ingredients as FormArray).push(new FormGroup({
      id: new FormControl(data.id, Validators.required),
      amount: new FormControl(data.amount, Validators.required),
      unit: new FormControl(data.unit),
    }));
  }

  public getRecipeIngredients(): MeasuredIngredientModel[] {
    return this.recipeForm.controls.ingredients.value;
  }

  public getIngredient(ingredientId: any) {
    return this.ingredients.find(ingredient => ingredient.id === ingredientId).name;
  }

  public emitRecipe() {
    this.recipeOut.emit(this.recipeForm.getRawValue());
  }

  public getImage() {
    return this.recipeForm.controls.imageUrl.value ? this.recipeForm.controls.imageUrl.value : this.imageService.getDefaultImage();
  }

  public removeIngredient(ingredient: MeasuredIngredientModel) {
    const index = this.recipeForm.controls.ingredients.value.findIndex(existingIngredient => existingIngredient.id === ingredient.id);
    (this.recipeForm.controls.ingredients as FormArray).removeAt(index);
  }

  public cancel() {
    this.recipeOut.emit(null);
  }
}
