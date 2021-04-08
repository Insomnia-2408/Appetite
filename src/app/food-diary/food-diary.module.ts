import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FoodDiaryPageRoutingModule } from './food-diary-routing.module';

import { FoodDiaryPage } from './food-diary.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FoodDiaryPageRoutingModule
  ],
  declarations: [FoodDiaryPage]
})
export class FoodDiaryPageModule {}
