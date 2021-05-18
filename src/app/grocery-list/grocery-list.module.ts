import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { GroceryListPageRoutingModule } from './grocery-list-routing.module';

import { GroceryListPage } from './grocery-list.page';
import {AddGroceryListComponent} from "./add-grocery-list/add-grocery-list.component";
import {GroceryListFormComponent} from "./grocery-list-form/grocery-list-form.component";
import {FlexModule} from "@angular/flex-layout";
import {GroceryListDetailComponent} from "./grocery-list-detail/grocery-list-detail.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    GroceryListPageRoutingModule,
    ReactiveFormsModule,
    FlexModule,
  ],
  declarations: [
    GroceryListPage,
    AddGroceryListComponent,
    GroceryListFormComponent,
    GroceryListDetailComponent,
  ]
})
export class GroceryListPageModule {}
