import {MeasuredIngredientModel} from './measured-ingredient.model';

export class FoodDiaryModel {
  id: number;
  createdDatetime: Date;
  diaryEntries: Array<MeasuredIngredientModel>;
  notes: string;
}
