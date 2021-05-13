import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RecipesPageRoutingModule } from './recipes-routing.module';

import { RecipesPage } from './recipes.page';
import {AddRecipeComponent} from './add-recipe/add-recipe.component';
import {FlexModule} from '@angular/flex-layout';
import {RecipeIngredientModalComponent} from './add-recipe/recipe-ingredient-modal/recipe-ingredient-modal.component';
import {RecipeDetailComponent} from './recipe-detail/recipe-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RecipesPageRoutingModule,
    ReactiveFormsModule,
    FlexModule,
  ],
  declarations: [
    RecipesPage,
    AddRecipeComponent,
    RecipeDetailComponent,
    RecipeIngredientModalComponent,
  ]
})
export class RecipesPageModule {}
