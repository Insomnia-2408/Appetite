import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AlertController, ModalController, ToastController} from '@ionic/angular';
import {DatabaseService} from '../../../services/database.service';
import {IngredientModel} from '../../../models/ingredient.model';

@Component({
  selector: 'app-recipe-ingredient-modal',
  templateUrl: './recipe-ingredient-modal.component.html',
  styleUrls: ['./recipe-ingredient-modal.component.scss'],
})
export class RecipeIngredientModalComponent implements OnInit {

  public measuredIngredientForm = new FormGroup({
    ingredient: new FormControl('', [Validators.required]),
    amount: new FormControl('', [Validators.required]),
    unit: new FormControl(''),
  });

  public ingredients: IngredientModel[];
  private loadingIngredients = true;

  constructor(
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private databaseService: DatabaseService
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

  public async addIngredientToRecipe() {
   await this.modalController.dismiss({
      ingredient: this.measuredIngredientForm.controls.ingredient.value,
      amount: this.measuredIngredientForm.controls.amount.value,
      unit: this.measuredIngredientForm.controls.unit.value,
    });
  }

  public async openAddIngredient() {
    const prompt = await this.alertController.create({
      header: 'Add ingredient',
      message: 'Enter the name of the new ingredient',
      inputs: [
        {
          name: 'ingredient',
          placeholder: 'Potato',
        },
      ],
      buttons: [
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
    });
    prompt.present();
  }

  public addIngredient(ingredient: string) {
    this.loadingIngredients = true;
    this.databaseService.addIngredient(ingredient)
      .catch(() => {
        this.presentToast('Something went wrong when adding the ingredient, try again later');
      })
      .then(() => {
        this.presentToast('Ingredient added');
        this.loadIngredients();
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