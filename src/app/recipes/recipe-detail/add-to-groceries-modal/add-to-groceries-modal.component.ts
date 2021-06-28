import {Component, Input, OnInit} from '@angular/core';
import {GroceryListService} from '../../../services/grocery-list.service';
import {GroceryListModel} from '../../../models/grocery-list.model';
import {PopupService} from '../../../services/popup.service';
import {ModalController} from '@ionic/angular';
import {FormArray, FormControl, FormGroup, Validators} from '@angular/forms';
import {RecipeModel} from '../../../models/recipe.model';
import {MeasuredIngredientModel} from '../../../models/measured-ingredient.model';

@Component({
  selector: 'app-add-to-groceries-modal',
  templateUrl: './add-to-groceries-modal.component.html',
  styleUrls: ['./add-to-groceries-modal.component.scss'],
})
export class AddToGroceriesModalComponent implements OnInit {
  public groceryLists: GroceryListModel[];
  public loadingGroceryLists = true;

  @Input() recipe: RecipeModel;

  public groceryListForm = new FormGroup({
    id: new FormControl('', Validators.required),
    ingredients: new FormArray([])
  });

  constructor(
    private groceryListService: GroceryListService,
    private popupService: PopupService,
    private modalController: ModalController,
  ) {
  }

  ngOnInit() {
    this.recipe.ingredients.forEach(ingredient => {
      const ingredientGroup = new FormGroup({
        id: new FormControl(ingredient.id),
        name: new FormControl(ingredient.name),
        amount: new FormControl(ingredient.amount),
        unit: new FormControl(ingredient.unit),
        checked: new FormControl(false),
      });
      (this.groceryListForm.get('ingredients') as FormArray).push(ingredientGroup);
    });
    this.loadGroceryLists();
  }

  public loadGroceryLists() {
    this.groceryListService.getGroceryLists().then(groceryLists => {
      this.groceryLists = groceryLists;
      this.loadingGroceryLists = false;
    }).catch(() => {
      this.popupService.presentToast('Something went wrong when loading the grocery lists, try again later');
    });
  }

  addGroceries() {
    const selectedGroceryList = this.groceryLists.find(groceryList => groceryList.id === this.groceryListForm.get('id').value);
    const ingredients = this.groceryListForm.get('ingredients').value;
    ingredients.forEach(ingredient => {
      if (this.groceryExists(ingredient, selectedGroceryList)) {
        const ingredientIndex = selectedGroceryList.groceries.findIndex(grocery => grocery.id === ingredient.id);
        selectedGroceryList.groceries[ingredientIndex].amount += ingredient.amount;
      } else {
        selectedGroceryList.groceries.push(ingredient);
      }
    });
    this.groceryListService.editGroceryList(selectedGroceryList)
      .catch(() => {
        this.popupService.presentToast(`Something went wrong when saving ${selectedGroceryList.name}`);
      })
      .then(() => {
        this.popupService.presentToast(`Added ingredients to grocery list ${selectedGroceryList.name}`);
        this.modalController.dismiss();
      });
  }

  private groceryExists(ingredient: MeasuredIngredientModel, selectedGroceryList: GroceryListModel): boolean {
    const existingGroceryIndex = selectedGroceryList.groceries.findIndex(grocery => grocery.id === ingredient.id);
    if (existingGroceryIndex !== null) {
      if (selectedGroceryList.groceries[existingGroceryIndex].unit === ingredient.unit) {
        selectedGroceryList.groceries[existingGroceryIndex].amount += ingredient.amount;
        return true;
      }
    }
    return false;
  }

  removeIngredient(ingredient: MeasuredIngredientModel) {
    let ingredientIndex = -1;
    (this.groceryListForm.get('ingredients') as FormArray).controls.forEach((control, index) => {
      if (control.value.id === ingredient.id) {
        ingredientIndex = index;
      }
    });
    if (ingredientIndex !== -1) {
      (this.groceryListForm.get('ingredients') as FormArray).removeAt(ingredientIndex);
    }
    if (this.groceryListForm.get('ingredients').value.length === 0) {
      this.popupService.presentToast('No more ingredients to add!');
      this.modalController.dismiss();
    }
  }

  getExistingGroceries(): MeasuredIngredientModel[] {
    if (this.groceryListForm.get('id').value === '') {
      return [];
    }
    return this.groceryLists.find(groceryList => groceryList.id === this.groceryListForm.get('id').value).groceries;
  }
}
