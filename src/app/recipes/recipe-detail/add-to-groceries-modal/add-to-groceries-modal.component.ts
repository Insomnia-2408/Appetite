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
      const duplicateIngredientIndex = selectedGroceryList.groceries
        .findIndex(grocery => grocery.id === ingredient.id && grocery.unit === ingredient.id);
      if (duplicateIngredientIndex !== -1) {
        selectedGroceryList.groceries[duplicateIngredientIndex].amount += ingredient.amount;
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

  private resolveDuplicateIngredients(
    ingredientToCheck: MeasuredIngredientModel,
    ingredients: MeasuredIngredientModel[]
  ): MeasuredIngredientModel {
    const duplicates = ingredients.filter(ingredient => ingredient.id === ingredientToCheck.id);
    if (duplicates.length === 0) {
      return ingredientToCheck;
    }
    duplicates.forEach(async duplicate => {
      if (duplicate.unit === ingredientToCheck.unit) {
        ingredientToCheck.amount += duplicate.amount;
      } else {
        await this.popupService.showPrompt(
          'Duplicate ingredient',
          `Duplicates of ingredient ${duplicate.name} with different unit were found, it cannot be added automatically. ` +
          `Amount: ${duplicate.amount}, unit: ${duplicate.unit}`,
          [],
          [
            {
              text: 'Understood',
            }
          ]
        );
      }
    });
    return ingredientToCheck;
  }

  public async openAddGroceryList() {
    await this.popupService.showPrompt(
      'Add grocery list',
      'Enter the name of the new grocery-list',
      [
        {
          name: 'groceryList',
          type: 'text',
          placeholder: 'Dinner',
        }
      ],
      [
        {
          text: 'Cancel',
        },
        {
          text: 'Save',
          handler: data => {
            this.addGroceryList(data.groceryList);
          }
        }
      ]
    );
  }

  private addGroceryList(groceryListName: string) {
    this.groceryListService.addEmptyGroceryList(groceryListName)
      .catch(() => {
        this.popupService.presentToast('Something went wrong when adding the grocery list, try again later');
      })
      .then(() => {
        this.popupService.presentToast('Grocery list created');
        this.loadingGroceryLists = true;
        this.loadGroceryLists();
      });
  }
}
