import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {RecipesPage} from './recipes.page';
import {AddRecipeComponent} from './add-recipe/add-recipe.component';

const routes: Routes = [
  {
    path: '',
    component: RecipesPage,
  },
  {
    path: 'add-recipe',
    component: AddRecipeComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RecipesPageRoutingModule {
}
