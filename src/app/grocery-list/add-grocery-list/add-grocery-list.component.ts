import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {GroceryListService} from "../../services/grocery-list.service";
import {IngredientModel} from "../../models/ingredient.model";
import {GroceryListModel} from "../../models/grocery-list.model";
import {PopupService} from "../../services/popup.service";

@Component({
  selector: 'app-add-grocery-list',
  templateUrl: './add-grocery-list.component.html',
  styleUrls: ['./add-grocery-list.component.scss'],
})
export class AddGroceryListComponent implements OnInit {

  public ingredients: IngredientModel[];
  public loadingIngredients = true;

  constructor(
    private router: Router,
    private groceryListService: GroceryListService,
    private toastService: PopupService,
  ) { }

  ngOnInit() {
    this.loadIngredients();
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

  public navigateBack() {
    this.router.navigate(['/grocery-list']);
  }

  public saveGroceryList(groceryList: GroceryListModel) {
    this.groceryListService.addGroceryList(groceryList)
      .catch(() => {
        this.toastService.presentToast('Something went wrong when adding the grocery list, try again later');
      })
      .then(() => {
        this.toastService.presentToast('Added grocery list');
        this.navigateBack();
      })
  }
}
