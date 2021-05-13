import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {RecipesPage} from './recipes.page';
import {AddRecipeComponent} from './add-recipe/add-recipe.component';
import {RecipeDetailComponent} from './recipe-detail/recipe-detail.component';

const routes: Routes = [
  {
    path: '',
    component: RecipesPage,
  },
  {
    path: 'add-recipe',
    component: AddRecipeComponent
  },
  {
    path: ':id',
    component: RecipeDetailComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipesPageRoutingModule {
}
