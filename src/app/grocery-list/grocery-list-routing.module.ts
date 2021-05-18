import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { GroceryListPage } from './grocery-list.page';
import {AddGroceryListComponent} from "./add-grocery-list/add-grocery-list.component";
import {GroceryListDetailComponent} from "./grocery-list-detail/grocery-list-detail.component";

const routes: Routes = [
  {
    path: '',
    component: GroceryListPage
  },
  {
    path: 'add-grocery-list',
    component: AddGroceryListComponent
  },
  {
    path: ':id',
    component: GroceryListDetailComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GroceryListPageRoutingModule {}
