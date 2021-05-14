import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {AlertController, ModalController} from '@ionic/angular';
import {DatabaseService} from '../../../services/database.service';
import {IngredientModel} from '../../../models/ingredient.model';
import {ToastService} from '../../../services/toast.service';

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
    private alertController: AlertController,
    private toastService: ToastService,
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
    await this.modalController.dismiss(this.measuredIngredientForm.getRawValue());
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
        this.toastService.presentToast('Something went wrong when adding the ingredient, try again later');
      })
      .then(() => {
        this.toastService.presentToast('Ingredient added');
        this.loadIngredients();
      });
  }
}
