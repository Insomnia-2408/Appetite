import {Component, Input, OnInit} from '@angular/core';
import {ModalController} from '@ionic/angular';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {PopupService} from '../../services/popup.service';
import {FoodDiaryService} from '../../services/food-diary.service';
import {IngredientModel} from '../../models/ingredient.model';

@Component({
  selector: 'app-add-diary-entry-modal',
  templateUrl: './add-diary-entry-modal.component.html',
  styleUrls: ['./add-diary-entry-modal.component.scss'],
})
export class AddDiaryEntryModalComponent implements OnInit {

  public loadingIngredients = true;
  public ingredients: IngredientModel[] = [];

  public diaryEntryForm = new FormGroup({
    ingredients: new FormArray([])
  });

  @Input() foodDiaryId: number;

  constructor(
    private modalController: ModalController,
    private popupService: PopupService,
    private foodDiaryService: FoodDiaryService,
  ) {
  }

  ngOnInit() {
    this.loadIngredients();
  }

  public loadIngredients() {
    this.foodDiaryService.getDatabaseState().subscribe(result => {
      if (result) {
        this.foodDiaryService.getIngredients().then(ingredients => {
          this.ingredients = ingredients;
          this.loadingIngredients = false;
        });
      }
    });
  }

  public addDiaryEntry() {
    (this.diaryEntryForm.get('ingredients') as FormArray).push(new FormGroup({
      id: new FormControl('', [Validators.required]),
      amount: new FormControl('', [Validators.required]),
      unit: new FormControl(''),
    }));
  }

  public addIngredient(ingredient: string) {
    this.loadingIngredients = true;
    this.foodDiaryService.addIngredient(ingredient)
      .catch(() => {
        this.popupService.presentToast('Something went wrong when adding the ingredient, try again later');
      })
      .then(() => {
        this.popupService.presentToast('Ingredient added');
        this.loadIngredients();
      });
  }

  public getIngredientName(controlIndex: any): string {
    if (this.ingredients.length === 0 || controlIndex === null) {
      return '';
    }
    const ingredientId = this.diaryEntryForm.controls.ingredients.value[controlIndex].id;
    return this.ingredients.find(ingredient => ingredient.id === ingredientId)?.name;
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

  public removeIngredient(index: number) {
    (this.diaryEntryForm.get('ingredients') as FormArray).removeAt(index);
  }

  public saveFoodDiary() {
    const data = this.diaryEntryForm.getRawValue();
    if (data.ingredients.length === 0) {
      this.popupService.presentToast('Nothing to add!');
      this.modalController.dismiss();
    }
    this.foodDiaryService.addFoodDiaryEntries(this.foodDiaryId, data.ingredients)
      .catch(() => {
        this.popupService.presentToast('Something went wrong when updating the food diary, please try again later');
        this.modalController.dismiss();
      })
      .then(() => {
        this.modalController.dismiss();
      });
  }
}
