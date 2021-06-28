import { Component, OnInit } from '@angular/core';
import {GroceryListService} from '../services/grocery-list.service';
import {GroceryListModel} from '../models/grocery-list.model';
import {Router} from '@angular/router';

@Component({
  selector: 'app-grocery-list',
  templateUrl: './grocery-list.page.html',
  styleUrls: ['./grocery-list.page.scss'],
})
export class GroceryListPage implements OnInit {

  public groceryLists: GroceryListModel[];
  public loadingGroceryLists = true;

  constructor(
    private groceryListService: GroceryListService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.loadGroceryLists();
  }

  public loadGroceryLists() {
    this.groceryListService.getDatabaseState().subscribe(result => {
      if (result) {
        this.groceryListService.getGroceryLists().then(groceryLists => {
          this.groceryLists = groceryLists;
          this.loadingGroceryLists = false;
        });
      }
    });
  }

  ionViewWillEnter() {
    this.loadGroceryLists();
  }
}
