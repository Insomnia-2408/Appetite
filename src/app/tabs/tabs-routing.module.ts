import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'recipes'
      },
      {
        path: 'recipes',
        loadChildren: () => import('../recipes/recipes.module').then(m => m.RecipesPageModule)
      },
      {
        path: 'grocery-list',
        loadChildren: () => import('../grocery-list/grocery-list.module').then(m => m.GroceryListPageModule)
      },
      {
        path: 'food-diary',
        loadChildren: () => import('../food-diary/food-diary.module').then(m => m.FoodDiaryPageModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
