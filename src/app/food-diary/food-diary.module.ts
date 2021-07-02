import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { FoodDiaryPageRoutingModule } from './food-diary-routing.module';

import { FoodDiaryPage } from './food-diary.page';
import {NgCalendarModule} from 'ionic2-calendar';
import {FlexModule} from '@angular/flex-layout';
import {AddDiaryEntryModalComponent} from './add-diary-entry-modal/add-diary-entry-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FoodDiaryPageRoutingModule,
    NgCalendarModule,
    FlexModule,
    ReactiveFormsModule,
  ],
  declarations: [
    FoodDiaryPage,
    AddDiaryEntryModalComponent,
  ]
})
export class FoodDiaryPageModule {}
