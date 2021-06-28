import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ModalController} from '@ionic/angular';
import {IngredientModel} from '../../../models/ingredient.model';
import {PopupService} from '../../../services/popup.service';
import {RecipeService} from '../../../services/recipe.service';

@Component({
  selector: 'app-recipe-ingredient-modal',
  templateUrl: './recipe-ingredient-modal.component.html',
  styleUrls: ['./recipe-ingredient-modal.component.scss'],
})
export class RecipeIngredientModalComponent implements OnInit {

  public measuredIngredientForm = new FormGroup({
    id: new FormControl('', [Validators.required]),
    amount: new FormControl('', [Validators.required]),
    unit: new FormControl(''),
  });

  public ingredients: IngredientModel[];
  private loadingIngredients = true;

  constructor(
    private modalController: ModalController,
    private popupService: PopupService,
    private recipeService: RecipeService
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

  public async addIngredientToRecipe() {
    await this.modalController.dismiss(this.measuredIngredientForm.getRawValue());
  }

  public async openAddIngredient() {
    await this.popupService.showPrompt(
      'Add ingredient',
      'Enter the name of the new ingredient',
      [
        {
          name: 'ingredient',
          placeholder: 'potato',
        }
      ],
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {
            this.addIngredient(data.ingredient);
          }
        }
      ]
    );
  }

  public addIngredient(ingredient: string) {
    this.loadingIngredients = true;
    this.recipeService.addIngredient(ingredient)
      .catch(() => {
        this.popupService.presentToast('Something went wrong when adding the ingredient, try again later');
      })
      .then(() => {
        this.popupService.presentToast('Ingredient added');
        this.loadIngredients();
      });
  }
}
