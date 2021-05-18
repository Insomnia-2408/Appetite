import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormArray, FormControl, FormGroup, Validators} from "@angular/forms";
import {GroceryListModel} from "../../models/grocery-list.model";
import {IngredientModel} from "../../models/ingredient.model";
import {GroceryListService} from "../../services/grocery-list.service";
import {PopupService} from "../../services/popup.service";

@Component({
  selector: 'app-grocery-list-form',
  templateUrl: './grocery-list-form.component.html',
  styleUrls: ['./grocery-list-form.component.scss'],
})
export class GroceryListFormComponent implements OnInit {

  public groceryListForm = new FormGroup({
    id: new FormControl(''),
    name: new FormControl('', [Validators.required]),
    groceries: new FormArray([])
  });

  @Input() groceryListIn: GroceryListModel;
  @Output() groceryListOut: EventEmitter<GroceryListModel> = new EventEmitter<GroceryListModel>();

  public ingredients: IngredientModel[];
  public loadingIngredients = true;

  constructor(
    private groceryListService: GroceryListService,
    private popupService: PopupService,
  ) { }

  ngOnInit() {
    this.loadIngredients();
    if (this.groceryListIn) {
      this.groceryListForm.patchValue(this.groceryListIn);
      this.groceryListIn.groceries.forEach(ingredient => {
        this.addIngredientToGroceryList(ingredient);
      });
    }
  }

  public loadIngredients() {
    this.groceryListService.getDatabaseState().subscribe(result => {
      if (result) {
        this.groceryListService.getIngredients().then(ingredients => {
          this.ingredients = ingredients;
          this.loadingIngredients = false;
        });
      }
    });
  }

  private addIngredientToGroceryList(data?) {
    (this.groceryListForm.controls.groceries as FormArray).push(new FormGroup({
      id: new FormControl(data ? data.id : '', Validators.required),
      amount: new FormControl(data ? data.amount : '', Validators.required),
      unit: new FormControl(data ? data.unit : ''),
      checked: new FormControl(data ? data.checked : false),
    }));
  }

  public emitGroceryList() {
    this.groceryListOut.emit(this.groceryListForm.getRawValue());
  }

  public cancel() {
    this.groceryListOut.emit(null);
  }

  public removeGrocery(index: number) {
    (this.groceryListForm.controls.groceries as FormArray).removeAt(index);
  }

  public getIngredientName(controlIndex: any):string {
    if (!this.ingredients || !controlIndex) {
      return '';
    }
    const ingredientId = this.groceryListForm.controls.groceries.value[controlIndex].id;
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
            this.addIngredient(data.ingredient)
          }
        }
      ]
    );
  }

  public addIngredient(ingredient: string) {
    this.loadingIngredients = true;
    this.groceryListService.addIngredient(ingredient)
      .catch(() => {
        this.popupService.presentToast('Something went wrong when adding the ingredient, try again later');
      })
      .then(() => {
        this.popupService.presentToast('Ingredient added');
        this.loadIngredients();
      });
  }

  public getGroceryList(): GroceryListModel {
    return this.groceryListForm.getRawValue();
  }
}
